import { Router } from 'express';
import {
    postQrCheckIn,
    postCheckOut,
    getAttendanceStatus,
    getSiteQr,
    regenerateSiteQr,
} from '../controllers/attendanceController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// POST /api/attendance/qr-check-in  (scan the restaurant QR to mark attendance)
router.post('/qr-check-in', postQrCheckIn);

// POST /api/attendance/check-out
router.post('/check-out', postCheckOut);

// GET /api/attendance/status
router.get('/status', getAttendanceStatus);

// GET /api/attendance/site-qr  — this restaurant's attendance QR value (to print)
router.get('/site-qr', authorize('MANAGER', 'ADMIN'), getSiteQr);

// POST /api/attendance/site-qr/regenerate  — rotate the QR token (admin only)
router.post('/site-qr/regenerate', authorize('ADMIN'), regenerateSiteQr);

export default router;
