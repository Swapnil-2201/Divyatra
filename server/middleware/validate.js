import { sendError } from "../utils/responseHelper.js";

/**
 * Validate required fields in request body
 * @param {string[]} fields
 */
export const validateBody = (fields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return sendError(
        res,
        `Missing required fields: ${missing.join(", ")}`,
        400
      );
    }
    next();
  };
};
