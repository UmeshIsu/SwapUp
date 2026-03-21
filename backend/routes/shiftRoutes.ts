import { Router } from "express";
import { getMyShifts, getShiftById } from "../controllers/shiftController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/my", authMiddleware, getMyShifts);
router.get("/:id", authMiddleware, getShiftById);

export default router;
