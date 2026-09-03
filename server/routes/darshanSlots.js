import express from "express";
import { getDarshanSlots } from "../controllers/darshanSlotController.js";

const router = express.Router();

// GET /api/darshan-slots/:templeId
router.get("/:templeId", getDarshanSlots);

export default router;
