import express from "express";
import { prasadItems } from "../data/prasad.js";

const router = express.Router();

// In-memory prasad orders store
const prasadOrders = [];

// GET /api/prasad - Get all prasad catalog items
router.get("/", (req, res) => {
  const { templeId, category } = req.query;
  let items = prasadItems;
  if (templeId && templeId !== "all") {
    items = items.filter((p) => p.templeId === templeId || p.templeId === "all");
  }
  if (category) {
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ success: true, count: items.length, data: items });
});

// POST /api/prasad/order - Place a prasad order
router.post("/order", (req, res) => {
  try {
    const { items, deliveryType, recipient, shippingAddress, totalAmount, paymentId } = req.body;
    const orderId = `PRASAD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      orderId,
      items: items || [],
      deliveryType: deliveryType || "TEMPLE_COUNTER_PICKUP",
      recipient: recipient || {},
      shippingAddress: shippingAddress || null,
      totalAmount: totalAmount || 0,
      paymentId: paymentId || `pay_${Date.now()}`,
      status: deliveryType === "SPEED_POST_DELIVERY" ? "DISPATCH_QUEUED" : "READY_FOR_PICKUP",
      estimatedDispatch: "Within 24 Hours with Temple Blessed Seal",
      createdAt: new Date().toISOString()
    };

    prasadOrders.unshift(newOrder);
    res.status(201).json({ success: true, message: "Prasad order confirmed!", data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
