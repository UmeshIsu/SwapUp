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
