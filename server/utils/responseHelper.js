/**
 * Standardized Success Response
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
export const sendSuccess = (res, data, message = null, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (Array.isArray(data)) {
    response.count = data.length;
  }
  response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Standardized Error Response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {*} [error=null]
 */
export const sendError = (res, message = "Internal Server Error", statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV !== "production") {
    response.error = typeof error === "object" ? error.message || error : error;
  }
  return res.status(statusCode).json(response);
};
