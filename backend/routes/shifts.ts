import { Router } from 'express';
import { getMyShifts, getColleagues, bulkCreateShifts, getTodayShift, exportToICS } from '../controllers/shiftsController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/my-shifts', getMyShifts);
router.get('/today', getTodayShift);
router.get('/colleagues', getColleagues);
router.get('/export', exportToICS);
router.post('/bulk', authorize('MANAGER'), bulkCreateShifts);

export default router;
