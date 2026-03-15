import { Router } from 'express';
import {
    createSwapRequest,
    getIncomingRequests,
    respondToRequest,
    getMyRequests,
    getManagerQueue,
    managerRespond,
    withdrawRequest,
} from '../controllers/swapRequestsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createSwapRequest);
router.get('/incoming', getIncomingRequests);
router.patch('/:id/respond', respondToRequest);
router.get('/my-requests', getMyRequests);
router.get('/manager-queue', getManagerQueue);
router.patch('/:id/manager-respond', managerRespond);
router.delete('/:id', withdrawRequest);

export default router;
