import { Response } from "express";
import prisma from "../services/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyShifts = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    try {
        const where: any = { userId };

        // Efficient month fetch for the logged-in employee only.
        if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 1);
            where.date = { gte: start, lt: end };
        }

        const shifts = await prisma.shift.findMany({
            where,
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                instructions: true,
                type: true,
                location: true,
            },
            orderBy: { date: "asc" },
        });

        res.json(shifts);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getShiftById = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    try {
        const shift = await prisma.shift.findFirst({
            where: { id, userId },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                instructions: true,
                type: true,
                location: true,
            },
        });

        if (!shift) {
            res.status(404).json({ message: "Shift not found" });
            return;
        }

        res.json(shift);
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
