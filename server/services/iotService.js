import { IoTDevice } from "../models/IoTDevice.js";
import { isDatabaseConnected } from "../config/db.js";
import { crowdService } from "./crowdService.js";

// Global Socket.IO reference
let ioInstance = null;

export const setIoInstance = (io) => {
  ioInstance = io;
};

export const getIoInstance = () => ioInstance;

const formatTimeString = (date = new Date()) => {
  return date.toTimeString().split(" ")[0]; // "HH:MM:SS"
};

// Default Simulated Band DV-BAND-0001
const createDefaultBand = () => ({
  bandId: "DV-BAND-0001",
  userId: "usr-demo-pilgrim",
  bookingId: null,
  status: "CONNECTED",
  battery: 87,
  signalStrength: "Strong",
  location: {
    templeId: "somnath",
    templeName: "Shree Somnath Jyotirlinga",
    zone: "Sanctum Courtyard",
    gate: "Gate 1 Turnstile",
    coordinates: { lat: 20.888, lng: 70.401 },
  },
  heartRate: 76,
  stressLevel: "Normal",
  temperature: 36.8,
  lastSeen: new Date().toISOString(),
  currentPass: null,
  emergencyStatus: {
    active: false,
    type: "NONE",
    timestamp: null,
    details: "",
    incidentId: "",
  },
  notifications: [
    {
      id: "notif-init-1",
      type: "INFO",
      title: "DivYatra Band Connected",
      message: "Connected to Temple Mesh Node. Telemetry active.",
      timestamp: new Date().toISOString(),
      read: true,
    },
  ],
  events: [
    {
      id: `ev-init-${Date.now()}-1`,
      time: formatTimeString(new Date(Date.now() - 60000)),
      event: "Band connected",
      type: "CONNECT",
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: `ev-init-${Date.now()}-2`,
      time: formatTimeString(),
      event: "Telemetry calibrated",
      type: "SYSTEM",
      timestamp: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// In-Memory Fallback Device Store
const inMemoryBands = new Map();
inMemoryBands.set("DV-BAND-0001", createDefaultBand());

export const iotService = {
  /**
   * Retrieve band state by bandId
   */
  async getBandState(bandId = "DV-BAND-0001") {
    let band = null;

    if (isDatabaseConnected()) {
      try {
        band = await IoTDevice.findOne({ bandId }).lean();
        if (!band && bandId === "DV-BAND-0001") {
          const defaultBand = createDefaultBand();
          const created = await IoTDevice.create(defaultBand);
          band = created.toObject();
        }
      } catch (err) {
        console.warn("⚠️ [IoT] Mongoose read fallback to memory:", err.message);
      }
    }

    if (!band) {
      if (!inMemoryBands.has(bandId)) {
        if (bandId === "DV-BAND-0001") {
          inMemoryBands.set("DV-BAND-0001", createDefaultBand());
        } else {
          return null;
        }
      }
      band = inMemoryBands.get(bandId);
    }

    // Dynamic Crowd API integration: fetch live temple crowd status
    const templeId = band.location?.templeId || band.currentPass?.templeId || "somnath";
    let crowdData = null;
    try {
      crowdData = await crowdService.getCrowdByTempleId(templeId);
    } catch (e) {
      crowdData = null;
    }

    const crowdExposurePct = crowdData?.crowdPercentage || 58;
    const waitMins = crowdData?.estimatedWaitMinutes || 34;
    let crowdStatusLabel = "Smooth";
    if (crowdExposurePct >= 75) {
      crowdStatusLabel = "Crowded";
    } else if (crowdExposurePct >= 45) {
      crowdStatusLabel = "Moderate";
    }

    return {
      bandId: band.bandId,
      status: band.status,
      connectionStatus: band.status,
      battery: band.battery,
      signalStrength: band.signalStrength,
      telemetry: {
        heartRate: band.heartRate || 76,
        stressLevel: band.stressLevel || "Normal",
        temperature: band.temperature || 36.8,
        label: "SIMULATED",
      },
      location: {
        templeId: band.location?.templeId || "somnath",
        templeName: band.location?.templeName || "Somnath Temple",
        zone: band.location?.zone || "Sanctum Courtyard",
        gate: band.location?.gate || "Gate 1",
        label: "GPS SIMULATION",
      },
      currentBooking: band.currentPass || null,
      currentPass: band.currentPass || null,
      pilgrimInformation: band.currentPass?.leadPilgrim || "Ramesh Patel",
      temple: band.currentPass?.templeName || band.location?.templeName || "Shree Somnath Jyotirlinga",
      slot: band.currentPass?.slot || null,
      crowdStatus: {
        exposure: `${crowdExposurePct}%`,
        crowdExposure: crowdStatusLabel,
        wait: `${waitMins} minutes`,
        waitMinutes: waitMins,
        status: crowdStatusLabel,
        zone: band.location?.zone || "Gate 1 Turnstile",
      },
      emergencyStatus: band.emergencyStatus || { active: false },
      latestNotifications: band.notifications || [],
      events: band.events || [],
      lastSeen: new Date().toISOString(),
    };
  },

  /**
   * Register or update a smart band
   */
  async registerBand(data) {
    const bandId = data.bandId || "DV-BAND-0001";
    const bandDoc = {
      ...createDefaultBand(),
      ...data,
      bandId,
      updatedAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        const saved = await IoTDevice.findOneAndUpdate(
          { bandId },
          { $set: bandDoc },
          { upsert: true, new: true }
        ).lean();
        return saved;
      } catch (err) {
        console.warn("⚠️ [IoT] Mongoose register fallback to memory:", err.message);
      }
    }

    inMemoryBands.set(bandId, bandDoc);
    return bandDoc;
  },

  /**
   * Associate Darshan booking pass to a band and emit PASS_ISSUED in real-time
   */
  async syncPassToBand(bandId = "DV-BAND-0001", bookingData) {
    const timeNow = formatTimeString();
    const templeName = bookingData.templeName || "Shree Somnath Jyotirlinga";
    const slot = bookingData.timeSlot || bookingData.slot || "10:00 AM";
    const date = bookingData.date || new Date().toISOString().split("T")[0];
    const pilgrims = Number(bookingData.pilgrimCount || bookingData.pilgrims || 1);
    const leadPilgrim = bookingData.leadPilgrim?.name || (typeof bookingData.leadPilgrim === "string" ? bookingData.leadPilgrim : "Ramesh Patel");

    const passPayload = {
      bookingId: bookingData.bookingId,
      templeId: bookingData.templeId || "somnath",
      templeName,
      date,
      slot,
      pilgrims,
      leadPilgrim,
      status: "ISSUED",
      qrPayload: bookingData.qrCodeData || JSON.stringify({
        bookingId: bookingData.bookingId,
        templeId: bookingData.templeId || "somnath",
        templeName,
        date,
        slot,
        pilgrims,
      }),
      issuedAt: new Date().toISOString(),
      acknowledgedAt: null,
    };

    const newNotification = {
      id: `notif-${Date.now()}`,
      type: "PASS_ISSUED",
      title: `🔔 New Darshan Pass`,
      message: `${templeName.split(" ")[1] || templeName} • ${slot.split("(")[0].trim()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const newEvents = [
      {
        id: `ev-${Date.now()}-1`,
        time: timeNow,
        event: "Pass received",
        type: "PASS",
        timestamp: new Date().toISOString(),
      },
      {
        id: `ev-${Date.now()}-2`,
        time: timeNow,
        event: "QR generated",
        type: "QR",
        timestamp: new Date().toISOString(),
      },
    ];

    if (isDatabaseConnected()) {
      try {
        await IoTDevice.findOneAndUpdate(
          { bandId },
          {
            $set: {
              bookingId: bookingData.bookingId,
              currentPass: passPayload,
              status: "ACTIVE",
              updatedAt: new Date().toISOString(),
            },
            $push: {
              notifications: { $each: [newNotification], $slice: -15 },
              events: { $each: newEvents, $slice: -30 },
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.warn("⚠️ [IoT] MongoDB sync pass fallback to memory:", err.message);
      }
    }

    const band = inMemoryBands.get(bandId) || createDefaultBand();
    band.bookingId = bookingData.bookingId;
    band.currentPass = passPayload;
    band.status = "ACTIVE";
    band.notifications = [newNotification, ...(band.notifications || [])].slice(0, 15);
    band.events = [...newEvents, ...(band.events || [])].slice(0, 30);
    band.updatedAt = new Date().toISOString();
    inMemoryBands.set(bandId, band);

    // Real-Time Socket.IO event emission
    const socketEventData = {
      event: "PASS_ISSUED",
      bandId,
      bookingId: bookingData.bookingId,
      templeId: bookingData.templeId || "somnath",
      templeName,
      date,
      slot,
      pilgrims,
      leadPilgrim,
      qrPayload: passPayload.qrPayload,
      timestamp: new Date().toISOString(),
    };

    const io = getIoInstance();
    if (io) {
      // Emit to specific band room and broadcast to all connected simulator clients
      io.to(`band_${bandId}`).emit("PASS_ISSUED", socketEventData);
      io.emit("PASS_ISSUED", socketEventData);
      console.log(`📡 [Socket.IO] Emitted PASS_ISSUED to band ${bandId} (${bookingData.bookingId})`);
    }

    return {
      success: true,
      bandId,
      pass: passPayload,
      event: socketEventData,
    };
  },

  /**
   * Pilgrim acknowledges pass on smart band
   */
  async acknowledgePass(bandId = "DV-BAND-0001") {
    const timeNow = formatTimeString();
    const ackEvent = {
      id: `ev-ack-${Date.now()}`,
      time: timeNow,
      event: "Pass acknowledged",
      type: "ACK",
      timestamp: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        await IoTDevice.findOneAndUpdate(
          { bandId },
          {
            $set: {
              "currentPass.status": "ACTIVE",
              "currentPass.acknowledgedAt": new Date().toISOString(),
              status: "ACTIVE",
            },
            $push: { events: { $each: [ackEvent], $slice: -30 } },
          }
        );
      } catch (err) {
        console.warn("⚠️ [IoT] Acknowledge pass fallback to memory:", err.message);
      }
    }

    const band = inMemoryBands.get(bandId) || createDefaultBand();
    if (band.currentPass) {
      band.currentPass.status = "ACTIVE";
      band.currentPass.acknowledgedAt = new Date().toISOString();
    }
    band.status = "ACTIVE";
    band.events = [ackEvent, ...(band.events || [])].slice(0, 30);
    inMemoryBands.set(bandId, band);

    const io = getIoInstance();
    if (io) {
      const payload = {
        event: "PASS_ACKNOWLEDGED",
        bandId,
        status: "PASS ACTIVE",
        timestamp: new Date().toISOString(),
      };
      io.to(`band_${bandId}`).emit("PASS_ACKNOWLEDGED", payload);
      io.emit("PASS_ACKNOWLEDGED", payload);
    }

    return {
      success: true,
      message: "Pass acknowledged successfully. Status: PASS ACTIVE",
      status: "PASS ACTIVE",
    };
  },

  /**
   * Trigger emergency alert from smart band
   */
  async triggerEmergency(bandId = "DV-BAND-0001", data = {}) {
    const timeNow = formatTimeString();
    const incidentId = `EMG-BAND-${Date.now().toString(36).toUpperCase()}`;
    const pilgrim = data.pilgrim || "Ramesh Patel (Devotee)";
    const location = data.location || "Somnath Temple - Gate 1 Turnstile";
    const emergencyType = data.type || "EMERGENCY_ASSISTANCE";
    const details = data.details || "⚠ EMERGENCY ASSISTANCE REQUESTED from Smart Band";

    const emergencyStatus = {
      active: true,
      type: emergencyType,
      timestamp: new Date().toISOString(),
      details,
      incidentId,
      pilgrim,
      location,
      bandId,
    };

    const emergencyNotification = {
      id: `notif-emg-${Date.now()}`,
      type: "EMERGENCY",
      title: "🚨 SOS Alert Dispatched",
      message: "Emergency response squad notified. Hold tight.",
      timestamp: new Date().toISOString(),
      read: false,
    };

    const emergencyEvent = {
      id: `ev-emg-${Date.now()}`,
      time: timeNow,
      event: "Emergency SOS triggered",
      type: "EMERGENCY",
      timestamp: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        await IoTDevice.findOneAndUpdate(
          { bandId },
          {
            $set: { emergencyStatus, status: "ALERT" },
            $push: {
              notifications: { $each: [emergencyNotification], $slice: -15 },
              events: { $each: [emergencyEvent], $slice: -30 },
            },
          }
        );
      } catch (err) {
        console.warn("⚠️ [IoT] Emergency trigger fallback to memory:", err.message);
      }
    }

    const band = inMemoryBands.get(bandId) || createDefaultBand();
    band.emergencyStatus = emergencyStatus;
    band.status = "ALERT";
    band.notifications = [emergencyNotification, ...(band.notifications || [])].slice(0, 15);
    band.events = [emergencyEvent, ...(band.events || [])].slice(0, 30);
    inMemoryBands.set(bandId, band);

    // Emit to Authority dashboard and simulator
    const io = getIoInstance();
    if (io) {
      const socketPayload = {
        event: "EMERGENCY_ALERT",
        bandId,
        incidentId,
        pilgrim,
        location,
        timestamp: emergencyStatus.timestamp,
        details,
        type: emergencyType,
      };
      io.to("authority").emit("EMERGENCY_ALERT", socketPayload);
      io.to(`band_${bandId}`).emit("EMERGENCY_ALERT", socketPayload);
      io.emit("EMERGENCY_ALERT", socketPayload);
      console.log(`🚨 [Socket.IO] Dispatched EMERGENCY_ALERT from band ${bandId} to Authority`);
    }

    return {
      success: true,
      message: "Emergency alert dispatched to temple central command and rapid response team.",
      incidentId,
      emergencyStatus,
    };
  },

  /**
   * Retrieve band chronological event timeline
   */
  async getBandEvents(bandId = "DV-BAND-0001") {
    const state = await this.getBandState(bandId);
    return state?.events || [];
  },

  /**
   * Retrieve all registered smart bands for Authority Dashboard
   */
  async getAllBands() {
    let list = [];

    if (isDatabaseConnected()) {
      try {
        list = await IoTDevice.find().lean();
      } catch (err) {
        console.warn("⚠️ [IoT] All bands fallback to memory:", err.message);
      }
    }

    if (!list || list.length === 0) {
      list = Array.from(inMemoryBands.values());
    }

    const onlineCount = list.filter((b) => b.status !== "DISCONNECTED").length;
    const alertCount = list.filter((b) => b.emergencyStatus?.active || b.status === "ALERT").length;

    return {
      summary: {
        total: list.length,
        online: onlineCount,
        alerts: alertCount,
      },
      bands: list.map((b) => ({
        bandId: b.bandId,
        pilgrim: b.currentPass?.leadPilgrim || "Ramesh Patel",
        temple: b.currentPass?.templeName || b.location?.templeName || "Somnath Temple",
        battery: `${b.battery}%`,
        location: `${b.location?.templeName || "Somnath"}, ${b.location?.gate || "Gate 1"}`,
        status: b.status,
        emergency: Boolean(b.emergencyStatus?.active),
        lastSeen: b.lastSeen || new Date().toISOString(),
      })),
    };
  },

  /**
   * Reset band to clean demo baseline
   */
  async resetBand(bandId = "DV-BAND-0001") {
    const cleanBand = createDefaultBand();
    cleanBand.bandId = bandId;

    if (isDatabaseConnected()) {
      try {
        await IoTDevice.findOneAndUpdate({ bandId }, { $set: cleanBand }, { upsert: true });
      } catch (err) {
        console.warn("⚠️ [IoT] Reset band fallback to memory:", err.message);
      }
    }

    inMemoryBands.set(bandId, cleanBand);

    const io = getIoInstance();
    if (io) {
      const payload = {
        event: "BAND_RESET",
        bandId,
        timestamp: new Date().toISOString(),
      };
      io.to(`band_${bandId}`).emit("BAND_RESET", payload);
      io.emit("BAND_RESET", payload);
    }

    return {
      success: true,
      message: `Band ${bandId} reset to baseline standby state.`,
      band: cleanBand,
    };
  },

  /**
   * Demo Simulation Triggers (for DEMO CONTROLS panel)
   */
  async simulateDemoEvent(bandId = "DV-BAND-0001", type = "CROWD_ALERT") {
    const timeNow = formatTimeString();
    const band = inMemoryBands.get(bandId) || createDefaultBand();
    const io = getIoInstance();

    if (type === "PASS_RECEIVED") {
      const mockBooking = {
        bookingId: `BK-SOM-${Math.floor(1000 + Math.random() * 9000)}`,
        templeId: "somnath",
        templeName: "Shree Somnath Jyotirlinga",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        timeSlot: "10:00 AM - 11:30 AM (Madhyahna Aarti)",
        pilgrimCount: 2,
        leadPilgrim: { name: "Ramesh Patel" },
      };
      return await this.syncPassToBand(bandId, mockBooking);
    }

    if (type === "CROWD_ALERT") {
      const notif = {
        id: `notif-crowd-${Date.now()}`,
        type: "CROWD_ALERT",
        title: "⚠ Crowd Alert",
        message: "Crowd level increasing near Gate 2. Divert to North Turnstile.",
        timestamp: new Date().toISOString(),
        read: false,
      };
      const ev = {
        id: `ev-${Date.now()}`,
        time: timeNow,
        event: "Crowd alert: density surge at Gate 2",
        type: "CROWD",
        timestamp: new Date().toISOString(),
      };
      band.notifications = [notif, ...(band.notifications || [])].slice(0, 15);
      band.events = [ev, ...(band.events || [])].slice(0, 30);
      inMemoryBands.set(bandId, band);

      if (io) {
        io.to(`band_${bandId}`).emit("CROWD_ALERT", notif);
        io.emit("CROWD_ALERT", notif);
      }
      return { success: true, notification: notif };
    }

    if (type === "HEALTH_ALERT") {
      band.heartRate = 104;
      band.stressLevel = "Elevated";
      const notif = {
        id: `notif-health-${Date.now()}`,
        type: "HEALTH_ALERT",
        title: "💓 Health Pulse Alert",
        message: "Elevated heart rate detected (104 BPM). Free hydration stall at Gate 1.",
        timestamp: new Date().toISOString(),
        read: false,
      };
      const ev = {
        id: `ev-${Date.now()}`,
        time: timeNow,
        event: "Health telemetry alert (104 BPM)",
        type: "HEALTH",
        timestamp: new Date().toISOString(),
      };
      band.notifications = [notif, ...(band.notifications || [])].slice(0, 15);
      band.events = [ev, ...(band.events || [])].slice(0, 30);
      inMemoryBands.set(bandId, band);

      if (io) {
        io.to(`band_${bandId}`).emit("HEALTH_ALERT", {
          heartRate: 104,
          stressLevel: "Elevated",
          notification: notif,
        });
        io.emit("HEALTH_ALERT", {
          heartRate: 104,
          stressLevel: "Elevated",
          notification: notif,
        });
      }
      return { success: true, notification: notif };
    }

    if (type === "EMERGENCY") {
      return await this.triggerEmergency(bandId, {
        type: "SIMULATED_SOS",
        details: "Demo simulated emergency triggered by operator.",
      });
    }

    return { success: false, message: `Unknown simulation type: ${type}` };
  },
};
