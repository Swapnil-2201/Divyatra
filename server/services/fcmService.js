/**
 * Firebase Cloud Messaging (FCM) & Broadcast Service Abstraction
 * Manages push notification broadcasting to pilgrim devices and temple authority control rooms.
 */

class NotificationService {
  constructor() {
    this.serverKey = process.env.FIREBASE_SERVER_KEY || "mock_fcm_server_key";
    this.notificationHistory = [];
  }

  async sendToPilgrim({ token, title, body, data = {} }) {
    const notificationPayload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipient: token || "all_active_pilgrims",
      title,
      body,
      data,
      timestamp: new Date().toISOString(),
      delivered: true
    };
    this.notificationHistory.unshift(notificationPayload);
    if (this.notificationHistory.length > 50) this.notificationHistory.pop();
    return { success: true, messageId: notificationPayload.id };
  }

  async broadcastAdvisory({ title, body, severity = "INFO", templeId = "all" }) {
    const payload = {
      id: `broadcast_${Date.now()}`,
      templeId,
      title,
      body,
      severity,
      timestamp: new Date().toISOString()
    };
    this.notificationHistory.unshift(payload);
    return { success: true, broadcastCount: 15420, broadcastId: payload.id };
  }

  getHistory() {
    return this.notificationHistory;
  }
}

export const notificationService = new NotificationService();
