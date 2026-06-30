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
