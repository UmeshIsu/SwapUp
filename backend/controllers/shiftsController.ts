import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/shifts/my-shifts
export const getMyShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = req.user!.id;
        const { startDate, endDate } = req.query;

        const where: any = { employeeId };
        
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        const shifts = await prisma.shift.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
};

// GET /api/shifts/colleagues?date=YYYY-MM-DD
export const getColleagues = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.query;
        const { id: myId, department } = req.user!;

        if (!date) {
            res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
            return;
        }

        const targetDate = new Date(date as string);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Get users in same department (excluding self) who have a shift on that date
        const shifts = await prisma.shift.findMany({
            where: {
                date: { gte: dayStart, lte: dayEnd },
                employee: {
                    department: department as any,
                    id: { not: myId },
                    role: 'EMPLOYEE',
                },
            },
            include: {
                employee: {
                    select: { id: true, name: true, role: true },
                },
            },
        });

        const colleagues = shifts.map((s: any) => ({
            shiftId: s.id,
            employeeId: s.employee.id,
            name: s.employee.name,
            role: s.employee.role,
            startTime: s.startTime,
            endTime: s.endTime,
        }));

        res.json(colleagues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch colleagues' });
    }
};

// POST /api/shifts/bulk
export const bulkCreateShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shifts } = req.body;
        const managerId = req.user!.id;

        if (!Array.isArray(shifts) || shifts.length === 0) {
            res.status(400).json({ error: 'shifts must be a non-empty array' });
            return;
        }

        // Extract unique dates from the shifts to clear them first
        const datesToClear = [...new Set(shifts.map((s: any) => new Date(s.date).toISOString().split('T')[0]))];

        // 1. Get tenant name for location
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user!.tenantId },
            select: { companyName: true }
        });
        const location = tenant?.companyName || 'Unknown Location';

        // 2. Get unique employee roles/departments for this batch
        const employeeIds = [...new Set(shifts.map((s: any) => s.employeeId))];
        const employees = await prisma.user.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true, role: true, department: true }
        });
        const employeeMap = Object.fromEntries(employees.map(e => [e.id, e]));

        // Helper to determine shift type
        const getShiftType = (startTime: Date) => {
            const hours = startTime.getHours();
            if (hours >= 4 && hours < 12) return 'Morning';
            if (hours >= 12 && hours < 20) return 'Afternoon';
            return 'Night';
        };

        await prisma.$transaction(async (tx) => {
            // 1. Delete existing shifts for these dates created by this manager
            await tx.shift.deleteMany({
                where: {
                    createdBy: managerId,
                    date: {
                        in: datesToClear.map(d => new Date(d)),
                    },
                },
            });

            // 2. Create new shifts
            await Promise.all(
                shifts.map((s: any) => {
                    const startDate = new Date(s.startTime);
                    const emp = employeeMap[s.employeeId];
                    
                    return tx.shift.create({
                        data: {
                            date: new Date(s.date),
                            startTime: startDate,
                            endTime: new Date(s.endTime),
                            employeeId: s.employeeId,
                            createdBy: managerId,
                            instructions: s.instructions || '',
                            type: getShiftType(startDate),
                            location: location,
                            role: emp?.department || 'Staff', // Use department as the role if job role is not defined
                        },
                    });
                })
            );
        });

        res.status(201).json({ message: `${shifts.length} shifts published successfully` });
    } catch (error) {
        console.error('bulkCreateShifts error:', error);
        res.status(500).json({ error: 'Failed to publish shifts' });
    }
};

// GET /api/shifts/today
export const getTodayShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = req.user!.id;
        const now = new Date();
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(now);
        dayEnd.setHours(23, 59, 59, 999);

        const shift = await prisma.shift.findFirst({
            where: {
                employeeId,
                date: { gte: dayStart, lte: dayEnd },
            },
        });

        res.json({ shift });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today\'s shift' });
    }
};

// GET /api/shifts/export
export const exportToICS = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = req.user!.id;
        const { startDate, endDate } = req.query;

        const where: any = { employeeId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        const shifts = await prisma.shift.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        const formatICSDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Swapup//Shift Schedule//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
        ].join('\r\n') + '\r\n';

        shifts.forEach((shift) => {
            const start = new Date(shift.startTime);
            const end = new Date(shift.endTime);
            const now = new Date();

            icsContent += [
                'BEGIN:VEVENT',
                `UID:${shift.id}@swapup.com`,
                `DTSTAMP:${formatICSDate(now)}`,
                `DTSTART:${formatICSDate(start)}`,
                `DTEND:${formatICSDate(end)}`,
                `SUMMARY:Work Shift (${shift.type || 'Standard'})`,
                `DESCRIPTION:Roster shift at Swapup. ${shift.instructions || ''}`,
                'END:VEVENT',
            ].join('\r\n') + '\r\n';
        });

        icsContent += 'END:VCALENDAR';

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="schedule.ics"');
        res.send(icsContent);
    } catch (error) {
        console.error('exportToICS error:', error);
        res.status(500).json({ error: 'Failed to export schedule' });
    }
};
