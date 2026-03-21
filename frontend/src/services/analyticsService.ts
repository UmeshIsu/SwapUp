// analyticsService.ts
// Frontend API calls for the Analytics feature

import { apiRequest } from './apiClient';

export interface MonthlyAnalytics {
    month: string;
    totalShifts: number;
    effectiveShifts: number;
    punctualityRate: number;
    absenteeRate: number;
    overtimeHours: number;
    lateCount: number;
    absentCount: number;
    onTimeCount: number;
}

export interface PunctualityDetails {
    month: string;
    punctualityRate: number;
    weekTrend: number[];
    events: { id: string; title: string; subtitle: string; badge: string }[];
    comparison: {
        current: number;
        prevMonth: number;
        twoMonthsAgo: number;
    };
    lateCount: number;
}

export interface AbsenteeDetails {
    month: string;
    label: string;
    absentDays: number;
    absentRate: number;
    last4Months: number[];
    last4MonthLabels: string[];
    records: { id: string; date: string; reason: string }[];
}

export interface OvertimeDetails {
    month: string;
    totalOvertimeHours: number;
    labels: string[];
    daily: number[];
    weekly: number[];
    weekLabels: string[];
    logs: { id: string; date: string; timeRange: string; duration: string }[];
}

export async function fetchMonthlyAnalytics(month: string): Promise<MonthlyAnalytics> {
    return apiRequest<MonthlyAnalytics>('GET', '/analytics/monthly', undefined, { month });
}

export async function fetchPunctualityDetails(month: string): Promise<PunctualityDetails> {
    return apiRequest<PunctualityDetails>('GET', '/analytics/punctuality', undefined, { month });
}

export async function fetchAbsenteeDetails(month: string): Promise<AbsenteeDetails> {
    return apiRequest<AbsenteeDetails>('GET', '/analytics/absentee', undefined, { month });
}

export async function fetchOvertimeDetails(month: string): Promise<OvertimeDetails> {
    return apiRequest<OvertimeDetails>('GET', '/analytics/overtime', undefined, { month });
}

export function getExportUrl(month: string, baseUrl: string): string {
    return `${baseUrl}/analytics/export?month=${month}`;
}
