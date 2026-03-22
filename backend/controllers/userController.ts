import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db";
import { supabase } from "../config/supabaseClient";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
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

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
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

export const changePassword = async (req: Request, res: Response): Promise<void> => {
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
            select: { password: true, email: true },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Verify old password via Supabase Auth (same method used for login)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
        });

        if (signInError) {
            console.warn(`[CHANGE_PASSWORD] Old password verification failed for ${user.email}:`, signInError.message);
            res.status(400).json({ message: "Incorrect old password" });
            return;
        }

        // 1. Update password in Supabase Auth (login authenticates against Supabase)
        const { data: supaUsers } = await supabase.auth.admin.listUsers();
        const supaUser = supaUsers.users.find((u: any) => u.email === user.email);

        if (supaUser) {
            const { error: supaError } = await supabase.auth.admin.updateUserById(supaUser.id, {
                password: newPassword,
            });

            if (supaError) {
                console.error("[CHANGE_PASSWORD] Supabase update failed:", supaError.message);
                res.status(500).json({ message: "Failed to update password in auth system" });
                return;
            }
            console.log(`[CHANGE_PASSWORD] Supabase Auth password updated for ${user.email}`);
        } else {
            console.warn(`[CHANGE_PASSWORD] User ${user.email} not found in Supabase Auth`);
        }

        // 2. Update password in local Prisma DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await (prisma as any).user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        console.log(`[CHANGE_PASSWORD] Prisma DB password updated for ${user.email}`);
        res.json({ message: "Password changed successfully" });
    } catch (error: any) {
        console.error("[CHANGE_PASSWORD] Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

