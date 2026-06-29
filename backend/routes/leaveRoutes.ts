import express from 'express';
import {
    getLeaveTypes,
    getLeaveSummary,
    createLeaveRequest,
    getPendingRequests,
    withdrawLeaveRequest,
    getMyRequests,
    getManagerLeaveRequests,
    approveLeaveRequest,
    declineLeaveRequest,
} from '../controllers/leaveController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// --- Employee Routes ---
router.get('/types', getLeaveTypes);
router.get('/summary/:employeeId', getLeaveSummary);
router.post('/', createLeaveRequest);
router.get('/pending/:employeeId', getPendingRequests);
router.get('/my-requests/:employeeId', getMyRequests);
router.delete('/:id/withdraw', withdrawLeaveRequest);

// --- Manager Routes (auth required) ---
router.get('/manager/:managerId', authMiddleware, authorize('MANAGER'), getManagerLeaveRequests);
router.patch('/:id/approve', authMiddleware, authorize('MANAGER'), approveLeaveRequest);
router.patch('/:id/decline', authMiddleware, authorize('MANAGER'), declineLeaveRequest);

export default router;
