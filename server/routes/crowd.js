import express from "express";
import {
  getLiveCrowd,
  getCrowdByTempleId,
  simulateCrowd,
} from "../controllers/crowdController.js";

const router = express.Router();

// GET /api/crowd
router.get("/", getLiveCrowd);

// POST /api/crowd/simulate
router.post("/simulate", simulateCrowd);

// GET /api/crowd/:templeId
router.get("/:templeId", getCrowdByTempleId);

export default router;
