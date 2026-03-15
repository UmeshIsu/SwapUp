// -------------------------------------------------------
// shiftService.ts
// Matches backend routes/shifts.ts endpoints
// All routes require auth (token attached by apiClient)
// -------------------------------------------------------

import { apiRequest } from './apiClient';

// ---------------------------------------------------------------------------
// Types (matching controller response shapes)
// ---------------------------------------------------------------------------

export interface Shift {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    employeeId: string;
    branch: string;
}

export interface Colleague {
    shiftId: string;
    employeeId: string;
    name: string;
    role: string;
    startTime: string;
    endTime: string;
}

// ---------------------------------------------------------------------------
// GET /api/shifts/my-shifts
// Returns all shifts belonging to the authenticated employee, ordered by date
// ---------------------------------------------------------------------------
export const getMyShifts = () =>
    apiRequest<Shift[]>('GET', '/shifts/my-shifts');

// ---------------------------------------------------------------------------
// GET /api/shifts/colleagues?date=YYYY-MM-DD
// Returns colleagues from the same branch who have a shift on the given date
// (excludes the authenticated user and managers)
// ---------------------------------------------------------------------------
export const getColleaguesByDate = (date: string) =>
    apiRequest<Colleague[]>('GET', '/shifts/colleagues', undefined, { date });
