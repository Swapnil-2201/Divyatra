import express from "express";
import {
  getLiveCrowd,
  getCrowdByTempleId,
  simulateCrowd,
  getCctvTelemetry,
  ingestCctvTelemetry,
} from "../controllers/crowdController.js";

const router = express.Router();

// GET /api/crowd
router.get("/", getLiveCrowd);

// GET /api/crowd/cctv-telemetry
router.get("/cctv-telemetry", getCctvTelemetry);

// POST /api/crowd/cctv-ingest
router.post("/cctv-ingest", ingestCctvTelemetry);

// POST /api/crowd/simulate
router.post("/simulate", simulateCrowd);

// GET /api/crowd/:templeId
router.get("/:templeId", getCrowdByTempleId);

export default router;

