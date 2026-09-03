import { authService } from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, assignedTemple } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Please provide full name, email, and password.", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters long.", 400);
    }

    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      phone,
      role,
      assignedTemple,
    });

    return sendSuccess(
      res,
      { user, token },
      "Account registered and authenticated successfully.",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Please provide both email and password.", 400);
    }

    const { user, token } = await authService.loginUser(email, password);

    return sendSuccess(
      res,
      { user, token },
      "Logged in successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, req.user, "User profile retrieved.");
  } catch (error) {
    next(error);
  }
};
