import type { Server } from 'socket.io';
import { prisma } from '../config/prisma';

/**
 * Resolves who should receive a manager-facing notification: the manager of
 * the given department, falling back to every manager in the tenant if the
 * department has none assigned (or none was provided).
 */
export async function getDepartmentManagerIds(
    tenantId: string,
    departmentId?: string | null
): Promise<string[]> {
    if (departmentId) {
        const dept = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { managerId: true },
        });
        if (dept?.managerId) return [dept.managerId];
    }

    const managers = await prisma.user.findMany({
        where: { tenantId, role: 'MANAGER' },
        select: { id: true },
    });
    return managers.map((m) => m.id);
}

export async function createNotification(
    io: Server | undefined,
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
) {
    const notification = await prisma.notification.create({
        data: { userId, type, title, message, metadata: metadata as any },
    });

    io?.to(`user:${userId}`).emit('new_notification', notification as any);

    return notification;
}

export async function notifyManagers(
    io: Server | undefined,
    tenantId: string,
    departmentId: string | null | undefined,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
) {
    const managerIds = await getDepartmentManagerIds(tenantId, departmentId);
    await Promise.all(
        managerIds.map((id) => createNotification(io, id, type, title, message, metadata))
    );
}

/**
 * Handles notifications when an employee sends a chat message:
 * 1. Notifies every other participant in the conversation (NEW_MESSAGE).
 * 2. Notifies the sender's manager(s) that an employee sent a message
 *    (EMPLOYEE_MESSAGE_SENT).
 */
export async function handleChatMessageNotification(
    io: Server | undefined,
    senderId: string,
    conversationId: string,
    contentPreview: string
) {
    // Look up the sender and conversation participants
    const [sender, participants] = await Promise.all([
        prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true, tenantId: true, departmentId: true, role: true },
        }),
        prisma.participant.findMany({
            where: { conversationId },
            select: { userId: true },
        }),
    ]);

    if (!sender) return;

    const recipientIds = participants
        .map((p) => p.userId)
        .filter((id) => id !== senderId);

    // 1. Notify each recipient about the new message
    const preview = contentPreview.length > 80
        ? contentPreview.slice(0, 77) + '...'
        : contentPreview;

    await Promise.all(
        recipientIds.map((recipientId) =>
            createNotification(
                io,
                recipientId,
                'NEW_MESSAGE',
                'New Message',
                `${sender.name}: ${preview}`,
                { conversationId, senderId }
            )
        )
    );

    // 2. Notify the sender's manager(s) — only when the sender is an employee
    if (sender.role === 'EMPLOYEE') {
        await notifyManagers(
            io,
            sender.tenantId,
            sender.departmentId,
            'EMPLOYEE_MESSAGE_SENT',
            'Employee Sent a Message',
            `${sender.name} sent a message.`,
            { conversationId, senderId }
        );
    }
}
