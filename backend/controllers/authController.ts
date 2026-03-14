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

/** * Step 6: Verify Identity 
 */
export const verifyWorkerId = async (req: Request<{}, {}, VerifyWorkerBody>, res: Response) => {
  try {
    const { workerId, tenantId } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { workerId } });
    if (existingUser) return res.status(400).json({ error: "Worker ID already registered." });
    return res.status(200).json({ message: "Identity verified." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/** * Step 7: Final Account Creation (Role-Based)
 */
export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
  try {
    const { name, email, phone, workerId, tenantId, password, confirmPassword, role } = req.body;

    // 1. Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must be 8+ chars with a number, uppercase, and special character." 
      });
    }

    // 2. Hash Password (for local DB fallback)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User in Supabase Auth globally
    // We use the admin API to skip email confirmation for immediate login if needed, or regular signUp depending on settings
    let supabaseUserId = '';

    const { data: supaData, error: supaError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: role.toUpperCase(),
        worker_id: workerId,
        phone,
        tenant_id: tenantId,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
    });

    if (supaError) {
      if (supaError.message.includes('already exists') || supaError.message.includes('already been registered')) {
        // User was likely created by the OTP step. Fetch and update them instead.
        const { data: existingList } = await supabase.auth.admin.listUsers();
        const existingUser = existingList.users.find((u: any) => u.email === email);
        
        if (existingUser) {
           const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
              password,
              user_metadata: {
                name,
                role: role.toUpperCase(),
                worker_id: workerId,
                phone,
                tenant_id: tenantId,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
              }
           });
           
           if (updateError) {
              return res.status(500).json({ error: `Supabase Update Error: ${updateError.message}` });
           }
           supabaseUserId = updateData.user.id;
        } else {
           return res.status(400).json({ error: "Credentials already exist in Supabase but user not found." });
        }
      } else {
        console.error("Supabase user creation failed:", supaError.message);
        return res.status(500).json({ error: `Supabase Error: ${supaError.message}` });
      }
    } else {
       if (supaData && supaData.user) {
          supabaseUserId = supaData.user.id;
       }
    }

    // 4. Create User in Local Prisma DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        workerId,
        password: hashedPassword,
        tenantId,
        role: role.toUpperCase() as "EMPLOYEE" | "MANAGER", 
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        plan: "Basic",
        department: "INDIAN", // Default fallback if not provided on signup
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: `${role} account created successfully`,
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: "Credentials already exist." });
    return res.status(500).json({ error: "Internal server error." });
  }
};
