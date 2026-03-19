import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { prisma } from './config/prisma';

import shiftRoutes from './routes/shifts';
import swapRequestRoutes from './routes/swapRequests';
import chatRoutes from './routes/chatRoutes';
import devLoginRoutes from './routes/devLogin';
import authRoutes from './routes/authRoutes';
import rosterRoutes from './routes/rosterRoutes';

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
    res.json({ status: 'OK', service: 'SwapUp API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/swap-requests', swapRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api', devLoginRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────

io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
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
            } catch (err) {
                socket.emit('error', { message: (err as Error).message });
            }
        });
    },
);

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 SwapUp API + Socket.io running on port ${PORT}`);
});

export default app;
