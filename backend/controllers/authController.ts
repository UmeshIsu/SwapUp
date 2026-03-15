import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma";

export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role, workerId, phone, tenantId } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: "Name, email and password are required" });
        return;
    }

    if (password.length < 8) {
        res.status(400).json({ message: "Password must be at least 8 characters" });
        return;
    }

    if (!/\d/.test(password)) {
        res.status(400).json({ message: "Password must include at least one number" });
        return;
    }

    try {
        const existingUser = await (prisma as any).user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await (prisma as any).user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: (role?.toUpperCase() === "MANAGER" ? "MANAGER" : "EMPLOYEE"),
                workerId,
                phone: phone || `+94${Math.floor(Math.random() * 1000000000)}`, // Fallback for demo
                tenantId: tenantId || (await (prisma as any).tenant.findFirst())?.id, // Fallback to first tenant
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                workerId: user.workerId,
                phone: user.phone,
                availabilityPreferences: user.availabilityPreferences,
                plan: user.plan,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await (prisma as any).user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                workerId: user.workerId,
                phone: user.phone,
                availabilityPreferences: user.availabilityPreferences,
                plan: user.plan,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
