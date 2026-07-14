import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { prisma } from './config/prisma';

import shiftRoutes from './routes/shifts';
import featureShiftRoutes from './routes/shiftRoutes';
import userRoutes from './routes/userRoutes';
import swapRequestRoutes from './routes/swapRequests';
import chatRoutes from './routes/chatRoutes';
import devLoginRoutes from './routes/devLogin';
import authRoutes from './routes/authRoutes';
import leaveRoutes from './routes/leaveRoutes';
import attendanceRoutes from './routes/attendance';
import rosterRoutes from './routes/rosterRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { checkFatigueAndNotify } from './jobs/fatigueNotifier';
import { handleChatMessageNotification } from './services/notificationService';

// ─── Typed Socket.IO event maps ───────────────────────────────────────────────

interface ClientToServerEvents {
    join_room: (conversationId: string) => void;
    leave_room: (conversationId: string) => void;
    send_message: (payload: {
        conversationId: string;
        senderId: string;
        content: string;
        type?: 'TEXT' | 'SWAP_REQUEST';
    }) => void;
}

interface ServerToClientEvents {
    new_message: (msg: {
        id: string;
        conversationId: string;
        senderId: string;
        senderName: string;
        senderAvatar: string | null;
        content: string;
        type: string;
        createdAt: string;
        swapRequest: null;
    }) => void;
    swap_status_updated: (payload: {
        swapRequestId: string;
        status: string;
        conversationId: string;
    }) => void;
    new_notification: (notification: {
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
        createdAt: string;
    }) => void;
    error: (payload: { message: string }) => void;
}

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: FRONTEND_ORIGIN
            ? FRONTEND_ORIGIN.split(',').map((s) => s.trim())
            : '*',
        credentials: true,
    },
});

app.use(
    cors({
        origin: FRONTEND_ORIGIN
            ? FRONTEND_ORIGIN.split(',').map((s) => s.trim())
            : true,
        credentials: true,
    })
);
app.use(express.json());
app.set('io', io);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'SWAPUP Backend is successfully running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/shifts', featureShiftRoutes);
app.use('/api/swap-requests', swapRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', devLoginRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────

// Identify the connecting user from their JWT so we can target notifications
// at them individually via a private `user:<id>` room.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'swapup_jwt_secret_key'
            ) as any;
            (socket as any).userId = decoded.id || decoded.userId;
        } catch {
            // Invalid/expired token — allow the connection (chat still works),
            // just without personal notification delivery.
        }
    }
    next();
});

io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        const userId = (socket as any).userId;
        if (userId) socket.join(`user:${userId}`);

        socket.on('join_room', (conversationId: string) => socket.join(conversationId));
        socket.on('leave_room', (conversationId: string) => socket.leave(conversationId));

        socket.on('send_message', async ({ conversationId, senderId, content, type = 'TEXT' }: { conversationId: string; senderId: string; content: string; type?: string }) => {
            try {
                const msg = await prisma.message.create({
                    data: { conversationId, senderId, content, type: type as any },
                    include: { sender: true },
                }) as any;

                io.to(conversationId).emit('new_message', {
                    id: msg.id,
                    conversationId: msg.conversationId,
                    senderId: msg.senderId,
                    senderName: msg.sender.name,
                    senderAvatar: msg.sender.avatarUrl,
                    content: msg.content,
                    type: msg.type,
                    createdAt: msg.createdAt.toISOString(),
                    swapRequest: null,
                });

                // Notify recipient(s) and the sender's manager about the message
                if (type === 'TEXT') {
                    await handleChatMessageNotification(io, senderId, conversationId, content);
                }
            } catch (err) {
                socket.emit('error', { message: (err as Error).message });
            }
        });
    },
);

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SwapUp API + Socket.io running on port ${PORT}`);
});

// Periodically check for employees working unhealthy hours and notify their manager.
const FATIGUE_CHECK_INTERVAL_MS = 2 * 60 * 1000;
setInterval(() => {
    checkFatigueAndNotify(io).catch((err) => console.error('checkFatigueAndNotify error:', err));
}, FATIGUE_CHECK_INTERVAL_MS);

export default app;
