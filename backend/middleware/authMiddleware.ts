import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define an interface for the JWT payload
interface TokenPayload {
  id: string;
  role: string;
  email?: string;
}

// Extend the Express Request type to include the user object
export interface AuthRequest extends Request {
  user: TokenPayload;
}

/**
 * Middleware to protect private routes
 * Verifies the JWT sent in the "Authorization" header
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check if the token exists in the Authorization header
  // Standard format: "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || "your-secure-secret"
      ) as TokenPayload;

      // 3. Attach user data to the request object
      req.user = decoded;

      // Move to the next middleware or controller
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  // 4. If no token is found
  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

/**
 * Optional: Middleware to restrict access to specific roles (e.g., MANAGERS only)
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Role (${req.user?.role}) is not authorized to access this resource` 
      });
    }
    next();
  };
};
