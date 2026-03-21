import { Router } from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
