import { Alert } from "../models/Alert.js";
import { isDatabaseConnected } from "../config/db.js";
import { alerts as mockAlerts } from "../data/alerts.js";

let inMemoryAlerts = mockAlerts.map((a) => ({
  ...a,
  status: a.status || (a.resolved ? "RESOLVED" : a.acknowledged ? "ACKNOWLEDGED" : "ACTIVE"),
  responseNotes: a.responseNotes || [],
}));

export const alertService = {
  /**
   * Get all active & resolved alerts
   */
  async getAlerts() {
    if (isDatabaseConnected()) {
      const dbAlerts = await Alert.find().sort({ createdAt: -1 }).lean();
      if (dbAlerts && dbAlerts.length > 0) return dbAlerts;
    }
    return inMemoryAlerts;
  },

  /**
   * Acknowledge alert by officer
   */
  async acknowledgeAlert(id, officerName = "Officer On Duty") {
    if (isDatabaseConnected()) {
      const updated = await Alert.findOneAndUpdate(
        { id },
        {
          $set: {
            acknowledged: true,
            acknowledgedBy: officerName,
            status: "ACKNOWLEDGED",
          },
          $push: {
            responseNotes: {
              author: officerName,
              note: `Alert acknowledged on duty terminal.`,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    inMemoryAlerts = inMemoryAlerts.map((a) => {
      if (a.id === id) {
        const notes = a.responseNotes || [];
        notes.push({
          author: officerName,
          note: "Alert acknowledged on duty terminal.",
          timestamp: new Date().toISOString(),
        });
        return {
          ...a,
          acknowledged: true,
          acknowledgedBy: officerName,
          status: "ACKNOWLEDGED",
          responseNotes: notes,
        };
      }
      return a;
    });
    return inMemoryAlerts.find((a) => a.id === id);
  },

  /**
   * Mark alert as Investigating / Marshals dispatched
   */
  async investigateAlert(id, officerName = "Officer On Duty", note = "Field marshals dispatched to chokepoint.") {
    if (isDatabaseConnected()) {
      const updated = await Alert.findOneAndUpdate(
        { id },
        {
          $set: { status: "INVESTIGATING" },
          $push: {
            responseNotes: {
              author: officerName,
              note: note || "Field marshals mobilized for corridor investigation.",
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    inMemoryAlerts = inMemoryAlerts.map((a) => {
      if (a.id === id) {
        const notes = a.responseNotes || [];
        notes.push({
          author: officerName,
          note: note || "Field marshals mobilized for corridor investigation.",
          timestamp: new Date().toISOString(),
        });
        return { ...a, status: "INVESTIGATING", responseNotes: notes };
      }
      return a;
    });
    return inMemoryAlerts.find((a) => a.id === id);
  },

  /**
   * Resolve incident alert
   */
  async resolveAlert(id, officerName = "Duty Commander") {
    const resolvedAt = new Date();
    if (isDatabaseConnected()) {
      const updated = await Alert.findOneAndUpdate(
        { id },
        {
          $set: {
            resolved: true,
            status: "RESOLVED",
            resolvedAt,
          },
          $push: {
            responseNotes: {
              author: officerName,
              note: "Corridor restored to normal throughput. Incident marked resolved.",
              timestamp: resolvedAt,
            },
          },
        },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    inMemoryAlerts = inMemoryAlerts.map((a) => {
      if (a.id === id) {
        const notes = a.responseNotes || [];
        notes.push({
          author: officerName,
          note: "Corridor restored to normal throughput. Incident marked resolved.",
          timestamp: resolvedAt.toISOString(),
        });
        return {
          ...a,
          resolved: true,
          status: "RESOLVED",
          resolvedAt: resolvedAt.toISOString(),
          responseNotes: notes,
        };
      }
      return a;
    });
    return inMemoryAlerts.find((a) => a.id === id);
  },

  /**
   * Add response note / mitigation log
   */
  async addResponseNote(id, author = "Authority Officer", note) {
    if (isDatabaseConnected()) {
      const updated = await Alert.findOneAndUpdate(
        { id },
        {
          $push: {
            responseNotes: {
              author,
              note,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    inMemoryAlerts = inMemoryAlerts.map((a) => {
      if (a.id === id) {
        const notes = a.responseNotes || [];
        notes.push({
          author,
          note,
          timestamp: new Date().toISOString(),
        });
        return { ...a, responseNotes: notes };
      }
      return a;
    });
    return inMemoryAlerts.find((a) => a.id === id);
  },

  /**
   * Broadcast public advisory across temple corridor screens and pilgrim apps
   */
  async broadcastAdvisory(advisory) {
    const alertId = `alt-broad-${Date.now()}`;
    const newAlert = {
      id: alertId,
      templeId: advisory.templeId || "all",
      templeName: advisory.templeId ? advisory.templeId.toUpperCase() : "All Corridors",
      zone: "Public PA & App Broadcast",
      type: "SYSTEM",
      severity: advisory.severity || "INFO",
      title: advisory.title || "Public Devotee Advisory",
      message: advisory.message || advisory.body || advisory.title,
      description: advisory.message || advisory.body || advisory.title,
      actionRequired: "Devotees follow queue guidelines.",
      recommendedAction: "Devotees follow queue guidelines.",
      status: "ACTIVE",
      acknowledged: true,
      resolved: false,
      responseNotes: [
        {
          author: advisory.officerName || "Central Command",
          note: "Advisory broadcast initiated across premise display network.",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        await Alert.create(newAlert);
      } catch (err) {
        // Fallback
      }
    }

    inMemoryAlerts.unshift(newAlert);
    return newAlert;
  },
};
