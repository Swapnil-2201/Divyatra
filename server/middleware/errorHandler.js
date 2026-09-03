import { sendError } from "../utils/responseHelper.js";

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`🚨 [API Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, `Validation Error: ${messages.join(", ")}`, 400, err);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return sendError(res, `Duplicate key error: Resource already exists.`, 409, err);
  }

  // CastError (invalid ObjectId or format)
  if (err.name === "CastError") {
    return sendError(res, `Resource not found or invalid format: ${err.value}`, 404, err);
  }

  return sendError(
    res,
    err.message || "Internal Server Error",
    err.statusCode || 500,
    err
  );
};
