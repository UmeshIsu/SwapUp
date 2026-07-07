// -----------------------------------------------------------------------
// attendanceService.ts
// Attendance is QR-only: staff scan the restaurant's entrance QR.
// The auth token is injected automatically by apiClient (AsyncStorage).
// -----------------------------------------------------------------------

import { apiRequest } from './apiClient';

export interface CheckInResponse {
    status: 'APPROVED' | 'REJECTED';
    checkedInAt?: string; // ISO string — only when APPROVED
    reason?: string;      // only when REJECTED
}

/**
 * QR-based check-in. Sends the value decoded from the restaurant's QR code;
 * the backend verifies it belongs to the user's restaurant.
 */
export async function postQrCheckIn(code: string): Promise<CheckInResponse> {
    return apiRequest<CheckInResponse>('POST', '/attendance/qr-check-in', { code });
}

export interface AttendanceStatusResponse {
    status: 'open' | 'completed' | 'none';
    attendance?: any;
}

export async function getAttendanceStatus(): Promise<AttendanceStatusResponse> {
    return apiRequest<AttendanceStatusResponse>('GET', '/attendance/status');
}

export interface CheckOutResponse {
    status: 'CHECKED_OUT';
    checkedInAt: string;
    checkedOutAt: string;
}

export async function postCheckOut(): Promise<CheckOutResponse> {
    return apiRequest<CheckOutResponse>('POST', '/attendance/check-out');
}

/** The current restaurant's attendance QR value (manager/admin — to print). */
export async function getSiteQr(): Promise<{ qrToken: string; companyName: string }> {
    return apiRequest<{ qrToken: string; companyName: string }>('GET', '/attendance/site-qr');
}
