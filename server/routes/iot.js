import express from "express";
import {
  getBandState,
  registerBand,
  acknowledgePass,
  triggerEmergency,
  getBandEvents,
  getAllBands,
  resetBand,
  simulateEvent,
} from "../controllers/iotController.js";

const router = express.Router();

// Register or update smart band
router.post("/band/register", registerBand);

// Retrieve latest band state (Cold start & periodic sync)
router.get("/band/:bandId/state", getBandState);

// Acknowledge pass received on wristband
router.post("/band/:bandId/acknowledge", acknowledgePass);

// Dispatch emergency SOS from smart band
router.post("/band/:bandId/emergency", triggerEmergency);

// Retrieve band event timeline
router.get("/band/:bandId/events", getBandEvents);

// Reset band for presentation demo
router.post("/band/:bandId/reset", resetBand);

// Demo simulation trigger (pass, crowd, health alerts)
router.post("/band/:bandId/simulate", simulateEvent);

// Authority dashboard monitor: list all connected bands
router.get("/bands", getAllBands);

export default router;
