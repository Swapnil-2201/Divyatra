import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/payment/create-order (Initiate payment transaction)
router.post("/create-order", optionalAuth, createPaymentOrder);

// POST /api/payment/verify (Verify signature, confirm booking, generate QR, create notification)
router.post("/verify", optionalAuth, verifyPayment);

export default router;
