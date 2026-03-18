import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client';

// ─── Request Body Types ───────────────────────────────────────────────────────

interface SendMessageBody {
    conversationId: string;
    senderId: string;
    content: string;
    type?: 'TEXT' | 'SWAP_REQUEST';
    swapRequest?: {
        requesterId: string;
        targetId: string;
        requesterShiftId: string;
        targetShiftId: string;
        reason?: string;
    };
}

interface RespondSwapRequestBody {
    status: 'PENDING' | 'ACCEPTED_BY_EMPLOYEE' | 'DECLINED_BY_EMPLOYEE' | 'APPROVED_BY_MANAGER' | 'REJECTED_BY_MANAGER';
}

interface CreateConversationBody {
    userIds: string[];
}

// ─── Prisma Payload Types ─────────────────────────────────────────────────────

type ParticipantWithFullConversation = Prisma.ParticipantGetPayload<{
    include: {
        conversation: {
            include: {
                participants: { include: { user: true } };
                messages: true;
            };
        };
    };
}>;

type SwapWithMessageInfo = Prisma.SwapRequestGetPayload<{
    include: {
        requesterShift: true;
        targetShift: true;
        target: true;
        message: {
            include: {
                conversation: { include: { participants: { include: { user: true } } } };
            };
        };
    };
}>;

type MessageWithSenderAndSwap = Prisma.MessageGetPayload<{
    include: { sender: true; swapRequest: { include: { target: true; requesterShift: true; targetShift: true } } };
}>;

type SwapWithFullDetails = Prisma.SwapRequestGetPayload<{
    include: {
        requesterShift: true;
        targetShift: true;
        target: true;
        message: {
            include: {
                sender: true;
                conversation: { include: { participants: { include: { user: true } } } };
            };
        };
    };
}>;

// ─── Helper for Parameter Coercion ────────────────────────────────────────────

const toString = (val: string | string[] | undefined): string => {
    if (Array.isArray(val)) return val[0];
    return val ?? '';
};

// ─── GET /api/chat/conversations/:userId ─────────────────────────────────────

export const getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = toString(req.params.userId);
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const rows = await prisma.participant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: { include: { user: true } },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                },
            },
        }) as ParticipantWithFullConversation[];

        const result = rows.map((row) => {
            const c = row.conversation;
            const other = c.participants.find((p: any) => p.userId !== userId)?.user;
            const last = c.messages[0];
            return {
                id: c.id,
                participantName: other?.name ?? 'Unknown',
                participantAvatar: other?.avatarUrl ?? null,
                lastMessage: last?.content ?? '',
                lastMessageTime: (last?.createdAt ?? c.createdAt).toISOString(),
            };
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── POST /api/chat/conversations ─────────────────────────────────────────────
// Get-or-create a 1-on-1 conversation between two users.

export const getOrCreateConversation = async (
    req: Request<object, object, CreateConversationBody>,
    res: Response,
): Promise<void> => {
    try {
        const { userIds } = req.body;

        if (!userIds || userIds.length < 2) {
            res.status(400).json({ error: 'At least 2 user IDs are required' });
            return;
        }

        // Check if a conversation already exists between these users
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: userIds.map((uid) => ({
                    participants: { some: { userId: uid } },
                })),
            },
            include: {
                participants: { include: { user: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });

        if (existing) {
            res.json({
                id: existing.id,
                participants: existing.participants.map((p: any) => ({
                    userId: p.userId,
                    name: p.user.name,
                    avatarUrl: p.user.avatarUrl,
                })),
                lastMessage: existing.messages[0]?.content ?? '',
                lastMessageTime: (existing.messages[0]?.createdAt ?? existing.createdAt).toISOString(),
            });
            return;
        }

        // Create new conversation with participants
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: userIds.map((uid) => ({ userId: uid })),
                },
            },
            include: {
                participants: { include: { user: true } },
            },
        });

        res.status(201).json({
            id: conversation.id,
            participants: conversation.participants.map((p: any) => ({
                userId: p.userId,
                name: p.user.name,
                avatarUrl: p.user.avatarUrl,
            })),
            lastMessage: '',
            lastMessageTime: conversation.createdAt.toISOString(),
        });
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── GET /api/chat/users?tenantId=xxx ─────────────────────────────────────────
// List all users (optionally filtered by tenantId) for starting new chats.

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = toString(req.query.tenantId as string);
        const where = tenantId ? { tenantId } : {};

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                avatarUrl: true,
                workerId: true,
            },
            orderBy: { name: 'asc' },
        });

        res.json(users);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── GET /api/chat/sent-swap-requests/:userId ─────────────────────────────────

