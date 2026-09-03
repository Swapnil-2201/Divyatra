import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/responseHelper.js";
import { authService } from "../services/authService.js";

/**
 * Authentication Middleware
 * Protects routes requiring valid JWT token
 */
export const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendError(
      res,
      "Access denied. No authentication token provided. Please log in.",
      401
    );
  }

  try {
    const decoded = verifyToken(token);
    const user = await authService.getCurrentUser(decoded.id || decoded.email);

    if (!user) {
      return sendError(
        res,
        "Authentication failed. User associated with this token no longer exists.",
        401
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(
      res,
      "Invalid or expired authentication token. Please log in again.",
      401,
      error
    );
  }
};

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid token is provided, otherwise continues without blocking
 */
export const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await authService.getCurrentUser(decoded.id || decoded.email);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  next();
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles - 'pilgrim' | 'authority' | 'admin'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized access. Authentication required.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(", ")}`,
        403
      );
    }

    next();
  };
};
