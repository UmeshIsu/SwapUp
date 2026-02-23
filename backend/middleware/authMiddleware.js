const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prismaClient");

// Middleware to verify JWT token and attach user to req.user
const isLoggedIn = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided. Authorization header must be in format: Bearer <token>",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // Fetch user from database to ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Middleware to check if user is a MANAGER
const isManager = (req, res, next) => {
  // This middleware should be used after isLoggedIn
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "MANAGER") {
    return res.status(403).json({
      error: "Access denied. Manager role required",
    });
  }

  next();
};

// Middleware to check if user is an EMPLOYEE
const isEmployee = (req, res, next) => {
  // This middleware should be used after isLoggedIn
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({
      error: "Access denied. Employee role required",
    });
  }

  next();
};

// Flexible role-based access control middleware
// Usage: requireRole(["MANAGER"]) or requireRole(["EMPLOYEE", "MANAGER"])
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

// Helper function to check if user has required role
const hasRole = (user, requiredRole) => {
  return user && user.role === requiredRole;
};

// Helper function to check if user has any of the required roles
const hasAnyRole = (user, requiredRoles) => {
  return user && requiredRoles.includes(user.role);
};

module.exports = {
  isLoggedIn,
  isManager,
  isEmployee,
  requireRole,
  hasRole,
  hasAnyRole,
};
