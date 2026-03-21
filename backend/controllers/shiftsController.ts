import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/shifts/my-shifts
export const getMyShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = req.user!.id;

        const shifts = await prisma.shift.findMany({
            where: { employeeId },
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

// PUT /api/shifts/:id/check-out
export const checkOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const employeeId = req.user!.id;

        const shift = await prisma.shift.findUnique({
            where: { id }
        });

        if (!shift) {
            res.status(404).json({ error: 'Shift not found' });
            return;
        }

        if (shift.employeeId !== employeeId) {
            res.status(403).json({ error: 'Not authorized for this shift' });
            return;
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId: employeeId,
                status: 'CHECKOUT',
                lat: req.body.lat || 0,
                lng: req.body.lng || 0,
                accuracy: req.body.accuracy || 0,
                rejectReason: id
            }
        });

        res.json({ message: 'Checked out successfully', attendance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process checkout' });
    }
};
