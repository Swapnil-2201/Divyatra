import { Prasadam } from "../models/Prasadam.js";
import { isDatabaseConnected } from "../config/db.js";
import { prasadItems as mockPrasad } from "../data/prasad.js";

const inMemoryOrders = [];

export const prasadamService = {
  async getPrasadam(templeId, category) {
    if (isDatabaseConnected()) {
      const query = {};
      if (templeId && templeId !== "all") query.templeId = templeId.toLowerCase();
      if (category && category !== "all") query.category = new RegExp(category, "i");
      const items = await Prasadam.find(query).lean();
      if (items && items.length > 0) return items;
    }

    let items = mockPrasad;
    if (templeId && templeId !== "all") {
      items = items.filter((p) => p.templeId === templeId.toLowerCase() || p.templeId === "all");
    }
    if (category && category !== "all") {
      items = items.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    return items;
  },

  async createOrder(orderPayload) {
    const orderId = `PRASAD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      orderId,
      items: orderPayload.items || [],
      deliveryType: orderPayload.deliveryType || "TEMPLE_COUNTER_PICKUP",
      recipient: orderPayload.recipient || {},
      shippingAddress: orderPayload.shippingAddress || null,
      totalAmount: orderPayload.totalAmount || 0,
      paymentId: orderPayload.paymentId || `pay_${Date.now()}`,
      status: orderPayload.deliveryType === "SPEED_POST_DELIVERY" ? "DISPATCH_QUEUED" : "READY_FOR_PICKUP",
      estimatedDispatch: "Within 24 Hours with Temple Blessed Seal",
      createdAt: new Date().toISOString(),
    };
    inMemoryOrders.unshift(newOrder);
    return newOrder;
  },
};
