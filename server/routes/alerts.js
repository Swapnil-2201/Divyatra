import express from "express";
import {
  getAlerts,
  acknowledgeAlert,
  investigateAlert,
  resolveAlert,
  addAlertNote,
  broadcastAdvisory,
} from "../controllers/alertController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/alerts (Public / Devotee transparency)
router.get("/", getAlerts);

// POST /api/alerts/:id/acknowledge (Protected: Authority & Admin)
router.post("/:id/acknowledge", protect, authorize("authority", "admin"), acknowledgeAlert);

// POST /api/alerts/:id/investigate (Protected: Authority & Admin)
router.post("/:id/investigate", protect, authorize("authority", "admin"), investigateAlert);

// POST /api/alerts/:id/resolve (Protected: Authority & Admin)
router.post("/:id/resolve", protect, authorize("authority", "admin"), resolveAlert);

// POST /api/alerts/:id/note (Protected: Authority & Admin)
router.post("/:id/note", protect, authorize("authority", "admin"), addAlertNote);

// POST /api/alerts/broadcast (Protected: Authority & Admin)
router.post("/broadcast", protect, authorize("authority", "admin"), broadcastAdvisory);

export default router;
