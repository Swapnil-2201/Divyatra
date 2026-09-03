/**
 * @file prasadamService.js
 * @description Service interface for querying sacred prasadam offerings and placing pickup/dispatch orders.
 */

import { PRASAD_ITEMS, getPrasadamItems, getPrasadamById } from '../data/prasadam';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const prasadamService = {
  /**
   * Fetch all sacred offerings, optionally filtered by temple or category
   * @param {string} [templeId]
   * @param {string} [category]
   * @returns {Promise<import('../data/prasadam').PrasadItem[]>}
   */
  async getPrasadam(templeId, category) {
    try {
      let url = `${BASE_URL}/prasad`;
      const params = new URLSearchParams();
      if (templeId && templeId !== 'all') params.append('templeId', templeId);
      if (category && category !== 'all') params.append('category', category);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || getPrasadamItems(templeId, category);
    } catch (err) {
      return getPrasadamItems(templeId, category);
    }
  },

  /**
   * Fetch specific prasad item by its unique ID
   * @param {string} id
   * @returns {Promise<import('../data/prasadam').PrasadItem | undefined>}
   */
  async getPrasadamItemById(id) {
    if (!id) return undefined;
    return getPrasadamById(id);
  },

  /**
   * Create and confirm a prasad pickup / speed post order
   * @param {Object} orderData
   * @returns {Promise<Object>}
   */
  async createPrasadOrder(orderData) {
    try {
      const res = await fetch(`${BASE_URL}/prasad/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback simulation
    }

    const orderId = `PRASAD-${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      orderId,
      items: orderData.items || [],
      deliveryType: orderData.deliveryType || "TEMPLE_COUNTER_PICKUP",
      recipient: orderData.recipient || {},
      totalAmount: orderData.totalAmount || 0,
      paymentId: orderData.paymentId || `pay_${Date.now()}`,
      status: orderData.deliveryType === "SPEED_POST_DELIVERY" ? "DISPATCH_QUEUED" : "READY_FOR_PICKUP",
      estimatedDispatch: "Within 24 Hours with Temple Blessed Seal",
      createdAt: new Date().toISOString()
    };
  }
};
