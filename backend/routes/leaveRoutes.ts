import express from 'express';
import {
    getLeaveTypes,
    getLeaveSummary,
    createLeaveRequest,
    getPendingRequests,
    withdrawLeaveRequest,
    getAllLeaveRequests,
    approveLeaveRequest,
    declineLeaveRequest,
} from '../controllers/leaveController.js';

const router = express.Router();

// --- Employee Routes ---
router.get('/types', getLeaveTypes);
router.get('/summary/:employeeId', getLeaveSummary);
router.post('/', createLeaveRequest);
router.get('/pending/:employeeId', getPendingRequests);
router.delete('/:id/withdraw', withdrawLeaveRequest);

// --- Manager Routes ---
router.get('/manager', getAllLeaveRequests);
router.patch('/:id/approve', approveLeaveRequest);
router.patch('/:id/decline', declineLeaveRequest);

export default router;
