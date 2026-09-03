import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "divyatra_dev_jwt_secret_key_2026_super_secure";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate signed JWT token for authenticated user
 * @param {Object} user
 * @returns {string} signed JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      assignedTemple: user.assignedTemple || null,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify and decode JWT token
 * @param {string} token
 * @returns {Object} decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
