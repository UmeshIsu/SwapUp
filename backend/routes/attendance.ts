import { Router } from 'express';
import { postCheckIn, postQrCheckIn, postCheckOut, getAttendanceStatus } from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// POST /api/attendance/check-in  (geo-based — kept, no longer used by the app)
router.post('/check-in', postCheckIn);

// POST /api/attendance/qr-check-in  (QR-based attendance)
router.post('/qr-check-in', postQrCheckIn);

// POST /api/attendance/check-out
router.post('/check-out', postCheckOut);

// GET /api/attendance/status
router.get('/status', getAttendanceStatus);

export default router;
