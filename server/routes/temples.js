import express from "express";
import { getTemples, getTempleById } from "../controllers/templeController.js";

const router = express.Router();

// GET /api/temples
router.get("/", getTemples);

// GET /api/temples/:id
router.get("/:id", getTempleById);

export default router;
