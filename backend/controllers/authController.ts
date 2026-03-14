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
