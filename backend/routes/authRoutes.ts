import express, { Router } from "express";
import { 
  signup, 
  login, 
  verifyHotel, 
  sendVerificationCode, 
  verifyWorkerId,
  verifyOtp 
} from "../controllers/authController";

const router: Router = express.Router();

/**
 * @route   POST /api/auth/verify-hotel
 * @desc    Step 1: Check if the hotel exists (Tenant check)
 */
router.post("/verify-hotel", verifyHotel);
