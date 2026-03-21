import { Router } from 'express';
import { getMyShifts, getColleagues, checkOut } from '../controllers/shiftsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/my-shifts', getMyShifts);
router.get('/colleagues', getColleagues);
router.put('/:id/check-out', checkOut);

export default router;
