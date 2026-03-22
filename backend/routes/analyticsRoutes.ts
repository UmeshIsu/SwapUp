import { Router } from 'express';
import {
    getMonthlyAnalytics,
    getPunctualityDetails,
    getAbsenteeDetails,
    getOvertimeDetails,
    exportMonthlyReport,
    getEmployeeAnalyticsForManager,
} from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// GET /api/analytics/monthly?month=YYYY-MM
router.get('/monthly', getMonthlyAnalytics);

// GET /api/analytics/punctuality?month=YYYY-MM
router.get('/punctuality', getPunctualityDetails);

// GET /api/analytics/absentee?month=YYYY-MM
router.get('/absentee', getAbsenteeDetails);

// GET /api/analytics/overtime?month=YYYY-MM
router.get('/overtime', getOvertimeDetails);

// GET /api/analytics/export?month=YYYY-MM
router.get('/export', exportMonthlyReport);

// GET /api/analytics/employee/:employeeId?month=YYYY-MM
router.get('/employee/:employeeId', getEmployeeAnalyticsForManager);

export default router;
