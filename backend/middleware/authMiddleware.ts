import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ─── JWT Payload Types ────────────────────────────────────────────────────────

export interface AuthPayload {
    id: string;
    userId: string; // Added for compatibility with feature branch
    employeeId?: string; // Optional if not always present in token
    name?: string;
    department?: string;
    role: string;
    email?: string;
    tenantId: string;
}

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

// Extended request type for routes that require auth
export interface AuthRequest extends Request {
    user: AuthPayload;
}

// Auth Middleware (used by chat routes) 

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization token required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'swapup_jwt_secret_key'
        ) as AuthPayload;
        
        // Map fields so both DEV branch (`id`) and FEATURE branch (`userId`) controllers work.
        decoded.id = decoded.id || (decoded as any).userId;
        decoded.userId = decoded.id;
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Protect Middleware (used by auth routes)

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'swapup_jwt_secret_key'
            ) as AuthPayload;
            
            // Map fields so both DEV branch (`id`) and FEATURE branch (`userId`) controllers work.
            decoded.id = decoded.id || (decoded as any).userId;
            decoded.userId = decoded.id;

            req.user = decoded;
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }
};

// Role-based Authorization

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Role (${req.user?.role}) is not authorized to access this resource`
            });
        }
        next();
    };
};

