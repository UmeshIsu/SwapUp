import type { Server } from 'socket.io';
import { prisma } from '../config/prisma';
import { notifyManagers } from '../services/notificationService';

// Matches the threshold used by managerStatsController's on-demand fatigue check.
const FATIGUE_THRESHOLD_MS = 5 * 60 * 1000;

export async function checkFatigueAndNotify(io: Server | undefined) {
    const threshold = new Date(Date.now() - FATIGUE_THRESHOLD_MS);

    const attendances = await prisma.attendance.findMany({
        where: {
            status: 'APPROVED',
            checkedOutAt: null,
            checkedInAt: { lt: threshold },
            fatigueNotifiedAt: null,
        },
        include: {
            user: { select: { id: true, name: true, tenantId: true, departmentId: true } },
        },
    });

    for (const attendance of attendances) {
        const hoursWorked = Math.round(
            (Date.now() - attendance.checkedInAt.getTime()) / (1000 * 60 * 60)
        );

        await notifyManagers(
            io,
            attendance.user.tenantId,
            attendance.user.departmentId,
            'FATIGUE_ALERT',
            'Fatigue Alert',
            `${attendance.user.name} has been working for ${hoursWorked}+ hours without checking out.`,
            { attendanceId: attendance.id, employeeId: attendance.userId }
        );

        await prisma.attendance.update({
            where: { id: attendance.id },
            data: { fatigueNotifiedAt: new Date() },
        });
    }
}
