import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/chat/threads — Messages tab list
export const getChatThreads = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        // Find all conversations the user participates in
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true } } },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { sender: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const threads = conversations.map((c: any) => {
            const otherParticipant = c.participants.find(
                (p: any) => p.userId !== userId
            );
            const lastMsg = c.messages[0];

            return {
                threadId: c.id,
                participant: otherParticipant
                    ? { id: otherParticipant.user.id, name: otherParticipant.user.name }
                    : null,
                lastMessage: lastMsg?.content ?? '',
                lastMessageTime: lastMsg?.createdAt ?? c.createdAt,
            };
        });

        res.json(threads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat threads' });
    }
};

// GET /api/chat/messages/:conversationId
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const conversationId = req.params.conversationId as string;
        const userId = req.user!.id;

        // Verify user is a participant
        const participant = await prisma.participant.findUnique({
            where: { userId_conversationId: { userId, conversationId } },
        });

        if (!participant) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        const formatted = messages.map((m: any) => ({
            id: m.id,
            sender: { id: m.sender.id, name: m.sender.name },
            content: m.content,
            sentAt: m.createdAt,
            isMe: m.senderId === userId,
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// POST /api/chat/messages/:conversationId
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const conversationId = req.params.conversationId as string;
        const { content } = req.body;
        const senderId = req.user!.id;

        if (!content || content.trim() === '') {
            res.status(400).json({ error: 'Message content is required' });
            return;
        }

        // Verify user is a participant
        const participant = await prisma.participant.findUnique({
            where: { userId_conversationId: { userId: senderId, conversationId } },
        });

        if (!participant) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const message = await prisma.message.create({
            data: { conversationId, senderId, content: content.trim() },
            include: { sender: { select: { id: true, name: true } } },
        });

        res.status(201).json({
            id: message.id,
            sender: { id: message.sender.id, name: message.sender.name },
            content: message.content,
            sentAt: message.createdAt,
            isMe: true,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};