export const getSentSwapRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = toString(req.params.userId);
        const swaps = await prisma.swapRequest.findMany({
            where: { message: { senderId: userId } },
            include: {
                requesterShift: true,
                targetShift: true,
                target: true,
                message: {
                    include: {
                        conversation: { include: { participants: { include: { user: true } } } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }) as SwapWithMessageInfo[];

        const result = swaps.map((sr) => {
            const other = sr.message?.conversation.participants.find(
                (p: any) => p.userId !== userId,
            )?.user;
            return {
                id: sr.id,
                recipientName: other?.name ?? 'Unknown',
                recipientAvatar: other?.avatarUrl ?? null,
                theirShift: `${sr.requesterShift.date.toISOString().split('T')[0]} ${sr.requesterShift.type ?? ''}`.trim(),
                requestedShift: `${sr.targetShift.date.toISOString().split('T')[0]} ${sr.targetShift.type ?? ''}`.trim(),
                status: sr.status,
                createdAt: sr.createdAt.toISOString(),
                conversationId: sr.message?.conversationId ?? '',
            };
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── GET /api/chat/incoming-swap-requests/:userId ─────────────────────────────
// Swap requests where this user is the TARGET (someone asked them to swap).

export const getIncomingSwapRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = toString(req.params.userId);
        const swaps = await prisma.swapRequest.findMany({
            where: { targetId: userId },
            include: {
                requesterShift: true,
                targetShift: true,
                requester: true,
                message: {
                    include: {
                        conversation: { include: { participants: { include: { user: true } } } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const result = swaps.map((sr: any) => ({
            id: sr.id,
            requesterName: sr.requester.name,
            requesterAvatar: sr.requester.avatarUrl,
            theirShift: `${sr.requesterShift.date.toISOString().split('T')[0]} ${sr.requesterShift.type ?? ''}`.trim(),
            requestedShift: `${sr.targetShift.date.toISOString().split('T')[0]} ${sr.targetShift.type ?? ''}`.trim(),
            status: sr.status,
            createdAt: sr.createdAt.toISOString(),
            conversationId: sr.message?.conversationId ?? '',
        }));

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── GET /api/chat/messages/:conversationId ───────────────────────────────────

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const conversationId = toString(req.params.conversationId);
        const msgs = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: { sender: true, swapRequest: { include: { target: true, requesterShift: true, targetShift: true } } },
        }) as MessageWithSenderAndSwap[];

        res.json(
            msgs.map((m: any) => ({
                id: m.id,
                conversationId: m.conversationId,
                senderId: m.senderId,
                senderName: m.sender.name,
                senderAvatar: m.sender.avatarUrl,
                content: m.content,
                type: m.type,
                createdAt: m.createdAt.toISOString(),
                swapRequest: m.swapRequest
                    ? {
                        id: m.swapRequest.id,
                        proposedShift: `${m.swapRequest.requesterShift.date.toISOString().split('T')[0]} ${m.swapRequest.requesterShift.type ?? ''}`.trim(),
                        requestedShift: `${m.swapRequest.targetShift.date.toISOString().split('T')[0]} ${m.swapRequest.targetShift.type ?? ''}`.trim(),
                        targetName: m.swapRequest.target.name,
                        targetAvatar: m.swapRequest.target.avatarUrl,
                        status: m.swapRequest.status,
                    }
                    : null,
            })),
        );
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── POST /api/chat/messages ──────────────────────────────────────────────────

export const sendMessage = async (
    req: Request<object, object, SendMessageBody>,
    res: Response,
): Promise<void> => {
    try {
        const { conversationId, senderId, content, type = 'TEXT', swapRequest } = req.body;
        const msg = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content,
                type,
                ...(swapRequest ? { swapRequest: { create: swapRequest as any } } : {}),
            },
            include: { sender: true, swapRequest: true },
        });
        res.status(201).json(msg);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── PATCH /api/chat/swap-requests/:id ───────────────────────────────────────

export const respondSwapRequest = async (
    req: Request<{ id: string }, object, RespondSwapRequestBody>,
    res: Response,
): Promise<void> => {
    try {
        const id = toString(req.params.id);
        const { status } = req.body;

        const updated = await prisma.swapRequest.update({
            where: { id },
            data: { status: status as any },
            include: {
                requester: true,
                target: true,
                requesterShift: true,
                targetShift: true,
                message: {
                    include: {
                        sender: true,
                        conversation: { include: { participants: { include: { user: true } } } },
                    },
                },
            },
        }) as any;

        const io = req.app.get('io');
        const conversationId = updated.message?.conversationId;

        // ── Notify participants via Socket.IO about the status change ──
        if (io && conversationId) {
            io.to(conversationId).emit('swap_status_updated', {
                swapRequestId: updated.id,
                status: updated.status,
                conversationId,
            });
        }

        // ── When employee declines → create a "Declined" notification message ──
        if (status === 'DECLINED_BY_EMPLOYEE' && conversationId) {
            const label = `❌ ${updated.target.name} declined the swap request.`;

            const notifMsg = await prisma.message.create({
                data: {
                    conversationId,
                    senderId: updated.targetId,
                    content: label,
                    type: 'TEXT',
                },
                include: { sender: true },
            });

            if (io) {
                io.to(conversationId).emit('new_message', {
                    id: notifMsg.id,
                    conversationId: notifMsg.conversationId,
                    senderId: notifMsg.senderId,
                    senderName: notifMsg.sender.name,
                    senderAvatar: notifMsg.sender.avatarUrl,
                    content: notifMsg.content,
                    type: notifMsg.type,
                    createdAt: notifMsg.createdAt.toISOString(),
                    swapRequest: null,
                });
            }
        }

        // ── When manager approves/rejects → notify BOTH employees in their chat ──
        if ((status === 'APPROVED_BY_MANAGER' || status === 'REJECTED_BY_MANAGER') && conversationId) {
            const label = status === 'APPROVED_BY_MANAGER'
                ? `✅ Manager approved the swap request between ${updated.requester.name} and ${updated.target.name}.`
                : `❌ Manager rejected the swap request between ${updated.requester.name} and ${updated.target.name}.`;

            // Create a notification message in the employees' conversation
            const notifMsg = await prisma.message.create({
                data: {
                    conversationId,
                    senderId: updated.requesterId, // use requester as context sender
                    content: label,
                    type: 'TEXT',
                },
                include: { sender: true },
            });

            // Broadcast to the conversation room so both employees see it live
            if (io) {
                io.to(conversationId).emit('new_message', {
                    id: notifMsg.id,
                    conversationId: notifMsg.conversationId,
                    senderId: notifMsg.senderId,
                    senderName: notifMsg.sender.name,
                    senderAvatar: notifMsg.sender.avatarUrl,
                    content: notifMsg.content,
                    type: notifMsg.type,
                    createdAt: notifMsg.createdAt.toISOString(),
                    swapRequest: null,
                });
            }
        }

        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

// ─── GET /api/chat/manager/swap-approvals ────────────────────────────────────

export const getManagerSwapApprovals = async (_req: Request, res: Response): Promise<void> => {
    try {
        const swaps = await prisma.swapRequest.findMany({
            where: {
                status: {
                    in: ['ACCEPTED_BY_EMPLOYEE', 'APPROVED_BY_MANAGER', 'REJECTED_BY_MANAGER'] as any[]
                }
            },
            include: {
                requester: { select: { id: true, name: true, avatarUrl: true } },
                target: { select: { id: true, name: true, avatarUrl: true } },
                requesterShift: true,
                targetShift: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const result = swaps.map((sr: any) => ({
            id: sr.id,
            senderName: sr.requester?.name ?? 'Unknown',
            senderAvatar: sr.requester?.avatarUrl ?? null,
            recipientName: sr.target?.name ?? 'Unknown',
            recipientAvatar: sr.target?.avatarUrl ?? null,
            proposedShift: `${sr.requesterShift.date.toISOString().split('T')[0]} ${sr.requesterShift.type ?? ''}`.trim(),
            requestedShift: `${sr.targetShift.date.toISOString().split('T')[0]} ${sr.targetShift.type ?? ''}`.trim(),
            status: sr.status,
            createdAt: sr.createdAt.toISOString(),
        }));

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};


