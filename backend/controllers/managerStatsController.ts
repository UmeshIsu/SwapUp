import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/shifts/manager-dashboard-stats
export const getManagerDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { department, tenantId } = req.user! as any;

        // ── Today's date boundaries (UTC) ──────────────────────────────────
        const now = new Date();
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(now);
        dayEnd.setHours(23, 59, 59, 999);

        // ── 1. Today's shifts for this department ──────────────────────────
        const todayShifts = await prisma.shift.findMany({
            where: {
                date: { gte: dayStart, lte: dayEnd },
                employee: {
                    department: department as any,
                    tenantId,
                    role: 'EMPLOYEE',
                },
            },
            include: {
                employee: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Deduplicate by employee (in case of multiple shifts)
        const scheduledMap = new Map<string, any>();
        todayShifts.forEach(shift => {
            if (!scheduledMap.has(shift.employeeId)) {
                scheduledMap.set(shift.employeeId, {
                    employeeId: shift.employeeId,
                    name: shift.employee.name,
                    avatarUrl: shift.employee.avatarUrl,
                    shiftStart: shift.startTime,
                    shiftEnd: shift.endTime,
                    shiftId: shift.id,
                });
            }
        });

        const scheduledEmployeeIds = Array.from(scheduledMap.keys());

        // ── 2. Today's APPROVED attendances for those employees ────────────
        const attendances = await prisma.attendance.findMany({
            where: {
                userId: { in: scheduledEmployeeIds },
                status: 'APPROVED',
                checkedInAt: { gte: dayStart, lte: dayEnd },
            },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Map: employeeId -> attendance record
        const attendanceMap = new Map<string, any>();
        attendances.forEach(a => {
            if (!attendanceMap.has(a.userId)) {
                attendanceMap.set(a.userId, a);
            }
        });

        // ── 3. Approved leaves covering today ──────────────────────────────
        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: { in: scheduledEmployeeIds },
                status: 'approved',
                startDate: { lte: dayEnd },
                endDate: { gte: dayStart },
            },
        });
        const onLeaveIds = new Set(approvedLeaves.map(l => l.employeeId));

        // ── 4. Approved swaps on today's shifts ────────────────────────────
        const todayShiftIds = todayShifts.map(s => s.id);
        const approvedSwaps = await prisma.swapRequest.findMany({
            where: {
                status: 'APPROVED_BY_MANAGER',
                OR: [
                    { requesterShiftId: { in: todayShiftIds } },
                    { targetShiftId: { in: todayShiftIds } },
                ],
            },
        });
        // Employees who swapped away their shift today
        const swappedAwayIds = new Set<string>();
        approvedSwaps.forEach(swap => {
            // If the requester's shift was today, they swapped it away
            if (todayShiftIds.includes(swap.requesterShiftId)) {
                swappedAwayIds.add(swap.requesterId);
            }
            // If the target's shift was today, they swapped it away
            if (todayShiftIds.includes(swap.targetShiftId)) {
                swappedAwayIds.add(swap.targetId);
            }
        });

        // ── 5. Build response lists ────────────────────────────────────────

        const onDuty: any[] = [];
        const lateCheckIns: any[] = [];
        const absentees: any[] = [];

        scheduledMap.forEach((emp, empId) => {
            const attendance = attendanceMap.get(empId);

            if (attendance) {
                // Employee checked in
                const checkedInAt = new Date(attendance.checkedInAt);
                const shiftStart = new Date(emp.shiftStart);
                const lateByMs = checkedInAt.getTime() - shiftStart.getTime();
                const lateByMinutes = Math.round(lateByMs / 60000);

                const entry = {
                    id: empId,
                    name: emp.name,
                    avatarUrl: emp.avatarUrl,
                    checkedInAt: attendance.checkedInAt,
                    shiftStart: emp.shiftStart,
                };

                onDuty.push(entry);

                if (lateByMinutes > 0) {
                    lateCheckIns.push({
                        ...entry,
                        lateByMinutes,
                    });
                }
            } else {
                // Not checked in — is it a valid absentee?
                const isOnLeave = onLeaveIds.has(empId);
                const hasSwapped = swappedAwayIds.has(empId);

                if (!isOnLeave && !hasSwapped) {
                    absentees.push({
                        id: empId,
                        name: emp.name,
                        avatarUrl: emp.avatarUrl,
                        shiftStart: emp.shiftStart,
                        shiftEnd: emp.shiftEnd,
                    });
                }
            }
        });

        res.json({
            onDutyCount: onDuty.length,
            lateCount: lateCheckIns.length,
            absenteeCount: absentees.length,
            totalScheduled: scheduledMap.size,
            onDuty,
            lateCheckIns,
            absentees,
        });
    } catch (error) {
        console.error('getManagerDashboardStats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
