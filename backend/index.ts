import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import prisma from './config/db';
import chatRoutes from './routes/chatRoutes';

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

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());
app.set('io', io);
app.use('/api/chat', chatRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

// ─── Socket.IO ────────────────────────────────────────────────────────────────

io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        socket.on('join_room', (conversationId) => socket.join(conversationId));
        socket.on('leave_room', (conversationId) => socket.leave(conversationId));

        socket.on('send_message', async ({ conversationId, senderId, content, type = 'TEXT' }) => {
            try {
                const msg = await prisma.message.create({
                    data: { conversationId, senderId, content, type },
                    include: { sender: true },
                });

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

const PORT = process.env.PORT ?? 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
