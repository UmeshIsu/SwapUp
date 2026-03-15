import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// POST /api/swap-requests
export const createSwapRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requesterShiftId, targetEmployeeId, targetShiftId, reason } = req.body;
        const requesterId = req.user!.id;

        if (!requesterShiftId || !targetEmployeeId || !targetShiftId) {
            res.status(400).json({ error: 'requesterShiftId, targetEmployeeId, and targetShiftId are required' });
            return;
        }

        const [reqShift, targetShift] = await Promise.all([
            prisma.shift.findUnique({ where: { id: requesterShiftId } }),
            prisma.shift.findUnique({ where: { id: targetShiftId } }),
        ]);

        if (!reqShift || !targetShift) {
            res.status(404).json({ error: 'One or both shifts not found' });
            return;
        }

        const reqDate = new Date(reqShift.date).toDateString();
        const tgtDate = new Date(targetShift.date).toDateString();
        if (reqDate !== tgtDate) {
            res.status(400).json({ error: 'Both shifts must be on the same date' });
            return;
        }

        const existing = await prisma.swapRequest.findFirst({
            where: {
                requesterId,
                targetId: targetEmployeeId,
                requesterShiftId,
                targetShiftId,
                status: 'PENDING',
            },
        });

        if (existing) {
            res.status(409).json({ error: 'A pending swap request already exists for these shifts' });
            return;
        }

        const swapRequest = await prisma.swapRequest.create({
            data: {
                requesterId,
                targetId: targetEmployeeId,
                requesterShiftId,
                targetShiftId,
                reason: reason || '',
            },
            include: {
                // Uses real schema relation names
                requester: { select: { name: true, role: true } },
                target: { select: { name: true } },
                requesterShift: true,
                targetShift: true,
            },
        });

        res.status(201).json(swapRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create swap request' });
    }
};

