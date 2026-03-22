// -----------------------------------------------------------------------
// attendanceService.ts
// Wraps the backend POST /attendance/check-in endpoint.
// The real auth token is injected automatically by apiClient (AsyncStorage).
// -----------------------------------------------------------------------

import { apiRequest } from './apiClient';

export interface CheckInResponse {
    status: 'APPROVED' | 'REJECTED';
    checkedInAt?: string; // ISO string — only when APPROVED
    distanceM?: number;
    reason?: string;      // only when REJECTED
}

/**
 * Send the employee's GPS coordinates to the backend for verification.
 *
 * @param userId   - the logged-in user's id (for auditing; backend re-derives it from the JWT)
 * @param lat      - latitude from expo-location
 * @param lng      - longitude from expo-location
 * @param accuracy - GPS accuracy in metres (passed for logging)
 * @param token    - Kept for compatibility with the component's signature, though apiClient handles tokens
 */
export async function postCheckIn(
    userId: string,
    lat: number,
    lng: number,
    accuracy: number,
    token: string
): Promise<CheckInResponse> {
    return apiRequest<CheckInResponse>('POST', '/attendance/check-in', {
        userId,
        lat,
        lng,
        accuracy,
        token,
    });
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
