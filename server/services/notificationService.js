import { Notification } from "../models/Notification.js";
import { isDatabaseConnected } from "../config/db.js";

/**
 * 📲 Firebase Cloud Messaging (FCM) & Push Notification Provider Abstraction
 * Supports Mock provider (zero Firebase credentials required for local dev)
 * Pluggable for real Google Firebase Admin SDK when credentials are configured.
 */
export class PushNotificationProvider {
  async sendPush(payload) {
    throw new Error("sendPush() must be implemented by concrete provider");
  }
  async sendTopic(topic, payload) {
    throw new Error("sendTopic() must be implemented by concrete provider");
  }
}

export class MockPushNotificationProvider extends PushNotificationProvider {
  async sendPush({ token, title, body, data }) {
    console.log(`📡 [Mock FCM Push] To Token: "${token?.substring(0, 10)}..." | Title: "${title}" | Body: "${body}"`);
    return { success: true, messageId: `mock_fcm_msg_${Date.now()}` };
  }

  async sendTopic(topic, { title, body, data }) {
    console.log(`📢 [Mock FCM Topic Broadcast] Topic: "${topic}" | Title: "${title}" | Body: "${body}"`);
    return { success: true, messageId: `mock_fcm_topic_${Date.now()}` };
  }
}

export class FirebaseCloudMessagingProvider extends PushNotificationProvider {
  constructor(firebaseAdmin) {
    super();
    this.admin = firebaseAdmin;
  }

  async sendPush({ token, title, body, data }) {
    if (!this.admin) return { success: false, reason: "Firebase Admin not initialized" };
    return this.admin.messaging().send({
      token,
      notification: { title, body },
      data: data || {},
    });
  }

  async sendTopic(topic, { title, body, data }) {
    if (!this.admin) return { success: false, reason: "Firebase Admin not initialized" };
    return this.admin.messaging().send({
      topic,
      notification: { title, body },
      data: data || {},
    });
  }
}

// Active provider instance (defaults to Mock)
const activePushProvider = process.env.FIREBASE_PROJECT_ID
  ? new FirebaseCloudMessagingProvider(null)
  : new MockPushNotificationProvider();

// Seeded in-memory notification collection
let inMemoryNotifications = [
  {
    id: "notif-001",
    userId: null, // Broadcast to all
    title: "Darshan Slot Reminder",
    message: "Prabhat Aarti commences at 06:30 AM at Shree Somnath Jyotirlinga. Please arrive 20 mins prior with your QR E-Pass.",
    type: "darshan",
    priority: "normal",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    actionUrl: "/live-darshan",
    templeId: "somnath",
  },
  {
    id: "notif-002",
    userId: null,
    title: "Low Congestion Window at Ambaji",
    message: "Ambaji Shaktipeeth current wait time is under 12 minutes. Ideal time for sanctum darshan.",
    type: "crowd",
    priority: "normal",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actionUrl: "/crowd",
    templeId: "ambaji",
  },
  {
    id: "notif-003",
    userId: null,
    title: "Corridor Flow Advisory",
    message: "Dwarka Moksha Dwaar general queue rerouted via Gomti Ghat Promenade to prevent sanctum bottleneck.",
    type: "system",
    priority: "high",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    actionUrl: "/alerts",
    templeId: "dwarka",
  },
  {
    id: "notif-004",
    userId: null,
    title: "Emergency Medical Kiosk Operational",
    message: "24x7 Emergency Paramedic Mobile Unit 04 deployed at Pavagadh Machi base station for pilgrims.",
    type: "emergency",
    priority: "critical",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    actionUrl: "/emergency",
    templeId: "pavagadh",
  },
];

export const notificationService = {
  /**
   * Get all notifications for user + global broadcasts
   */
  async getNotifications(userId = null) {
    if (isDatabaseConnected()) {
      const query = userId
        ? { $or: [{ userId }, { userId: null }, { userId: "" }] }
        : { userId: null };
      const dbNotifs = await Notification.find(query).sort({ createdAt: -1 }).lean();
      if (dbNotifs && dbNotifs.length > 0) return dbNotifs;
    }

    if (userId) {
      return inMemoryNotifications.filter(
        (n) => !n.userId || n.userId === userId || n.userId === String(userId)
      );
    }
    return inMemoryNotifications;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id, userId = null) {
    if (isDatabaseConnected()) {
      const updated = await Notification.findOneAndUpdate(
        { id },
        { $set: { read: true } },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    inMemoryNotifications = inMemoryNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return inMemoryNotifications.find((n) => n.id === id);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId = null) {
    if (isDatabaseConnected()) {
      const query = userId
        ? { $or: [{ userId }, { userId: null }] }
        : { userId: null };
      await Notification.updateMany(query, { $set: { read: true } });
      return { success: true };
    }

    inMemoryNotifications = inMemoryNotifications.map((n) => ({
      ...n,
      read: true,
    }));
    return { success: true };
  },

  /**
   * Create and push an in-app + FCM push notification
   */
  async createNotification(data) {
    const notifId = data.id || `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNotif = {
      id: notifId,
      userId: data.userId || null,
      bookingId: data.bookingId || null,
      title: data.title || "DivYatra Update",
      message: data.message || "",
      type: data.type || "system", // 'booking', 'darshan', 'crowd', 'emergency', 'system'
      priority: data.priority || "normal", // 'low', 'normal', 'high', 'critical'
      read: false,
      actionUrl: data.actionUrl || null,
      metadata: data.metadata || {},
      templeId: data.templeId || "all",
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        await Notification.create(newNotif);
      } catch (err) {
        // Fallback
      }
    }

    inMemoryNotifications.unshift(newNotif);

    // Push via FCM abstraction
    if (data.fcmToken) {
      await activePushProvider.sendPush({
        token: data.fcmToken,
        title: newNotif.title,
        body: newNotif.message,
        data: { notifId, type: newNotif.type },
      });
    } else {
      await activePushProvider.sendTopic("pilgrim_all", {
        title: newNotif.title,
        body: newNotif.message,
        data: { notifId, type: newNotif.type },
      });
    }

    return newNotif;
  },

  /**
   * Access underlying push notification provider
   */
  getPushProvider() {
    return activePushProvider;
  },
};
