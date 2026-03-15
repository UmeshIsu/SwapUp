import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/src/constants/chatApi';

/**
 * Connects to the Socket.io server, joins the given conversation room,
 * and calls onMessage whenever a new_message event arrives.
 * Returns a send() helper to emit send_message events.
 */
export function useSocket(
    conversationId: string,
    onMessage: (msg: any) => void,
    onStatusUpdate?: (statusInfo: { swapRequestId: string; status: string }) => void,
) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(API_BASE_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.emit('join_room', conversationId);
        socket.on('new_message', onMessage);
        if (onStatusUpdate) {
            socket.on('swap_status_updated', (data) => {
                if (data.conversationId === conversationId) {
                    onStatusUpdate(data);
                }
            });
        }

        return () => {
            socket.emit('leave_room', conversationId);
            socket.disconnect();
        };
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        send: (data: object) => socketRef.current?.emit('send_message', data),
    };
}
