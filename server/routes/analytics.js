import express from "express";
import { analyticsData } from "../data/analytics.js";
import { crowdService } from "../services/crowdService.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/analytics - Protected for Authority & Admin Command Center
router.get("/", protect, authorize("authority", "admin"), async (req, res) => {
  try {
    const liveCrowd = await crowdService.getLiveCrowd();
    const response = {
      ...analyticsData,
      liveSummary: {
        totalActivePilgrims: liveCrowd.totalActivePilgrims,
        averageWaitTimeMinutes: liveCrowd.averageWaitTimeMinutes,
        activeCriticalZones: liveCrowd.activeCriticalZones,
        systemAlertLevel: liveCrowd.systemAlertLevel,
      },
    };
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
