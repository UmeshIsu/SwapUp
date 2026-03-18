// -------------------------------------------------------
// swapService.ts
// Matches backend routes/swapRequests.ts endpoints
// All routes require auth (token attached by apiClient)
// -------------------------------------------------------

import { apiRequest } from './apiClient';

// ---------------------------------------------------------------------------
// Types (matching controller response shapes)
// ---------------------------------------------------------------------------

export interface SwapShift {
    role: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface IncomingSwapRequest {
    id: string;
    requester: { id: string; name: string; role: string };
    proposedShift: SwapShift;  // requester's shift they are offering
    myShift: SwapShift;        // your shift they want
    reason: string;
    status: string;
    createdAt: string;
}

export interface MySwapRequest {
    id: string;
    target: { id: string; name: string };
    requesterShift: { date: string; startTime: string; endTime: string };
    targetShift: { date: string; startTime: string; endTime: string };
    status: 'PENDING' | 'ACCEPTED_BY_EMPLOYEE' | 'DECLINED_BY_EMPLOYEE' | 'APPROVED_BY_MANAGER' | 'REJECTED_BY_MANAGER';
    lastMessage: string | null;
    lastMessageTime: string;
    createdAt: string;
}

export interface ManagerQueueItem {
    id: string;
    requester: { id: string; name: string; role: string };
    target: { id: string; name: string };
    requesterShift: { date: string; startTime: string; endTime: string; role: string };
    targetShift: { date: string; startTime: string; endTime: string; role: string };
    status: string;
    managerStatus: string;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// POST /api/swap-requests
// Employee A creates a new swap request
// ---------------------------------------------------------------------------
export interface CreateSwapRequestPayload {
    requesterShiftId: string;
    targetEmployeeId: string;
    targetShiftId: string;
    reason?: string;
}

export const createSwapRequest = (payload: CreateSwapRequestPayload) =>
    apiRequest<IncomingSwapRequest>('POST', '/swap-requests', payload);

// ---------------------------------------------------------------------------
// GET /api/swap-requests/incoming
// Employee B — see incoming pending requests directed at them
// ---------------------------------------------------------------------------
export const getIncomingSwapRequests = () =>
    apiRequest<IncomingSwapRequest[]>('GET', '/swap-requests/incoming');

// ---------------------------------------------------------------------------
// PATCH /api/swap-requests/:id/respond
// Employee B — accept or reject a specific swap request
// action: 'ACCEPT' | 'REJECT'
// ---------------------------------------------------------------------------
export const respondToSwapRequest = (id: string, action: 'ACCEPT' | 'REJECT') =>
    apiRequest<{ message: string; request: MySwapRequest }>('PATCH', `/swap-requests/${id}/respond`, { action });

// ---------------------------------------------------------------------------
// GET /api/swap-requests/my-requests
// Employee A — see their own outgoing request history
// ---------------------------------------------------------------------------
export const getMySwapRequests = () =>
    apiRequest<MySwapRequest[]>('GET', '/swap-requests/my-requests');

// ---------------------------------------------------------------------------
// GET /api/swap-requests/manager-queue
// Manager only — see ACCEPTED requests awaiting manager approval in their branch
// ---------------------------------------------------------------------------
export const getManagerQueue = () =>
    apiRequest<ManagerQueueItem[]>('GET', '/swap-requests/manager-queue');

// ---------------------------------------------------------------------------
// PATCH /api/swap-requests/:id/manager-respond
// Manager only — approve or deny a swap request
// action: 'APPROVED' | 'DENIED'
// ---------------------------------------------------------------------------
export const managerRespondToSwap = (id: string, action: 'APPROVED' | 'DENIED') =>
    apiRequest<{ message: string }>('PATCH', `/swap-requests/${id}/manager-respond`, { action });

// ---------------------------------------------------------------------------
// DELETE /api/swap-requests/:id
// Employee A — withdraws a pending request
// ---------------------------------------------------------------------------
export const withdrawSwapRequest = (id: string) =>
    apiRequest<{ message: string }>('DELETE', `/swap-requests/${id}`);
