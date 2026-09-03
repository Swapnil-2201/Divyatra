import { DarshanSlot } from "../models/DarshanSlot.js";
import { isDatabaseConnected } from "../config/db.js";
import { templeService } from "./templeService.js";

export const darshanSlotService = {
  async getSlotsByTempleId(templeId) {
    if (!templeId) return [];
    const cleanId = templeId.toLowerCase();

    if (isDatabaseConnected()) {
      const slots = await DarshanSlot.find({ templeId: cleanId }).lean();
      if (slots && slots.length > 0) return slots;
    }

    const temple = await templeService.getTempleById(cleanId);
    return temple?.darshanSlots || [];
  },
};
