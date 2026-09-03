import { Temple } from "../models/Temple.js";
import { isDatabaseConnected } from "../config/db.js";
import { temples as mockTemples } from "../data/temples.js";

export const templeService = {
  async getAllTemples() {
    if (isDatabaseConnected()) {
      const temples = await Temple.find().lean();
      if (temples && temples.length > 0) return temples;
    }
    return mockTemples;
  },

  async getTempleById(id) {
    if (!id) return mockTemples[0];
    const cleanId = id.toLowerCase();
    if (isDatabaseConnected()) {
      const temple = await Temple.findOne({ id: cleanId }).lean();
      if (temple) return temple;
    }
    return mockTemples.find((t) => t.id.toLowerCase() === cleanId) || mockTemples[0];
  },
};
