// -------------------------------------------------------
// chatService.ts
// Matches backend routes/chat.ts endpoints
// All routes require auth (token attached by apiClient)
// -------------------------------------------------------

import { apiRequest } from './apiClient';

// ---------------------------------------------------------------------------
// Types (matching controller response shapes)
// ---------------------------------------------------------------------------

export interface ChatThread {
    threadId: string;           // same as swapRequestId
    participant: { id: string; name: string };
    lastMessage: string;
    lastMessageTime: string;
}

export interface ChatMessage {
    id: string;
    sender: { id: string; name: string };
    content: string;
    sentAt: string;
    isMe: boolean;              // true when the message was sent by the logged-in user
}

// ---------------------------------------------------------------------------
// GET /api/chat/threads
// Returns all chat threads (swap requests with at least one message) for the user
// ---------------------------------------------------------------------------
export const getChatThreads = () =>
    apiRequest<ChatThread[]>('GET', '/chat/threads');

// ---------------------------------------------------------------------------
// GET /api/chat/messages/:swapRequestId
// Returns all messages in a specific swap request thread, ordered oldest → newest
// ---------------------------------------------------------------------------
export const getMessages = (swapRequestId: string) =>
    apiRequest<ChatMessage[]>('GET', `/chat/messages/${swapRequestId}`);

// ---------------------------------------------------------------------------
// POST /api/chat/messages/:swapRequestId
// Sends a new message in a specific swap request thread
// Both the requester and target employee can send messages
// ---------------------------------------------------------------------------
export const sendMessage = (swapRequestId: string, content: string) =>
    apiRequest<ChatMessage>('POST', `/chat/messages/${swapRequestId}`, { content });
