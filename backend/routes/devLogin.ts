// -------------------------------------------------------
// devLogin.ts  (TEMPORARY — remove once real auth is merged)
// POST /api/dev-login   { workerId: "E-C-001" }
// Returns a signed JWT for the matching user so the app
// can be tested without the full authentication flow.
// -------------------------------------------------------

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const router = Router();

router.post('/dev-login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { workerId } = req.body;

        if (!workerId) {
            res.status(400).json({ error: 'workerId is required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { workerId } });

        if (!user) {
            res.status(404).json({ error: `No user found with workerId "${workerId}"` });
            return;
        }

        const payload = {
            id: user.id,
            employeeId: user.workerId,
            name: user.name,
            department: user.department,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'swapup_jwt_secret_key', {
            expiresIn: '7d',
        });

        res.json({
            token,
            user: payload,
        });
    } catch (error: any) {
        console.error('─── DEV LOGIN ERROR ───');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Dev login failed', details: error.message });
    }
});

export default router;
