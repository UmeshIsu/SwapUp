import { Router } from 'express';
import { postCheckIn } from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// POST /api/attendance/check-in
router.post('/check-in', postCheckIn);

export default router;
