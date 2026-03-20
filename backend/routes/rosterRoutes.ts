import { Router } from 'express';
import { getRoster } from '../controllers/rosterController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authMiddleware to all roster routes
router.use(authMiddleware);

// GET /api/roster?start=ISO_DATE&end=ISO_DATE
router.get('/', getRoster);

export default router;