// GET /api/swap-requests/incoming — Employee B sees swap request cards (Sent Swap Request tab)
export const getIncomingRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetId = req.user!.id;

        const requests = await prisma.swapRequest.findMany({
            where: { targetId, status: 'PENDING' },
            include: {
                requester: { select: { id: true, name: true, role: true } },
                requesterShift: true,
                targetShift: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = requests.map((r: any) => ({
            id: r.id,
            requester: { id: r.requester.id, name: r.requester.name, role: r.requester.role },
            proposedShift: {
                role: r.requesterShift.role,
                date: r.requesterShift.date,
                startTime: r.requesterShift.startTime,
                endTime: r.requesterShift.endTime,
            },
            myShift: {
                role: r.targetShift.role,
                date: r.targetShift.date,
                startTime: r.targetShift.startTime,
                endTime: r.targetShift.endTime,
            },
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt,
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch incoming requests' });
    }
};

// PATCH /api/swap-requests/:id/respond — Employee B accepts or rejects
export const respondToRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { action } = req.body;
        const targetId = req.user!.id;

        if (!['ACCEPT', 'REJECT'].includes(action)) {
            res.status(400).json({ error: 'action must be ACCEPT or REJECT' });
            return;
        }

        const swapRequest = await prisma.swapRequest.findUnique({ where: { id } });

        if (!swapRequest) {
            res.status(404).json({ error: 'Swap request not found' });
            return;
        }

        if (swapRequest.targetId !== targetId) {
            res.status(403).json({ error: 'You are not the target of this request' });
            return;
        }

        if (swapRequest.status !== 'PENDING') {
            res.status(400).json({ error: `Request is already ${swapRequest.status}` });
            return;
        }

        const updated = await prisma.swapRequest.update({
            where: { id },
            data: { status: action === 'ACCEPT' ? 'ACCEPTED_BY_EMPLOYEE' : 'DECLINED_BY_EMPLOYEE' },
        });

        const message = action === 'ACCEPT'
            ? 'Request accepted. Sent to manager for approval.'
            : 'Request declined.';

        res.json({ message, request: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to respond to swap request' });
    }
};

// GET /api/swap-requests/my-requests — Employee A's outgoing request history
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const requesterId = req.user!.id;

        const requests = await prisma.swapRequest.findMany({
            where: { requesterId },
            include: {
                target: { select: { id: true, name: true } },
                requesterShift: true,
                targetShift: true,
                message: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = requests.map((r: any) => ({
            id: r.id,
            target: { id: r.target.id, name: r.target.name },
            requesterShift: {
                date: r.requesterShift.date,
                startTime: r.requesterShift.startTime,
                endTime: r.requesterShift.endTime,
            },
            targetShift: {
                date: r.targetShift.date,
                startTime: r.targetShift.startTime,
                endTime: r.targetShift.endTime,
            },
            status: r.status,
            lastMessage: r.message?.content ?? null,
            lastMessageTime: r.message?.createdAt ?? r.createdAt,
            createdAt: r.createdAt,
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your requests' });
    }
};

// GET /api/swap-requests/manager-queue — Manager sees accepted requests from their department
export const getManagerQueue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { department, role } = req.user!;

        if (role !== 'MANAGER') {
            res.status(403).json({ error: 'Only managers can access this resource' });
            return;
        }

        const requests = await prisma.swapRequest.findMany({
            where: {
                status: 'ACCEPTED_BY_EMPLOYEE',
                requester: { department: department as any },
            },
            include: {
                requester: { select: { id: true, name: true, role: true } },
                target: { select: { id: true, name: true } },
                requesterShift: true,
                targetShift: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch manager queue' });
    }
};

// DELETE /api/swap-requests/:id — Requester withdraws a pending swap request
export const withdrawRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const requesterId = req.user!.id;

        const swapRequest = await prisma.swapRequest.findUnique({ where: { id } });

        if (!swapRequest) {
            res.status(404).json({ error: 'Swap request not found' });
            return;
        }

        if (swapRequest.requesterId !== requesterId) {
            res.status(403).json({ error: 'You are not the requester of this swap request' });
            return;
        }

        if (swapRequest.status !== 'PENDING') {
            res.status(400).json({ error: 'Can only withdraw pending requests' });
            return;
        }

        await prisma.swapRequest.delete({ where: { id } });

        res.json({ message: 'Swap request withdrawn successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to withdraw swap request' });
    }
};

// PATCH /api/swap-requests/:id/manager-respond — Manager approves or denies
export const managerRespond = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { action } = req.body;
        const { role } = req.user!;

        if (role !== 'MANAGER') {
            res.status(403).json({ error: 'Only managers can approve or deny swap requests' });
            return;
        }

        if (!['APPROVED', 'DENIED'].includes(action)) {
            res.status(400).json({ error: 'action must be APPROVED or DENIED' });
            return;
        }

        const swapRequest = await prisma.swapRequest.findUnique({ where: { id } });

        if (!swapRequest) {
            res.status(404).json({ error: 'Swap request not found' });
            return;
        }

        if (swapRequest.status !== 'ACCEPTED_BY_EMPLOYEE') {
            res.status(400).json({ error: 'This request is not awaiting manager approval' });
            return;
        }

        if (action === 'APPROVED') {
            // Atomic transaction — swaps both shifts and marks the request approved
            await prisma.$transaction([
                prisma.shift.update({
                    where: { id: swapRequest.requesterShiftId },
                    data: { employeeId: swapRequest.targetId },
                }),
                prisma.shift.update({
                    where: { id: swapRequest.targetShiftId },
                    data: { employeeId: swapRequest.requesterId },
                }),
                prisma.swapRequest.update({
                    where: { id },
                    data: { status: 'APPROVED_BY_MANAGER' },
                }),
            ]);
            res.json({ message: 'Swap approved. Shifts have been updated.' });
        } else {
            await prisma.swapRequest.update({
                where: { id },
                data: { status: 'REJECTED_BY_MANAGER' },
            });
            res.json({ message: 'Swap request denied.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process manager response' });
    }
};
