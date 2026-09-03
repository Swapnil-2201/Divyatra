import { templeService } from "../services/templeService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getTemples = async (req, res, next) => {
  try {
    const temples = await templeService.getAllTemples();
    return sendSuccess(res, temples);
  } catch (error) {
    next(error);
  }
};

export const getTempleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const temple = await templeService.getTempleById(id);
    if (!temple) {
      return sendError(res, `Temple with ID '${id}' not found`, 404);
    }
    return sendSuccess(res, temple);
  } catch (error) {
    next(error);
  }
};
