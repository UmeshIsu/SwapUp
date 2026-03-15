import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../services/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    try {
        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                workerId: true,
                phone: true,
                department: true,
                avatarUrl: true,
                availabilityPreferences: true,
                plan: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, phone, availabilityPreferences } = req.body;
    const userId = req.user!.userId;

    try {
        const updatedUser = await (prisma as any).user.update({
            where: { id: userId },
            data: {
                name,
                email,
                phone,
                availabilityPreferences,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                workerId: true,
                phone: true,
                availabilityPreferences: true,
                plan: true,
            },
        });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!oldPassword || !newPassword) {
        res.status(400).json({ message: "Old password and new password are required" });
        return;
    }

    if (newPassword.length < 8) {
        res.status(400).json({ message: "New password must be at least 8 characters" });
        return;
    }

    if (!/\d/.test(newPassword)) {
        res.status(400).json({ message: "New password must include at least one number" });
        return;
    }

    if (oldPassword === newPassword) {
        res.status(400).json({ message: "New password must be different from old password" });
        return;
    }

    try {
        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            res.status(400).json({ message: "Incorrect old password" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await (prisma as any).user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: "Password changed successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
