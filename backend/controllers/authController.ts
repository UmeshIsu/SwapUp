import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient";
import { supabase } from "../config/supabaseClient";

// --- Interfaces ---

interface VerifyHotelBody { hotelName: string; }
interface OTPBody { target: string; type: "EMAIL" | "PHONE"; }
interface VerifyWorkerBody { workerId: string; tenantId: string; }
interface VerifyOtpBody { email: string; token: string; }

interface SignupBody {
  name: string;
  email: string;
  phone: string;
  workerId: string;
  tenantId: string;
  password: string;
  confirmPassword: string;
  role: "EMPLOYEE" | "MANAGER"; // Now required from the Splash screen
}

// --- Controller Functions ---

/** * Step 1: Verify Hotel 
 */
export const verifyHotel = async (req: Request<{}, {}, VerifyHotelBody>, res: Response) => {
  try {
    const { hotelName } = req.body;
    const tenant = await prisma.tenant.findFirst({
      where: { companyName: { equals: hotelName, mode: "insensitive" } },
    });
    if (!tenant) return res.status(404).json({ error: "Hotel not found." });
    return res.status(200).json({ tenantId: tenant.id });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


/** * Step 3/4: Send Verification Code via Supabase OTP 
 */
export const sendVerificationCode = async (req: Request<{}, {}, OTPBody>, res: Response) => {
  try {
    const { target, type } = req.body;
    
    // We only support Email for now using Supabase OTP
    if (type === 'EMAIL') {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: target,
      });

      if (error) {
         console.error("Supabase OTP send error:", error);
         return res.status(500).json({ error: "Failed to send verification email." });
      }
      
      console.log(`[EMAIL] OTP sent to ${target}`);
      return res.status(200).json({ message: "Code sent" });
    } else {
       // Phone fallback (not currently supported properly without Vonage/Twilio setup in Supabase)
       const otp = Math.floor(100000 + Math.random() * 900000).toString();
       console.log(`[${type}] Code ${otp} mocked for ${target}`);
       return res.status(200).json({ message: "Code mocked locally", debugOtp: otp });
    }
  } catch (error) {
    console.error("sendVerificationCode error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** * Step 5: Verify OTP 
 */
export const verifyOtp = async (req: Request<{}, {}, VerifyOtpBody>, res: Response) => {
  try {
    const { email, token } = req.body;
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });

    if (error) {
       console.error("OTP verification failed:", error);
       return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

