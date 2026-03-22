import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
// Prisma model types will be available after `npx prisma generate`
// Using `any` annotations until then to satisfy noImplicitAny

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns { monthStart, monthEnd } Date objects for a "YYYY-MM" string */
function monthBounds(month: string) {
    const [y, m] = month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)); // last day
    return { monthStart, monthEnd };
}

/** Given an employee's shifts for a month + their attendance/swap/leave data,
 *  compute punctuality, absentee & overtime metrics */
async function computeMonthMetrics(userId: string, month: string) {
    const { monthStart, monthEnd } = monthBounds(month);

    // 1. Shifts scheduled for this user in the month
    const shifts = await prisma.shift.findMany({
        where: {
            employeeId: userId,
            date: { gte: monthStart, lte: monthEnd },
        },
        orderBy: { date: 'asc' },
    });

    if (shifts.length === 0) {
        return {
            totalShifts: 0,
            punctualityRate: 0,
            absenteeRate: 0,
            overtimeHours: 0,
            lateCount: 0,
            absentCount: 0,
            onTimeCount: 0,
        };
    }

    // 2. Attendance records for the month
    const attendances = await prisma.attendance.findMany({
        where: {
            userId,
            status: 'APPROVED',
            checkedInAt: { gte: monthStart, lte: monthEnd },
        },
    });

    // Map attendance by date string "YYYY-MM-DD"
    const attendanceByDate = new Map<string, typeof attendances[0]>();
    attendances.forEach((a: any) => {
        const key = a.checkedInAt.toISOString().split('T')[0];
        if (!attendanceByDate.has(key)) attendanceByDate.set(key, a);
    });

    // 3. Approved swaps where this user swapped away
    const approvedSwaps = await prisma.swapRequest.findMany({
        where: {
            status: 'APPROVED_BY_MANAGER',
            OR: [
                { requesterId: userId },
                { targetId: userId },
            ],
        },
        include: {
            requesterShift: true,
            targetShift: true,
        },
    });

    // Build set of shift IDs that this user swapped away
    const swappedShiftIds = new Set<string>();
    approvedSwaps.forEach((swap: any) => {
        if (swap.requesterId === userId) {
            swappedShiftIds.add(swap.requesterShiftId);
        }
        if (swap.targetId === userId) {
            swappedShiftIds.add(swap.targetShiftId);
        }
    });

    // 4. Approved leaves covering dates in this month
    const leaves = await prisma.leaveRequest.findMany({
        where: {
            employeeId: userId,
            status: 'approved',
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
        },
    });

    // Build set of dates (YYYY-MM-DD) covered by leave
    const leaveDates = new Set<string>();
    leaves.forEach((l: any) => {
        const start = new Date(Math.max(l.startDate.getTime(), monthStart.getTime()));
        const end = new Date(Math.min(l.endDate.getTime(), monthEnd.getTime()));
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            leaveDates.add(d.toISOString().split('T')[0]);
        }
    });

    // 5. Compute metrics
    let onTimeCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let overtimeMs = 0;
    let effectiveShifts = 0; // shifts not swapped/on-leave

    shifts.forEach((shift: any) => {
        const dateKey = shift.date.toISOString().split('T')[0];

        // Skip if swapped away or on leave
        if (swappedShiftIds.has(shift.id) || leaveDates.has(dateKey)) {
            return;
        }

        effectiveShifts++;
        const attendance = attendanceByDate.get(dateKey);

        if (!attendance) {
            // Only count as absent if the shift date is in the past
            if (shift.date <= new Date()) {
                absentCount++;
            }
            return;
        }

        // Punctuality check
        const checkedInAt = attendance.checkedInAt.getTime();
        const shiftStart = shift.startTime.getTime();

        if (checkedInAt <= shiftStart) {
            onTimeCount++;
        } else {
            lateCount++;
        }

        // Overtime check
        if (attendance.checkedOutAt) {
            const checkoutTime = attendance.checkedOutAt.getTime();
            const shiftEnd = shift.endTime.getTime();
            if (checkoutTime > shiftEnd) {
                overtimeMs += checkoutTime - shiftEnd;
            }
        }
    });

    const punctualityRate = effectiveShifts > 0
        ? Math.round(((onTimeCount) / effectiveShifts) * 10000) / 100
        : 0;

    const absenteeRate = effectiveShifts > 0
        ? Math.round((absentCount / effectiveShifts) * 10000) / 100
        : 0;

    const overtimeHours = Math.round((overtimeMs / 3600000) * 100) / 100;

    return {
        totalShifts: shifts.length,
        effectiveShifts,
        punctualityRate,
        absenteeRate,
        overtimeHours,
        lateCount,
        absentCount,
        onTimeCount,
    };
}

