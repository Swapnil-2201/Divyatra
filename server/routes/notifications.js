import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications
router.get("/", optionalAuth, getNotifications);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", optionalAuth, markNotificationRead);

// PATCH /api/notifications/read-all
router.patch("/read-all", optionalAuth, markAllNotificationsRead);

export default router;
