import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Update this to your backend URL
import { API_BASE_URL } from '../utils/config';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            // Navigation to login will be handled by auth context
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        phone?: string;
        workerId?: string;
        role: 'EMPLOYEE' | 'MANAGER';
        hotelName?: string;
        department?: string;
        tenantId?: string;
    }) => api.post('/auth/register', data),

    login: (data: { email: string; password: string; role?: string }) =>
        api.post('/auth/login', data),

    verifyHotel: (hotelName: string) =>
        api.post('/auth/verify-hotel', { hotelName }),

    sendCode: (target: string, type: 'EMAIL' | 'PHONE') =>
        api.post('/auth/send-code', { target, type }),

    verifyOtp: (email: string, token: string) =>
        api.post('/auth/verify-otp', { email, token }),

    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
        api.put('/auth/profile', data),
    getAllEmployees: (params?: { department?: string }) => api.get('/auth/employees', { params }),
};

// Shift APIs
export const shiftAPI = {
    getMyShifts: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/shifts/my-shifts', { params }),
    getTodayShift: () => api.get('/shifts/today'),
    getAllShifts: (params?: { startDate?: string; endDate?: string; assignedToId?: string }) =>
        api.get('/shifts', { params }),
    createShift: (data: {
        date: string;
        startTime: string;
        endTime: string;
        location?: string;
        shiftRole?: string;
        shiftType?: string;
        assignedToId: string;
    }) => api.post('/shifts', data),
    createBulkShifts: (shifts: any[]) => api.post('/shifts/bulk', { shifts }),
    updateShift: (id: string, data: any) => api.put(`/shifts/${id}`, data),
    deleteShift: (id: string) => api.delete(`/shifts/${id}`),
    checkIn: (id: string) => api.put(`/shifts/${id}/check-in`),
    checkOut: (id: string) => api.put(`/shifts/${id}/check-out`),
    exportToICS: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/shifts/export', { params, responseType: 'text' }),
    getManagerDashboardStats: () => api.get('/shifts/manager-dashboard-stats'),
};

// Swap Request APIs
export const swapAPI = {
    createRequest: (data: {
        requesterShiftId: string;
        targetUserId: string;
        targetShiftId?: string;
        reason?: string;
    }) => api.post('/swap', data),
    getMySwapRequests: () => api.get('/swap/my'),
    getPendingPeerRequests: () => api.get('/swap/pending-peer'),
    getPendingManagerRequests: () => api.get('/swap/pending-manager'),
    peerAccept: (id: string, targetShiftId?: string) =>
        api.put(`/swap/${id}/peer-accept`, { targetShiftId }),
    peerReject: (id: string) => api.put(`/swap/${id}/peer-reject`),
    managerApprove: (id: string) => api.put(`/swap/${id}/manager-approve`),
    managerReject: (id: string) => api.put(`/swap/${id}/manager-reject`),
};

// Leave Request APIs
export const leaveAPI = {
    createRequest: (data: {
        type: 'SICK' | 'CASUAL' | 'ANNUAL';
        startDate: string;
        endDate: string;
        reason?: string;
    }) => api.post('/leave', data),
    getMyLeaveRequests: () => api.get('/leave/my'),
    getLeaveBalance: () => api.get('/leave/balance'),
    getPendingLeaveRequests: () => api.get('/leave/pending'),
    approveLeaveRequest: (id: string) => api.put(`/leave/${id}/approve`),
    rejectLeaveRequest: (id: string) => api.put(`/leave/${id}/reject`),
};

// Announcement APIs
export const announcementAPI = {
    getAnnouncements: () => api.get('/announcements'),
    createAnnouncement: (data: { title: string; content: string }) =>
        api.post('/announcements', data),
    updateAnnouncement: (id: string, data: { title?: string; content?: string; isActive?: boolean }) =>
        api.put(`/announcements/${id}`, data),
    deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
    getMyAnalytics: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/analytics/my', { params }),
    getDashboardStats: () => api.get('/analytics/dashboard'),
    getEmployeeAnalytics: (employeeId: string, params?: { startDate?: string; endDate?: string }) =>
        api.get(`/analytics/employee/${employeeId}`, { params }),
};

// Chat APIs
export const chatAPI = {
    getMessages: (params: { partnerId: string; swapRequestId?: string }) =>
        api.get('/chat/messages', { params }),
    sendMessage: (data: { receiverId: string; content: string; swapRequestId?: string }) =>
        api.post('/chat/messages', data),
    getConversations: () => api.get('/chat/conversations'),
    getUnreadCount: () => api.get('/chat/unread'),
};

export default api;
