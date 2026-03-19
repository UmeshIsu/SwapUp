import { apiRequest } from './apiClient';

export interface CheckInResponse {
    status: 'APPROVED' | 'REJECTED';
    reason: string;
    checkedInAt: string;
    distanceM: number;
}

//Submits a check-in request with location data.

export async function postCheckIn(
    userId: string,
    lat: number,
    lng: number,
    accuracy: number,
    token: string // Kept for compatibility with the component's signature, though apiClient might handle tokens
): Promise<CheckInResponse> {
    return apiRequest<CheckInResponse>('POST', '/attendance/check-in', {
        userId,
        lat,
        lng,
        accuracy,
        token,
    });
}
