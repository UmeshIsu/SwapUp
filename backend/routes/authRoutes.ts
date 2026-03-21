
import express, { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { 
  signup, 
  login, 
  verifyHotel, 
  sendVerificationCode, 
  verifyWorkerId,
  verifyOtp,
  getAllEmployees
} from "../controllers/authController";

const router: Router = express.Router();

/**
 * @route   POST /api/auth/verify-hotel
 * @desc    Step 1: Check if the hotel exists (Tenant check)
 */
router.post("/verify-hotel", verifyHotel);


/**
 * @route   POST /api/auth/send-code
 * @desc    Step 3/4: Sends OTP to work email
 */
router.post("/send-code", sendVerificationCode);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 5: Verifies the OTP code sent to email
 */
router.post("/verify-otp", verifyOtp);

/**
 * @route   POST /api/auth/verify-worker
 * @desc    Step 6: Validates the unique Worker ID against the selected hotel
 */
router.post("/verify-worker", verifyWorkerId);

/**
 * @route   POST /api/auth/signup
 * @desc    Step 7: Final account creation. 
 * Requires the 'role' (Manager/Employee) captured from the splash screen.
 */
router.post("/signup", signup);

/**
 * @route   POST /api/auth/register
 * @desc    Alias for /signup — the frontend calls this endpoint.
 */
router.post("/register", signup);

/**
 * @route   POST /api/auth/login
 * @desc    Role-based login. Validates credentials and ensures the user 
 * is logging into the correct interface (Manager vs Employee).
 */
router.post("/login", login);


/**
 * @route   GET /api/auth/employees
 * @desc    Get all employees for the manager's hotel
 */
router.get("/employees", authMiddleware, getAllEmployees);


export default router;
