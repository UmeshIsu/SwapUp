import { API_BASE_URL } from '../constants/chatApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to build headers with auth token
const getHeaders = async (json = true): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    if (json) headers['Content-Type'] = 'application/json';
    const token = await AsyncStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

export interface Conversation {
    id: string;
    participantName: string;
    participantAvatar: string | null;
    lastMessage: string;
    lastMessageTime: string;
}

export interface SwapRequest {
    id: string;
    recipientName?: string;
    recipientAvatar?: string | null;
    requesterName?: string;
    requesterAvatar?: string | null;
    senderName?: string; // For manager approvals
    senderAvatar?: string | null; // For manager approvals
    theirShift?: string;
    requestedShift?: string;
    proposedShift?: string; // For manager approvals
    status: 'PENDING' | 'ACCEPTED_BY_EMPLOYEE' | 'DECLINED_BY_EMPLOYEE' | 'APPROVED_BY_MANAGER' | 'REJECTED_BY_MANAGER';
    createdAt: string;
    conversationId?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    content: string;
    type: 'TEXT' | 'SWAP_REQUEST';
    createdAt: string;
    swapRequest?: {
        id: string;
        proposedShift: string;
        requestedShift: string;
        targetName: string;
        targetAvatar: string | null;
        status: string;
    } | null;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * Fetch conversations for a specific user
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${userId}`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
};

/**
 * Fetch swap requests sent by the user
 */
export const getSentSwapRequests = async (userId: string): Promise<SwapRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/sent-swap-requests/${userId}`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch sent swap requests');
    return response.json();
};

/**
 * Fetch swap requests received by the user
 */
export const getIncomingSwapRequests = async (userId: string): Promise<SwapRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/incoming-swap-requests/${userId}`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch incoming swap requests');
    return response.json();
};

/**
 * Fetch messages for a specific conversation
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages/${conversationId}`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
};

/**
 * Respond to a swap request (Accept/Decline/Approve/Reject)
 */
export const respondToSwapRequest = async (id: string, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/swap-requests/${id}`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update swap request status');
};

/**
 * Send a new text message in a conversation
 */
export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
            conversationId,
            senderId,
            content,
            type: 'TEXT'
        }),
    });
    if (!response.ok) throw new Error('Failed to send message');
};

/**
 * Send a new swap request message
 */
export const sendSwapRequest = async (
    conversationId: string,
    senderId: string,
    targetId: string,
    requesterShiftId: string,
    targetShiftId: string
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
            conversationId,
            senderId,
            content: 'I would like to swap shifts with you.',
            type: 'SWAP_REQUEST',
            swapRequest: {
                requesterId: senderId,
                targetId,
                requesterShiftId,
                targetShiftId,
                reason: 'Standard swap request',
            },
        }),
    });
    if (!response.ok) throw new Error('Failed to send swap request');
};

/**
 * Start or get an existing conversation between users
 */
export const createConversation = async (userIds: string[]): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ userIds }),
    });
    if (!response.ok) throw new Error('Failed to create/get conversation');
    return response.json();
};

/**
 * [MANAGER ONLY] Fetch all swap requests needing approval
 */
export const getManagerSwapApprovals = async (): Promise<SwapRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/manager/swap-approvals`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch manager approvals');
    return response.json();
};

// ─── Department User Search ──────────────────────────────────────────────────

export interface DepartmentUser {
    id: string;
    name: string;
    email: string;
    role: 'EMPLOYEE' | 'MANAGER';
    department: string;
    avatarUrl: string | null;
}

/**
 * Search employees/managers within the same department by name
 */
export const searchDepartmentUsers = async (
    query: string,
    department: string,
    excludeUserId: string,
    tenantId?: string,
): Promise<DepartmentUser[]> => {
    if (!query.trim()) return [];
    const params = new URLSearchParams({ query, department, excludeUserId });
    if (tenantId) params.append('tenantId', tenantId);
    const response = await fetch(`${API_BASE_URL}/api/chat/users/search?${params}`, {
        headers: await getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
};
