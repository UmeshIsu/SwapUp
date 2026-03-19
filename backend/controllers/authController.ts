import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
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
  department?: string;
}

// --- Helper Functions ---

/**
 * Maps a department display name (from frontend) to the Prisma Department enum value.
 * e.g. "Chinese Restaurant" -> "CHINESE", "Indian Restaurant" -> "INDIAN"
 */
function mapDepartment(dept?: string): "INDIAN" | "CHINESE" {
  if (!dept) return "INDIAN";
  const normalized = dept.toUpperCase().trim();
  if (normalized.includes("CHINESE")) return "CHINESE";
  if (normalized.includes("INDIAN")) return "INDIAN";
  return "INDIAN"; // fallback
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
         console.error("Supabase OTP send error:", error.message);
         return res.status(500).json({ error: "Failed to send verification email. Please check your Supabase limit." });
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
       console.error("OTP verification failed:", error.message);
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
  let supabaseUserId = '';

  try {
    console.log("[SIGNUP] Received request body:", { ...req.body, password: "[REDACTED]", confirmPassword: "[REDACTED]" });
    const { name, email, phone, workerId, tenantId, password, confirmPassword, role, department } = req.body;

    // 1. Validation
    if (password !== confirmPassword) {
      console.log("[SIGNUP] Validation Failed: Passwords do not match");
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("[SIGNUP] Validation Failed: Password regex failed");
      return res.status(400).json({ 
        error: "Password must be 8+ chars with a number, uppercase, and special character." 
      });
    }

    // 2. Hash Password (for local DB fallback)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User in Supabase Auth globally
    console.log("[SIGNUP] Attempting to create user in Supabase:", email);

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
    console.log("[SIGNUP] Attempting to create user in Prisma DB:", email);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        workerId: workerId || `MGR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        password: hashedPassword,
        tenantId,
        role: role.toUpperCase() as "EMPLOYEE" | "MANAGER", 
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        plan: "Basic",
        department: mapDepartment(department),
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId, department: user.department },
      process.env.JWT_SECRET || "swapup_jwt_secret_key",
      { expiresIn: "7d" }
    );

    console.log(`[SIGNUP] Success! User created: ${user.id}`);
    return res.status(201).json({
      message: `${role} account created successfully`,
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (error: any) {
    console.error("[SIGNUP] Unhandled Exception caught:", error);

    // Rollback: delete the Supabase user if Prisma creation failed
    if (supabaseUserId) {
      try {
        await supabase.auth.admin.deleteUser(supabaseUserId);
        console.log(`[SIGNUP] Rolled back Supabase user ${supabaseUserId}`);
      } catch (rollbackErr) {
        console.error("[SIGNUP] Failed to rollback Supabase user:", rollbackErr);
      }
    }

    if (error.code === 'P2002') {
        console.error("[SIGNUP] Prisma P2002 Error (Unique constraint failed):", error.meta);
        return res.status(400).json({ error: "Credentials already exist." });
    }
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
};


/**
 * Role-Based Login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body; // Frontend sends selected role from splash
    
    // Explicit null/undefined check for role before proceeding
    if (!role) {
      return res.status(400).json({ error: "Role is required to log in." });
    }

    // 1. Check against Supabase first
    console.log(`[LOGIN] Attempting login for ${email} with role ${role}`);
    const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if(supaError || !supaData.user) {
        console.error(`[LOGIN] Supabase auth failed for ${email}:`, supaError?.message);
        return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`[LOGIN] Supabase auth success for ${email}`);

    // 2. Locate user in local Prisma DB
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`[LOGIN] User ${email} not found in Prisma DB`);
      return res.status(401).json({ error: "User not found in local database." });
    }

    // 3. Ensure the user logging in matches the role selected on the splash screen
    if (user.role !== role.toUpperCase()) {
      console.warn(`[LOGIN] Role mismatch for ${email}. Selected: ${role}, Database: ${user.role}`);
      return res.status(403).json({ error: `This account is not registered as a ${role}.` });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId, department: user.department },
      process.env.JWT_SECRET || "swapup_jwt_secret_key",
      { expiresIn: "7d" }
    );

    console.log(`[LOGIN] Success for ${email} as ${user.role}`);
    return res.status(200).json({ 
      token, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error(`[LOGIN] Catch-all error for ${req.body.email}:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all employees for the same hotel (tenant)
 */
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { tenantId, role, department } = req.user as any;
    
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID not found in token." });
    }

    const whereClause: any = {
      tenantId,
      role: "EMPLOYEE",
    };

    // If requester is a Manager, filter by their department
    if (role === "MANAGER" && department) {
      whereClause.department = department;
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        avatarUrl: true,
      },
    });

    return res.status(200).json(employees);
  } catch (error) {
    console.error("getAllEmployees error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};