// ---------------------------------------------------------------------------
// GET /api/analytics/monthly?month=YYYY-MM
// ---------------------------------------------------------------------------
export const getMonthlyAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

        const metrics = await computeMonthMetrics(userId, month);

        res.json({
            month,
            ...metrics,
        });
    } catch (error) {
        console.error('[analytics] getMonthlyAnalytics error:', error);
        res.status(500).json({ error: 'Failed to compute monthly analytics' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/punctuality?month=YYYY-MM
// ---------------------------------------------------------------------------
export const getPunctualityDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
        const { monthStart, monthEnd } = monthBounds(month);

        // Current month metrics
        const current = await computeMonthMetrics(userId, month);

        // Previous two months for 3-month comparison
        const [y, m] = month.split('-').map(Number);
        const prevMonth = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}`;
        const prevPrev = (() => {
            const pm = m <= 2 ? 12 + m - 2 : m - 2;
            const py = m <= 2 ? y - 1 : y;
            return `${py}-${String(pm).padStart(2, '0')}`;
        })();

        const prev = await computeMonthMetrics(userId, prevMonth);
        const prevPrevMetrics = await computeMonthMetrics(userId, prevPrev);

        // Weekly trend: break the month into 4 weeks and get punctuality per week
        const shifts = await prisma.shift.findMany({
            where: {
                employeeId: userId,
                date: { gte: monthStart, lte: monthEnd },
            },
            orderBy: { date: 'asc' },
        });

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: monthStart, lte: monthEnd },
            },
        });
        const attendanceByDate = new Map<string, typeof attendances[0]>();
        attendances.forEach((a: any) => {
            const key = a.checkedInAt.toISOString().split('T')[0];
            if (!attendanceByDate.has(key)) attendanceByDate.set(key, a);
        });

        // Compute weekly trend (4 buckets)
        const weekTrend: number[] = [0, 0, 0, 0];
        const weekCounts: number[] = [0, 0, 0, 0];
        const weekOnTime: number[] = [0, 0, 0, 0];

        shifts.forEach((shift: any) => {
            const day = shift.date.getUTCDate();
            const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
            weekCounts[weekIdx]++;

            const dateKey = shift.date.toISOString().split('T')[0];
            const attendance = attendanceByDate.get(dateKey);
            if (attendance && attendance.checkedInAt.getTime() <= shift.startTime.getTime()) {
                weekOnTime[weekIdx]++;
            }
        });

        for (let i = 0; i < 4; i++) {
            weekTrend[i] = weekCounts[i] > 0
                ? Math.round((weekOnTime[i] / weekCounts[i]) * 100)
                : 0;
        }

        // Late check-in events
        const lateEvents: any[] = [];
        shifts.forEach((shift: any) => {
            const dateKey = shift.date.toISOString().split('T')[0];
            const attendance = attendanceByDate.get(dateKey);
            if (attendance && attendance.checkedInAt.getTime() > shift.startTime.getTime()) {
                const lateByMin = Math.round(
                    (attendance.checkedInAt.getTime() - shift.startTime.getTime()) / 60000
                );
                lateEvents.push({
                    id: attendance.id.toString(),
                    title: 'Late Entry',
                    subtitle: `${shift.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${attendance.checkedInAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
                    badge: `${lateByMin}m`,
                });
            }
        });

        res.json({
            month,
            punctualityRate: current.punctualityRate,
            weekTrend,
            events: lateEvents,
            comparison: {
                current: current.punctualityRate,
                prevMonth: prev.punctualityRate,
                twoMonthsAgo: prevPrevMetrics.punctualityRate,
            },
            lateCount: current.lateCount,
        });
    } catch (error) {
        console.error('[analytics] getPunctualityDetails error:', error);
        res.status(500).json({ error: 'Failed to compute punctuality details' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/absentee?month=YYYY-MM
// ---------------------------------------------------------------------------
export const getAbsenteeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
        const { monthStart, monthEnd } = monthBounds(month);

        const current = await computeMonthMetrics(userId, month);

        // Last 4 months trend
        const [y, m] = month.split('-').map(Number);
        const trend: number[] = [];
        const trendLabels: string[] = [];
        for (let i = 3; i >= 0; i--) {
            let tm = m - i;
            let ty = y;
            if (tm <= 0) { tm += 12; ty--; }
            const ms = `${ty}-${String(tm).padStart(2, '0')}`;
            const metrics = await computeMonthMetrics(userId, ms);
            trend.push(metrics.absentCount);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            trendLabels.push(monthNames[tm - 1]);
        }

        // Absent records: find shifts with no attendance and no swap/leave
        const shifts = await prisma.shift.findMany({
            where: {
                employeeId: userId,
                date: { gte: monthStart, lte: monthEnd },
            },
            orderBy: { date: 'asc' },
        });

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: monthStart, lte: monthEnd },
            },
        });
        const attendanceDates = new Set(
            attendances.map((a: any) => a.checkedInAt.toISOString().split('T')[0])
        );

        // Get swap/leave dates (reuse logic from computeMonthMetrics)
        const approvedSwaps = await prisma.swapRequest.findMany({
            where: {
                status: 'APPROVED_BY_MANAGER',
                OR: [{ requesterId: userId }, { targetId: userId }],
            },
        });
        const swappedShiftIds = new Set<string>();
        approvedSwaps.forEach((swap: any) => {
            if (swap.requesterId === userId) swappedShiftIds.add(swap.requesterShiftId);
            if (swap.targetId === userId) swappedShiftIds.add(swap.targetShiftId);
        });

        const leaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: userId,
                status: 'approved',
                startDate: { lte: monthEnd },
                endDate: { gte: monthStart },
            },
        });
        const leaveDates = new Set<string>();
        leaves.forEach((l: any) => {
            const start = new Date(Math.max(l.startDate.getTime(), monthStart.getTime()));
            const end = new Date(Math.min(l.endDate.getTime(), monthEnd.getTime()));
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                leaveDates.add(d.toISOString().split('T')[0]);
            }
        });

        const records: { id: string; date: string; reason: string }[] = [];
        shifts.forEach((shift: any) => {
            const dateKey = shift.date.toISOString().split('T')[0];
            if (swappedShiftIds.has(shift.id) || leaveDates.has(dateKey)) return;
            if (shift.date > new Date()) return; // future shift
            if (!attendanceDates.has(dateKey)) {
                records.push({
                    id: shift.id,
                    date: shift.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    reason: 'No check-in recorded',
                });
            }
        });

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        res.json({
            month,
            label: `${monthNames[m - 1]} ${y}`,
            absentDays: current.absentCount,
            absentRate: current.absenteeRate,
            last4Months: trend,
            last4MonthLabels: trendLabels,
            records,
        });
    } catch (error) {
        console.error('[analytics] getAbsenteeDetails error:', error);
        res.status(500).json({ error: 'Failed to compute absentee details' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/overtime?month=YYYY-MM
// ---------------------------------------------------------------------------
export const getOvertimeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
        const { monthStart, monthEnd } = monthBounds(month);

        const shifts = await prisma.shift.findMany({
            where: {
                employeeId: userId,
                date: { gte: monthStart, lte: monthEnd },
            },
            orderBy: { date: 'asc' },
        });

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: monthStart, lte: monthEnd },
            },
        });
        const attendanceByDate = new Map<string, typeof attendances[0]>();
        attendances.forEach((a: any) => {
            const key = a.checkedInAt.toISOString().split('T')[0];
            if (!attendanceByDate.has(key)) attendanceByDate.set(key, a);
        });

        // Daily hours + overtime logs
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyHoursMap = new Map<string, number>(); // day of week -> hours
        const weeklyHoursMap = new Map<number, number>(); // week num -> hours
        const overtimeLogs: any[] = [];
        let totalOvertimeMs = 0;

        shifts.forEach((shift: any) => {
            const dateKey = shift.date.toISOString().split('T')[0];
            const attendance = attendanceByDate.get(dateKey);
            if (!attendance) return;

            const shiftEnd = shift.endTime.getTime();
            const scheduledMs = shiftEnd - shift.startTime.getTime();
            const dayOfWeek = shift.date.getUTCDay();
            const dayLabel = dayNames[dayOfWeek];
            const weekIdx = Math.min(Math.floor((shift.date.getUTCDate() - 1) / 7), 3);

            // Worked hours
            const checkIn = attendance.checkedInAt.getTime();
            const checkOut = attendance.checkedOutAt?.getTime() ?? shiftEnd;
            const workedMs = checkOut - checkIn;
            const workedHours = Math.round((workedMs / 3600000) * 100) / 100;

            dailyHoursMap.set(dayLabel, (dailyHoursMap.get(dayLabel) ?? 0) + workedHours);
            weeklyHoursMap.set(weekIdx, (weeklyHoursMap.get(weekIdx) ?? 0) + workedHours);

            // Overtime
            if (attendance.checkedOutAt && checkOut > shiftEnd) {
                const otMs = checkOut - shiftEnd;
                totalOvertimeMs += otMs;
                const otHours = Math.round((otMs / 3600000) * 100) / 100;
                const minutes = Math.round((otMs / 60000) % 60);
                const hours = Math.floor(otMs / 3600000);

                overtimeLogs.push({
                    id: attendance.id.toString(),
                    date: shift.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    timeRange: `${new Date(shiftEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${attendance.checkedOutAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    duration: `${hours}h ${minutes.toString().padStart(2, '0')}m`,
                });
            }
        });

        // Build daily/weekly arrays
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const daily = labels.map(l => Math.round((dailyHoursMap.get(l) ?? 0) * 100) / 100);
        const weekly = [0, 1, 2, 3].map(w => Math.round((weeklyHoursMap.get(w) ?? 0) * 100) / 100);

        const totalOvertimeHours = Math.round((totalOvertimeMs / 3600000) * 100) / 100;

        res.json({
            month,
            totalOvertimeHours,
            labels,
            daily,
            weekly,
            weekLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            logs: overtimeLogs,
        });
    } catch (error) {
        console.error('[analytics] getOvertimeDetails error:', error);
        res.status(500).json({ error: 'Failed to compute overtime details' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/export?month=YYYY-MM&format=csv
// ---------------------------------------------------------------------------
export const exportMonthlyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
        const { monthStart, monthEnd } = monthBounds(month);

        const shifts = await prisma.shift.findMany({
            where: {
                employeeId: userId,
                date: { gte: monthStart, lte: monthEnd },
            },
            orderBy: { date: 'asc' },
        });

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                status: 'APPROVED',
                checkedInAt: { gte: monthStart, lte: monthEnd },
            },
        });
        const attendanceByDate = new Map<string, typeof attendances[0]>();
        attendances.forEach((a: any) => {
            const key = a.checkedInAt.toISOString().split('T')[0];
            if (!attendanceByDate.has(key)) attendanceByDate.set(key, a);
        });

        // Build CSV rows
        const rows: string[] = ['Date,Shift Start,Shift End,Check-In Time,Check-Out Time,Status,Overtime Hours'];

        shifts.forEach((shift: any) => {
            const dateKey = shift.date.toISOString().split('T')[0];
            const attendance = attendanceByDate.get(dateKey);

            const date = shift.date.toLocaleDateString('en-US');
            const shiftStart = new Date(shift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const shiftEnd = new Date(shift.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            let checkIn = '-';
            let checkOut = '-';
            let status = 'Absent';
            let overtime = '0';

            if (attendance) {
                checkIn = new Date(attendance.checkedInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                checkOut = attendance.checkedOutAt
                    ? new Date(attendance.checkedOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '-';

                status = attendance.checkedInAt.getTime() <= shift.startTime.getTime() ? 'On Time' : 'Late';

                if (attendance.checkedOutAt && attendance.checkedOutAt.getTime() > shift.endTime.getTime()) {
                    const otMs = attendance.checkedOutAt.getTime() - shift.endTime.getTime();
                    overtime = (Math.round((otMs / 3600000) * 100) / 100).toString();
                }
            }

            rows.push(`${date},${shiftStart},${shiftEnd},${checkIn},${checkOut},${status},${overtime}`);
        });

        const csvContent = rows.join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${month}.csv"`);
        res.send(csvContent);
    } catch (error) {
        console.error('[analytics] exportMonthlyReport error:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/employee/:employeeId?month=YYYY-MM
// ---------------------------------------------------------------------------
export const getEmployeeAnalyticsForManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = req.params.employeeId as string;
        const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
        const { monthStart, monthEnd } = monthBounds(month);

        // Fetch metrics for this employee
        const current = await computeMonthMetrics(employeeId, month);
        
        // Fetch basic user details
        const user = await prisma.user.findUnique({
            where: { id: employeeId },
            select: { name: true, email: true, phone: true, avatarUrl: true, department: true, workerId: true }
        });

        // Compute daily overtime for chart
        const shifts = await prisma.shift.findMany({
            where: { employeeId, date: { gte: monthStart, lte: monthEnd } },
            orderBy: { date: 'asc' },
        });

        const attendances = await prisma.attendance.findMany({
            where: { userId: employeeId, status: 'APPROVED', checkedInAt: { gte: monthStart, lte: monthEnd } },
        });
        const attendanceByDate = new Map<string, any>();
        attendances.forEach((a: any) => attendanceByDate.set(a.checkedInAt.toISOString().split('T')[0], a));

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyHoursMap = new Map<string, number>();

        shifts.forEach((shift: any) => {
            const dateKey = shift.date.toISOString().split('T')[0];
            const attendance = attendanceByDate.get(dateKey);
            if (!attendance) return;

            const shiftEnd = shift.endTime.getTime();
            const checkOut = attendance.checkedOutAt?.getTime() ?? shiftEnd;
            const dayLabel = dayNames[shift.date.getUTCDay()];

            if (attendance.checkedOutAt && checkOut > shiftEnd) {
                const otMs = checkOut - shiftEnd;
                const otHours = otMs / 3600000;
                dailyHoursMap.set(dayLabel, (dailyHoursMap.get(dayLabel) ?? 0) + otHours);
            }
        });

        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyOvertime = labels.map(l => Math.round((dailyHoursMap.get(l) ?? 0) * 100) / 100);

        res.json({
            month,
            employee: user,
            dailyOvertime,
            ...current,
        });
    } catch (error) {
        console.error('[analytics] getEmployeeAnalyticsForManager error:', error);
        res.status(500).json({ error: 'Failed to compute employee analytics for manager' });
    }
};
