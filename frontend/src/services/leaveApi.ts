// leaveApi.ts
// This file handles all the API calls to the backend
// We use fetch() which is built into React Native

import { API_BASE_URL as BASE_URL } from '../utils/config';

// Type definitions - these describe the shape of data we get from the backend
export type LeaveType = {
    id: string; // Changed to string for UUID
    name: string;
    totalDays: number;
};

export type AssignedLeave = {
    id: string;
    name: string;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
};

export type LeaveSummary = {
    assignedLeaves: AssignedLeave[];
    totalRemaining: number;
    absentThisMonth: number;
};

export type LeaveRequest = {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    leave_type_name: string; // Joined fields
    employee_name: string;
    employee_role: string;
    startDate: string;
    endDate: string;
    dayType: string;
    reason: string;
    status: string;
    createdAt: string;
};

// -----------------------------------------------
// Get all leave types from backend
// -----------------------------------------------
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
    // 5-second timeout to prevent infinite hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${BASE_URL}/leaves/types`, {
            signal: controller.signal as any
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Failed to fetch leave types');
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

// -----------------------------------------------
// Get leave summary for an employee
// (assigned days, remaining, absent this month)
// -----------------------------------------------
export const getLeaveSummary = async (employeeId: string): Promise<LeaveSummary> => {
    const response = await fetch(`${BASE_URL}/leaves/summary/${employeeId}`);
    if (!response.ok) throw new Error('Failed to fetch leave summary');
    return response.json();
};

// -----------------------------------------------
// Submit a new leave request
// -----------------------------------------------
export const submitLeaveRequest = async (data: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    dayType: string;
    reason: string;
}): Promise<{ message: string; leaveRequest: LeaveRequest }> => {
    const response = await fetch(`${BASE_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit leave request');
    return response.json();
};

// -----------------------------------------------
// Get pending leave requests for an employee
// -----------------------------------------------
export const getPendingRequests = async (employeeId: string): Promise<LeaveRequest[]> => {
    const response = await fetch(`${BASE_URL}/leaves/pending/${employeeId}`);
    if (!response.ok) throw new Error('Failed to fetch pending requests');
    return response.json();
};

// -----------------------------------------------
// Withdraw (cancel) a leave request
// -----------------------------------------------
export const withdrawLeaveRequest = async (leaveId: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/leaves/${leaveId}/withdraw`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to withdraw request');
    return response.json();
};

// -----------------------------------------------
// Get ALL leave requests for the current employee
// (pending + approved + declined — for Request Status screen)
// -----------------------------------------------
export const getMyRequests = async (employeeId: string): Promise<LeaveRequest[]> => {
    const response = await fetch(`${BASE_URL}/leaves/my-requests/${employeeId}`);
    if (!response.ok) throw new Error('Failed to fetch your requests');
    return response.json();
};

// -----------------------------------------------
// Manager: Get leave requests filtered by department
// -----------------------------------------------
export const getManagerLeaveRequests = async (managerId: string): Promise<LeaveRequest[]> => {
    const response = await fetch(`${BASE_URL}/leaves/manager/${managerId}`);
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    return response.json();
};

// -----------------------------------------------
// Manager: Approve a leave request
// -----------------------------------------------
export const approveLeaveRequest = async (leaveId: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/leaves/${leaveId}/approve`, {
        method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to approve request');
    return response.json();
};

// -----------------------------------------------
// Manager: Decline a leave request
// -----------------------------------------------
export const declineLeaveRequest = async (leaveId: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/leaves/${leaveId}/decline`, {
        method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to decline request');
    return response.json();
};
