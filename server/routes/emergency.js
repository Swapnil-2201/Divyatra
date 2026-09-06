import express from "express";
import { emergencyData } from "../data/emergency.js";
import { protect, authorize } from "../middleware/auth.js";
import { iotService } from "../services/iotService.js";

const router = express.Router();

let activeIncidentsStore = [...emergencyData.activeIncidents];

// GET /api/emergency - Protected for Authority & Admin
router.get("/", protect, authorize("authority", "admin"), (req, res) => {
  res.json({
    success: true,
    data: {
      emergencyContacts: emergencyData.emergencyContacts,
      activeIncidents: activeIncidentsStore,
      responseUnits: emergencyData.responseUnits,
      activeIncidentCount: activeIncidentsStore.filter((i) => i.status !== "RESOLVED").length,
    },
  });
});

// POST /api/emergency/sos - Accessible to all (even pilgrims in distress, with optionalAuth)
router.post("/sos", (req, res) => {
  try {
    const { templeId, zone, type = "PILGRIM_SOS", details, pilgrimContact, pushToBands, source } = req.body;
    const incidentId = `SOS-${Date.now()}`;

    const newIncident = {
      id: incidentId,
      templeId: templeId || "somnath",
      templeName: templeId ? `${templeId.toUpperCase()} Temple` : "Temple Premise",
      zone: zone || "General Sanctum Area",
      type,
      severity: "CRITICAL",
      status: "IN_PROGRESS",
      reportedAt: new Date().toISOString(),
      details: details || `Emergency SOS triggered by pilgrim (${pilgrimContact || "App User"}). Location pinpointed.`,
      assignedTeam: "Rapid Incident Response Squad 1",
      timeline: [
        { time: "Just now", event: "Emergency SOS triggered from Mobile/Web App" },
        { time: "Just now", event: "Nearest security personnel & medical station alerted" },
      ],
    };

    activeIncidentsStore.unshift(newIncident);

    // Push emergency notification to registered IoT bands if requested or authority drill
    if (pushToBands !== false && (source === "AUTHORITY" || type === "SECURITY_ASSIST" || pushToBands === true)) {
      try {
        iotService.triggerEmergency("DV-BAND-0001", {
          type: "AUTHORITY_EMERGENCY",
          source: "AUTHORITY",
          pushedBy: req.body.officerName || "Temple Authority Emergency Cell",
          details: details || `Emergency alert active for ${newIncident.templeName} - ${newIncident.zone}`,
          location: `${newIncident.templeName} - ${newIncident.zone}`,
        });
      } catch (e) {
        console.warn("⚠️ [Emergency] Smart band push notice:", e.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "SOS alert dispatched to temple control room and rapid response team!",
      data: newIncident,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/emergency/incidents/:id/resolve - Protected for Authority & Admin
router.post("/incidents/:id/resolve", protect, authorize("authority", "admin"), (req, res) => {
  const index = activeIncidentsStore.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Incident not found" });
  }

  activeIncidentsStore[index] = {
    ...activeIncidentsStore[index],
    status: "RESOLVED",
    resolvedAt: new Date().toISOString(),
  };

  // Clear emergency state on IoT smart band mesh
  try {
    iotService.clearEmergency("DV-BAND-0001");
  } catch (e) {
    console.warn("⚠️ [Emergency] Band clear notice:", e.message);
  }

  res.json({
    success: true,
    message: "Incident status updated to RESOLVED",
    data: activeIncidentsStore[index],
  });
});

export default router;
