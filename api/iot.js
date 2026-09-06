/**
 * Vercel Serverless Function: /api/iot
 * DivYatra IoT Smart Band Mesh & Wearable Telemetry Gateway
 */

// Shared serverless state store (in-memory per lambda instance)
let simulatedBand = {
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
    label: "GPS SIMULATION",
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
      id: `ev-init-1`,
      time: "12:00:00",
      event: "Band connected",
      type: "CONNECT",
      timestamp: new Date().toISOString(),
    },
    {
      id: `ev-init-2`,
      time: "12:00:02",
      event: "Telemetry calibrated",
      type: "SYSTEM",
      timestamp: new Date().toISOString(),
    },
  ],
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const queryPath = (req.query.path || "").toString();
  const url = req.url || "";
  const nowTime = new Date().toTimeString().split(" ")[0];

  try {
    // 1. GET /api/iot/bands - Authority Dashboard monitor
    if (queryPath === "bands" || url.includes("/bands")) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            total: 1,
            online: 1,
            alerts: simulatedBand.emergencyStatus?.active ? 1 : 0,
          },
          bands: [
            {
              bandId: simulatedBand.bandId,
              pilgrim: simulatedBand.currentPass?.leadPilgrim || "Ramesh Patel",
              temple: simulatedBand.currentPass?.templeName || "Somnath Temple",
              battery: `${simulatedBand.battery}%`,
              location: `${simulatedBand.location.templeName}, ${simulatedBand.location.gate}`,
              status: simulatedBand.emergencyStatus?.active ? "ALERT" : simulatedBand.status,
              emergency: Boolean(simulatedBand.emergencyStatus?.active),
              lastSeen: simulatedBand.lastSeen || new Date().toISOString(),
            },
          ],
        },
      });
    }

    // 1b. POST /api/iot/band/:bandId/pass - Sync newly issued pass from booking
    if ((queryPath.includes("pass") || url.includes("/pass")) && req.method === "POST") {
      const pass = req.body || {};
      simulatedBand.currentPass = {
        bookingId: pass.bookingId || `BK-SOM-${Date.now().toString(36).toUpperCase()}`,
        templeId: pass.templeId || "somnath",
        templeName: pass.templeName || "Shree Somnath Jyotirlinga",
        date: pass.date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
        slot: pass.slot || pass.timeSlot || "10:00 AM - 11:30 AM (Madhyahna Aarti)",
        pilgrims: Number(pass.pilgrims || pass.pilgrimCount || 1),
        leadPilgrim: pass.leadPilgrim?.name || pass.leadPilgrim || "Ramesh Patel",
        status: "ISSUED",
        qrPayload: pass.qrPayload || pass.qrCodeData || JSON.stringify(pass),
        issuedAt: pass.issuedAt || new Date().toISOString(),
      };
      simulatedBand.status = "ACTIVE";
      simulatedBand.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: "PASS_ISSUED",
        title: "🔔 New Darshan Pass",
        message: `${simulatedBand.currentPass.templeName.split(' ')[1] || simulatedBand.currentPass.templeName} • ${simulatedBand.currentPass.slot}`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      simulatedBand.events.unshift(
        { id: `ev-${Date.now()}-1`, time: nowTime, event: "Pass received", type: "PASS", timestamp: new Date().toISOString() },
        { id: `ev-${Date.now()}-2`, time: nowTime, event: "QR generated", type: "QR", timestamp: new Date().toISOString() },
        { id: `ev-${Date.now()}-3`, time: nowTime, event: "Pass synced to wearable", type: "SYSTEM", timestamp: new Date().toISOString() }
      );

      return res.status(200).json({
        success: true,
        message: "Pass synced to smart band successfully",
        data: simulatedBand.currentPass,
      });
    }

    // 2. POST /api/iot/band/:bandId/acknowledge
    if (queryPath.includes("acknowledge") || url.includes("/acknowledge")) {
      if (simulatedBand.currentPass) {
        simulatedBand.currentPass.status = "ACTIVE";
        simulatedBand.currentPass.acknowledgedAt = new Date().toISOString();
      }
      simulatedBand.status = "ACTIVE";
      simulatedBand.events.unshift({
        id: `ev-ack-${Date.now()}`,
        time: nowTime,
        event: "Pass acknowledged",
        type: "ACK",
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: "Pass acknowledged successfully. Status: PASS ACTIVE",
        data: { status: "PASS ACTIVE" },
      });
    }

    // 3. POST /api/iot/band/:bandId/emergency/clear
    if ((queryPath.includes("clear") || url.includes("/clear")) && req.method === "POST") {
      simulatedBand.emergencyStatus = {
        active: false,
        type: "NONE",
        timestamp: null,
        details: "",
        incidentId: "",
        clearedAt: new Date().toISOString(),
      };
      simulatedBand.status = simulatedBand.currentPass ? "ACTIVE" : "CONNECTED";
      simulatedBand.events.unshift({
        id: `ev-clr-${Date.now()}`,
        time: nowTime,
        event: "Emergency alert silenced / cleared",
        type: "SYSTEM",
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: "Emergency alert silenced and cleared on band.",
      });
    }

    // 3b. POST /api/iot/band/:bandId/emergency
    if (queryPath.includes("emergency") || url.includes("/emergency")) {
      const incidentId = `EMG-BAND-${Date.now().toString(36).toUpperCase()}`;
      const payload = req.body || {};
      const source = payload.source || (payload.pushedBy ? "AUTHORITY" : "PILGRIM");
      const pushedBy = payload.pushedBy || (source === "AUTHORITY" ? "Temple Authority Central Command" : null);

      simulatedBand.emergencyStatus = {
        active: true,
        type: payload.type || (source === "AUTHORITY" ? "AUTHORITY_EMERGENCY" : "SOS"),
        timestamp: new Date().toISOString(),
        details: payload.details || (source === "AUTHORITY" 
          ? "⚠ TEMPLE AUTHORITY EMERGENCY BROADCAST: Security & evacuation protocol active." 
          : "⚠ EMERGENCY ASSISTANCE REQUESTED from Smart Band"),
        incidentId,
        pilgrim: payload.pilgrim || "Ramesh Patel",
        location: `${simulatedBand.location.templeName} - Gate 1`,
        source,
        pushedBy,
        isAuthorityPush: source === "AUTHORITY" || source === "ADMIN" || Boolean(pushedBy),
      };
      simulatedBand.status = "ALERT";
      simulatedBand.events.unshift({
        id: `ev-emg-${Date.now()}`,
        time: nowTime,
        event: source === "AUTHORITY" ? "Authority Emergency Broadcast" : "Emergency SOS triggered",
        type: "EMERGENCY",
        timestamp: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        message: "Emergency alert dispatched.",
        data: {
          incidentId,
          emergencyStatus: simulatedBand.emergencyStatus,
        },
      });
    }

    // 4. POST /api/iot/band/:bandId/reset
    if (queryPath.includes("reset") || url.includes("/reset")) {
      simulatedBand.currentPass = null;
      simulatedBand.status = "CONNECTED";
      simulatedBand.emergencyStatus = { active: false, type: "NONE" };
      return res.status(200).json({
        success: true,
        message: "Band reset to baseline state.",
      });
    }

    // 5. POST /api/iot/band/:bandId/simulate
    if (queryPath.includes("simulate") || url.includes("/simulate")) {
      const type = req.body?.type || "PASS_RECEIVED";
      if (type === "PASS_RECEIVED") {
        simulatedBand.currentPass = {
          bookingId: `BK-SOM-${Math.floor(1000 + Math.random() * 9000)}`,
          templeId: "somnath",
          templeName: "Shree Somnath Jyotirlinga",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          slot: "10:00 AM - 11:30 AM (Madhyahna Aarti)",
          pilgrims: 2,
          leadPilgrim: "Ramesh Patel",
          status: "ISSUED",
          qrPayload: JSON.stringify({
            bookingId: `BK-SOM-DEMO`,
            templeId: "somnath",
            templeName: "Shree Somnath Jyotirlinga",
            date: "2026-10-12",
            slot: "10:00 AM",
            pilgrims: 2,
          }),
          issuedAt: new Date().toISOString(),
        };
        simulatedBand.status = "ACTIVE";
        simulatedBand.events.unshift(
          { id: `ev-${Date.now()}-1`, time: nowTime, event: "Pass received", type: "PASS", timestamp: new Date().toISOString() },
          { id: `ev-${Date.now()}-2`, time: nowTime, event: "QR generated", type: "QR", timestamp: new Date().toISOString() }
        );
      } else if (type === "CROWD_ALERT") {
        simulatedBand.notifications.unshift({
          id: `notif-${Date.now()}`,
          type: "CROWD_ALERT",
          title: "⚠ Crowd Alert",
          message: "Crowd level increasing near Gate 2.",
          timestamp: new Date().toISOString(),
        });
        simulatedBand.events.unshift({
          id: `ev-${Date.now()}`,
          time: nowTime,
          event: "Crowd alert: density surge at Gate 2",
          type: "CROWD",
          timestamp: new Date().toISOString(),
        });
      } else if (type === "HEALTH_ALERT") {
        simulatedBand.heartRate = 104;
        simulatedBand.stressLevel = "Elevated";
        simulatedBand.notifications.unshift({
          id: `notif-${Date.now()}`,
          type: "HEALTH_ALERT",
          title: "💓 Health Pulse Alert",
          message: "Elevated heart rate detected (104 BPM).",
          timestamp: new Date().toISOString(),
        });
        simulatedBand.events.unshift({
          id: `ev-${Date.now()}`,
          time: nowTime,
          event: "Health telemetry alert (104 BPM)",
          type: "HEALTH",
          timestamp: new Date().toISOString(),
        });
      } else if (type === "EMERGENCY" || type === "AUTHORITY_EMERGENCY") {
        const incidentId = `EMG-BAND-${Date.now().toString(36).toUpperCase()}`;
        simulatedBand.emergencyStatus = {
          active: true,
          type: "AUTHORITY_EMERGENCY",
          source: "AUTHORITY",
          pushedBy: "Temple Authority Central Command",
          timestamp: new Date().toISOString(),
          details: "⚠ CRITICAL DRILL: Temple Authority dispatched rapid response alert to all wristbands.",
          incidentId,
          pilgrim: "Ramesh Patel",
          location: `${simulatedBand.location.templeName} - Gate 1`,
          isAuthorityPush: true,
        };
        simulatedBand.status = "ALERT";
        simulatedBand.events.unshift({
          id: `ev-emg-${Date.now()}`,
          time: nowTime,
          event: "Authority Emergency Broadcast",
          type: "EMERGENCY",
          timestamp: new Date().toISOString(),
        });
      } else if (type === "CLEAR_EMERGENCY") {
        simulatedBand.emergencyStatus = { active: false, type: "NONE" };
        simulatedBand.status = simulatedBand.currentPass ? "ACTIVE" : "CONNECTED";
      }

      return res.status(200).json({ success: true, type, band: simulatedBand });
    }

    // 6. GET /api/iot/band/:bandId/events
    if (queryPath.includes("events") || url.includes("/events")) {
      return res.status(200).json({
        success: true,
        data: simulatedBand.events,
      });
    }

    // 7. GET /api/iot/band/:bandId/state (Default)
    return res.status(200).json({
      success: true,
      data: {
        bandId: simulatedBand.bandId,
        status: simulatedBand.status,
        connectionStatus: simulatedBand.status,
        battery: simulatedBand.battery,
        signalStrength: simulatedBand.signalStrength,
        telemetry: {
          heartRate: simulatedBand.heartRate,
          stressLevel: simulatedBand.stressLevel,
          temperature: simulatedBand.temperature,
          label: "SIMULATED",
        },
        location: simulatedBand.location,
        currentBooking: simulatedBand.currentPass,
        currentPass: simulatedBand.currentPass,
        pilgrimInformation: simulatedBand.currentPass?.leadPilgrim || "Ramesh Patel",
        temple: simulatedBand.currentPass?.templeName || "Shree Somnath Jyotirlinga",
        slot: simulatedBand.currentPass?.slot || null,
        crowdStatus: {
          exposure: "58%",
          crowdExposure: "Moderate",
          wait: "34 minutes",
          waitMinutes: 34,
          status: "Moderate",
          zone: "Gate 1 Turnstile",
        },
        emergencyStatus: simulatedBand.emergencyStatus,
        latestNotifications: simulatedBand.notifications,
        events: simulatedBand.events,
        lastSeen: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
