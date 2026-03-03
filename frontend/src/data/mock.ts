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
