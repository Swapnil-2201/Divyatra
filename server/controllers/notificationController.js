import { notificationService } from "../services/notificationService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || null;

    // Only return notifications when user is authenticated
    if (!userId) {
      return sendSuccess(res, [], "Sign in required to view personal notifications.", 200, {
        count: 0,
        unreadCount: 0,
      });
    }

    const notifications = await notificationService.getNotifications(userId);
    return sendSuccess(res, notifications, "Notifications retrieved.", 200, {
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id || null;

    if (!userId) {
      return sendError(res, "Authentication required.", 401);
    }

    const updated = await notificationService.markAsRead(id, userId);
    if (!updated) {
      return sendError(res, `Notification '${id}' not found.`, 404);
    }

    return sendSuccess(res, updated, "Notification marked as read.");
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || null;

    if (!userId) {
      return sendError(res, "Authentication required.", 401);
    }

    const result = await notificationService.markAllAsRead(userId);
    return sendSuccess(res, result, "All notifications marked as read.");
  } catch (error) {
    next(error);
  }
};
