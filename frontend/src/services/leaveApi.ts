// leaveApi.ts
// This file handles all the API calls to the backend
// We use fetch() which is built into React Native

// Reads the base URL from your .env file (EXPO_PUBLIC_API_URL)
// Change the value in .env to match your local IP when testing on a real phone
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.100:5000/api';

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
    const response = await fetch(`${BASE_URL}/leaves/types`);
    if (!response.ok) throw new Error('Failed to fetch leave types');
    return response.json();
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
// Manager: Get all leave requests
// -----------------------------------------------
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const response = await fetch(`${BASE_URL}/leaves/manager`);
    if (!response.ok) throw new Error('Failed to fetch all leave requests');
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
