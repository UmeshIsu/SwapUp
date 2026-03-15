import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://10.0.2.2:5000';

class SocketService {
    private socket: Socket | null = null;
    private messageListeners: ((message: any) => void)[] = [];
    private typingListeners: ((data: any) => void)[] = [];

    async connect(): Promise<void> {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            console.log('No token available for socket connection');
            return;
        }

        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // Handle incoming messages
        this.socket.on('newMessage', (message) => {
            this.messageListeners.forEach(listener => listener(message));
        });

        // Handle message sent confirmation
        this.socket.on('messageSent', (message) => {
            this.messageListeners.forEach(listener => listener(message));
        });

        // Handle typing indicators
        this.socket.on('userTyping', (data) => {
            this.typingListeners.forEach(listener => listener({ ...data, isTyping: true }));
        });

        this.socket.on('userStoppedTyping', (data) => {
            this.typingListeners.forEach(listener => listener({ ...data, isTyping: false }));
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.messageListeners = [];
        this.typingListeners = [];
    }

    sendMessage(receiverId: string, content: string, swapRequestId?: string): void {
        if (this.socket?.connected) {
            this.socket.emit('sendMessage', { receiverId, content, swapRequestId });
        } else {
            console.error('Socket not connected');
        }
    }

    sendTyping(receiverId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('typing', { receiverId });
        }
    }

    sendStopTyping(receiverId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('stopTyping', { receiverId });
        }
    }

    onMessage(callback: (message: any) => void): () => void {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(l => l !== callback);
        };
    }

    onTyping(callback: (data: any) => void): () => void {
        this.typingListeners.push(callback);
        return () => {
            this.typingListeners = this.typingListeners.filter(l => l !== callback);
        };
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
export default socketService;
