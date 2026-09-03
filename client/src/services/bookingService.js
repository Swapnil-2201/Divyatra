/**
 * @file bookingService.js
 * @description Service interface for Darshan quota checking, pass creation, and digital RFID verification.
 */

import { DARSHAN_SLOTS, getSlotsByTempleId } from '../data/darshanSlots';
import { getTempleDataById } from '../data/temples';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('divyatra_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const bookingService = {
  /**
   * Fetch available Darshan booking slots for a temple and date
   * @param {string} templeId
   * @param {string} [date] - YYYY-MM-DD
   * @returns {Promise<import('../data/darshanSlots').DarshanSlot[]>}
   */
  async getDarshanSlots(templeId, date) {
    if (!templeId) return [];
    try {
      const url = date
        ? `${BASE_URL}/darshan-slots/${templeId.toLowerCase()}?date=${date}`
        : `${BASE_URL}/darshan-slots/${templeId.toLowerCase()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || getSlotsByTempleId(templeId);
    } catch (err) {
      return getSlotsByTempleId(templeId);
    }
  },

  /**
   * Create and confirm a Darshan pass / booking
   * @param {Object} bookingData
   * @returns {Promise<Object>}
   */
  async createBooking(bookingData) {
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback pass generation
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const templeObj = getTempleDataById(bookingData.templeId || 'somnath');
    const templeCode = (bookingData.templeId || 'SOM').toUpperCase().slice(0, 3);
    const passId = `BK-${templeCode}-${randomSuffix}`;
    const templeName = bookingData.templeName || templeObj?.name || 'Shree Somnath Jyotirlinga';
    const date = bookingData.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const timeSlot = bookingData.timeSlot || '06:30 AM - 08:00 AM (Prabhat Aarti)';
    const pilgrimCount = Number(bookingData.pilgrimCount) || 1;

    const qrPayloadObj = {
      bookingId: passId,
      temple: templeName,
      date,
      slot: timeSlot,
      pilgrims: pilgrimCount,
      leadPilgrim: bookingData.leadPilgrim?.name || 'Devotee',
      status: 'CONFIRMED',
    };

    return {
      id: passId,
      bookingId: passId,
      templeId: bookingData.templeId || 'somnath',
      templeName,
      date,
      timeSlot,
      pilgrimCount,
      leadPilgrim: bookingData.leadPilgrim || {
        name: 'Pilgrim Devotee',
        phone: '+91 98765 43210',
        idProof: 'Aadhaar Card',
      },
      coPilgrims: bookingData.coPilgrims || [],
      facilities: bookingData.facilities || [],
      specialQueue: Boolean(bookingData.specialQueue),
      prasadCart: bookingData.prasadCart || [],
      amountPaid: bookingData.totalAmount || 0,
      status: 'confirmed',
      paymentId: bookingData.paymentId || `pay_DEMO_${Date.now()}`,
      qrCodeData: JSON.stringify(qrPayloadObj),
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Fetch a confirmed booking by its pass ID
   * @param {string} id
   * @returns {Promise<Object | null>}
   */
  async getBookingById(id) {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      const saved = localStorage.getItem('divyatra_confirmed_passes');
      if (saved) {
        const passes = JSON.parse(saved);
        return passes.find((p) => p.id === id || p.bookingId === id) || null;
      }
      return null;
    }
  },

  /**
   * Retrieve all confirmed passes stored for current user or device
   * @returns {Promise<Object[]>}
   */
  async getUserBookings() {
    try {
      const res = await fetch(`${BASE_URL}/bookings/my`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (err) {
      // Ignore
    }

    const saved = localStorage.getItem('divyatra_confirmed_passes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  },
};
