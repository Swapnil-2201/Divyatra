import { darshanSlotService } from "../services/darshanSlotService.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getDarshanSlots = async (req, res, next) => {
  try {
    const { templeId } = req.params;
    const slots = await darshanSlotService.getSlotsByTempleId(templeId);
    return sendSuccess(res, slots);
  } catch (error) {
    next(error);
  }
};
