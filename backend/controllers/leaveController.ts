import { type Request, type Response } from 'express';
import prisma from '../prisma/prismaClient.js';

/**
 * Grabs all the different types of leave available (like Sick, Annual, etc.)
 */
export const getLeaveTypes = async (req: Request, res: Response) => {
    try {
        const types = await prisma.leaveType.findMany({
            orderBy: { createdAt: 'asc' }
        });
        res.json(types);
    } catch (error: any) {
        console.error('Error getting leave types:', error.message);
        res.status(500).json({ message: 'Something went wrong while fetching leave types' });
    }
};

/**
 * Calculates how many leave days an employee has left and what they've already used.
 */
export const getLeaveSummary = async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    if (!employeeId || typeof employeeId !== 'string') {
        return res.status(400).json({ message: 'A valid Employee ID is required' });
    }

    try {
        // First, get all the leave types we have
        const leaveTypes = await prisma.leaveType.findMany();

        // Now, find all approved leave requests for this specific employee
        const approvedRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId: employeeId,
                status: 'approved'
            }
        });

        // Group the used days by leave type
        const usedMap: Record<string, number> = {};
        approvedRequests.forEach(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            usedMap[req.leaveTypeId] = (usedMap[req.leaveTypeId] || 0) + diffDays;
        });

        // Map everything together so the frontend knows the totals and remainders
        const assignedLeaves = leaveTypes.map(lt => ({
            id: lt.id,
            name: lt.name,
            totalDays: lt.totalDays,
            usedDays: usedMap[lt.id] || 0,
            remainingDays: lt.totalDays - (usedMap[lt.id] || 0),
        }));

        const totalRemaining = assignedLeaves.reduce((sum, lt) => sum + lt.remainingDays, 0);

        // Figure out how many times they were absent this specific month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const absentThisMonthCount = await prisma.leaveRequest.count({
            where: {
                employeeId: employeeId,
                status: 'approved',
                startDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        res.json({
            assignedLeaves,
            totalRemaining,
            absentThisMonth: absentThisMonthCount,
        });
    } catch (error: any) {
        console.error('Error getting leave summary:', error.message);
        res.status(500).json({ message: 'Failed to calculate leave summary' });
    }
};

/**
 * This is where an employee actually submits a new request.
 */
export const createLeaveRequest = async (req: Request, res: Response) => {
    const { employeeId, leaveTypeId, startDate, endDate, dayType, reason } = req.body;

    // Basic check to make sure the essential info is there
    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide all the required leave details' });
    }

    try {
        const newRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employeeId as string,
                leaveTypeId: leaveTypeId as string,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                dayType: dayType || 'full',
                reason: reason || '',
                status: 'pending' // Every new request starts as pending
            }
        });

        res.status(201).json({ 
            message: 'Your leave request has been sent to your manager!', 
            leaveRequest: newRequest 
        });
    } catch (error: any) {
        console.error('Error creating leave request:', error.message);
        res.status(500).json({ message: 'Could not submit your leave request right now' });
    }
};

/**
 * Gets a list of all requests that are still waiting for a decision.
 */
export const getPendingRequests = async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    if (!employeeId || typeof employeeId !== 'string') {
        return res.status(400).json({ message: 'A valid Employee ID is required' });
    }

    try {
        const pending = await prisma.leaveRequest.findMany({
            where: {
                employeeId: employeeId,
                status: 'pending'
            },
            include: {
                leaveType: true,
                employee: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Flatten the structure a bit to make it easier for the frontend to read
        const formatted = pending.map((p: any) => ({
            ...p,
            leave_type_name: p.leaveType.name,
            employee_name: p.employee.name,
            employee_role: p.employee.role
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error getting pending requests:', error.message);
        res.status(500).json({ message: 'Error loading your pending requests' });
    }
};

/**
 * Let the employee cancel a request if the manager hasn't looked at it yet.
 */
export const withdrawLeaveRequest = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'A valid request ID is required' });
    }

    try {
        // We only allow deleting it if it's still pending
        const deleted = await prisma.leaveRequest.deleteMany({
            where: {
                id: id,
                status: 'pending'
            }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ message: 'Could not find the request, or it might have already been processed' });
        }

        res.json({ message: 'Request withdrawn successfully' });
    } catch (error: any) {
        console.error('Error withdrawing request:', error.message);
        res.status(500).json({ message: 'Failed to withdraw the request' });
    }
};

/**
 * Manager's view: list absolutely everything so they can see history and current tasks.
 */
export const getAllLeaveRequests = async (req: Request, res: Response) => {
    try {
        const allRequests = await prisma.leaveRequest.findMany({
            include: {
                leaveType: true,
                employee: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Match the legacy format so we don't break the frontend lists
        const formatted = allRequests.map((r: any) => ({
            ...r,
            leave_type_name: r.leaveType.name,
            employee_name: r.employee.name,
            employee_role: r.employee.role
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error getting all leave requests:', error.message);
        res.status(500).json({ message: 'Could not load leave requests for management' });
    }
};

/**
 * Manager approves a request.
 */
export const approveLeaveRequest = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'A valid request ID is required' });
    }

    try {
        const updated: any = await prisma.leaveRequest.update({
            where: { id: id },
            data: { status: 'approved' },
            include: {
                employee: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json({ message: 'Leave request approved', leaveRequest: updated });
    } catch (error: any) {
        console.error('Error approving leave request:', error.message);
        res.status(500).json({ message: 'Failed to approve the leave request' });
    }
};

/**
 * Manager declines a request.
 */
export const declineLeaveRequest = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'A valid request ID is required' });
    }

    try {
        const updated: any = await prisma.leaveRequest.update({
            where: { id: id },
            data: { status: 'declined' },
            include: {
                employee: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json({ message: 'Leave request declined', leaveRequest: updated });
    } catch (error: any) {
        console.error('Error declining leave request:', error.message);
        res.status(500).json({ message: 'Failed to decline the leave request' });
    }
};
