import { Router } from 'express';
import { postCheckIn, postCheckOut } from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// POST /api/attendance/check-in
router.post('/check-in', postCheckIn);

// POST /api/attendance/check-out
router.post('/check-out', postCheckOut);

export default router;
