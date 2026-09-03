import { prasadamService } from "../services/prasadamService.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getPrasadam = async (req, res, next) => {
  try {
    const { templeId, category } = req.query;
    const items = await prasadamService.getPrasadam(templeId, category);
    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const createPrasadOrder = async (req, res, next) => {
  try {
    const order = await prasadamService.createOrder(req.body);
    return sendSuccess(res, order, "Prasadam order created successfully", 201);
  } catch (error) {
    next(error);
  }
};
