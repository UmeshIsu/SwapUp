export const monthOptions = [
    { label: 'January 2026', value: '2026-01' },
    { label: 'February 2026', value: '2026-02' },
    { label: 'March 2026', value: '2026-03' },
];

export interface PunctualityData {
    weekTrend: number[];
    monthTrend: number[];
    events: { id: string; title: string; subtitle: string; badge: string }[];
    comparison: { you: number; prev: number; dept: number };
}

export interface AbsenteeData {
    label: string;
    absentDays: number;
    absentRate: number;
    last4Months: number[];
    records: { id: string; date: string; reason: string }[];
}

export const mockPunctuality: Record<string, PunctualityData> = {
    '2026-01': {
        weekTrend: [85, 92, 78, 95, 88, 70, 92],
        monthTrend: [80, 85, 90, 88, 92, 85, 80, 75, 88, 92, 95, 88, 85, 80, 78, 82, 85, 90, 92, 88, 85, 82, 80, 85, 88, 92, 95, 90, 88, 85, 82],
        events: [
            { id: '1', title: 'Late Entry', subtitle: 'Jan 15, 2026 - 9:15 AM', badge: '15m' },
            { id: '2', title: 'Late Entry', subtitle: 'Jan 22, 2026 - 9:10 AM', badge: '10m' },
        ],
        comparison: { you: 88, prev: 85, dept: 90 },
    },
    '2026-02': {
        weekTrend: [95, 98, 92, 100, 95, 90, 98],
        monthTrend: [90, 92, 95, 98, 95, 92, 90, 88, 92, 95, 98, 100, 95, 92, 90, 92, 95, 98, 95, 92, 88, 90, 95, 98, 100, 95, 92, 90],
        events: [
            { id: '3', title: 'Late Entry', subtitle: 'Feb 05, 2026 - 9:05 AM', badge: '5m' },
        ],
        comparison: { you: 95, prev: 88, dept: 92 },
    },
    '2026-03': {
        weekTrend: [100, 100, 95, 98, 92, 95, 100],
        monthTrend: [95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95, 98, 100, 95],
        events: [],
        comparison: { you: 98, prev: 95, dept: 93 },
    },
};

export const mockAbsentee: Record<string, AbsenteeData> = {
    '2026-01': {
        label: 'January 2026',
        absentDays: 2,
        absentRate: 4.5,
        last4Months: [1, 2, 0, 2],
        records: [
            { id: '1', date: 'Jan 10, 2026', reason: 'Sick Leave' },
            { id: '2', date: 'Jan 15, 2026', reason: 'Personal Leave' },
        ],
    },
    '2026-02': {
        label: 'February 2026',
        absentDays: 0,
        absentRate: 0,
        last4Months: [1, 2, 2, 0],
        records: [],
    },
    '2026-03': {
        label: 'March 2026',
        absentDays: 1,
        absentRate: 2.1,
        last4Months: [2, 0, 2, 1],
        records: [
            { id: '3', date: 'Mar 02, 2026', reason: 'Emergency Leave' },
        ],
    },
};

export interface OvertimeData {
    totalHours: number;
    earnings: number;
    weekTrend: number[];
    monthTrend: number[];
    logs: { id: string; date: string; timeRange: string; duration: string }[];
}

export const mockOvertime: OvertimeData = {
    totalHours: 24.5,
    earnings: 857.50,
    weekTrend: [2, 0, 3, 1.5, 0, 4, 0],
    monthTrend: [0, 2, 1.5, 3, 0, 4, 2, 0, 0, 1, 2, 3, 0, 0, 1.5, 2, 0, 0, 0, 4, 2, 0, 3, 1.5, 0, 4, 0, 2],
    logs: [
        { id: "1", date: "Mar 02, 2026", timeRange: "18:00 - 20:30", duration: "2h 30m" },
        { id: "2", date: "Feb 28, 2026", timeRange: "17:30 - 19:00", duration: "1h 30m" },
        { id: "3", date: "Feb 25, 2026", timeRange: "18:00 - 21:00", duration: "3h 00m" },
    ]
};

export interface OverviewData {
    labels: string[];
    daily: number[];
    weekly: number[];
    overtimeHours: number;
    bonusPoints: number;
}

export const mockOverview: OverviewData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    daily: [8, 8.5, 9, 8, 10, 4, 0],
    weekly: [40, 42, 38, 45, 41, 0, 0],
    overtimeHours: 24.5,
    bonusPoints: 350
};
