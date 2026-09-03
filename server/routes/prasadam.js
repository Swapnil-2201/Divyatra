import express from "express";
import { getPrasadam, createPrasadOrder } from "../controllers/prasadamController.js";

const router = express.Router();

// GET /api/prasadam or /api/prasad
router.get("/", getPrasadam);

// POST /api/prasadam/order or /api/prasad/order
router.post("/order", createPrasadOrder);

export default router;
