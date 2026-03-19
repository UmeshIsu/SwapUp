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

const router = express.Router();

// --- Employee Routes ---
router.get('/types', getLeaveTypes);
router.get('/summary/:employeeId', getLeaveSummary);
router.post('/', createLeaveRequest);
router.get('/pending/:employeeId', getPendingRequests);
router.get('/my-requests/:employeeId', getMyRequests);
router.delete('/:id/withdraw', withdrawLeaveRequest);

// --- Manager Routes ---
router.get('/manager/:managerId', getManagerLeaveRequests);
router.patch('/:id/approve', approveLeaveRequest);
router.patch('/:id/decline', declineLeaveRequest);

export default router;
