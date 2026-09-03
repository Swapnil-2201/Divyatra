/**
 * @file alertService.js
 * @description Service interface for corridor safety alerts, officer acknowledgements, and broadcast advisories.
 */

import { INITIAL_ALERTS, BROADCAST_ADVISORIES } from '../data/alerts';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('divyatra_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// In-memory alert state for client fallback
let alertsStore = INITIAL_ALERTS.map((a) => ({
  ...a,
  status: a.status || (a.resolved ? 'RESOLVED' : a.acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE'),
  responseNotes: a.responseNotes || [],
}));
let advisoriesStore = [...BROADCAST_ADVISORIES];

export const alertService = {
  /**
   * Fetch all active alerts across all temple corridors
   */
  async getAlerts() {
    try {
      const res = await fetch(`${BASE_URL}/alerts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      alertsStore = json.data || alertsStore;
      return alertsStore;
    } catch (err) {
      return alertsStore;
    }
  },

  /**
   * Acknowledge an alert by duty officer
   */
  async acknowledgeAlert(id, officerName = 'Officer On Duty') {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officerName }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }

    alertsStore = alertsStore.map((a) =>
      a.id === id
        ? {
            ...a,
            acknowledged: true,
            status: 'ACKNOWLEDGED',
            acknowledgedBy: officerName,
            responseNotes: [
              ...(a.responseNotes || []),
              { author: officerName, note: 'Alert acknowledged on duty terminal.', timestamp: new Date().toISOString() },
            ],
          }
        : a
    );
    return alertsStore.find((a) => a.id === id);
  },

  /**
   * Investigate an alert / dispatch marshals
   */
  async investigateAlert(id, officerName = 'Duty Officer', note = 'Marshals dispatched to investigate chokepoint.') {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${id}/investigate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officerName, note }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }

    alertsStore = alertsStore.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'INVESTIGATING',
            responseNotes: [
              ...(a.responseNotes || []),
              { author: officerName, note, timestamp: new Date().toISOString() },
            ],
          }
        : a
    );
    return alertsStore.find((a) => a.id === id);
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(id, officerName = 'Duty Commander') {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${id}/resolve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officerName }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }

    alertsStore = alertsStore.map((a) =>
      a.id === id
        ? {
            ...a,
            resolved: true,
            status: 'RESOLVED',
            resolvedAt: new Date().toISOString(),
            responseNotes: [
              ...(a.responseNotes || []),
              { author: officerName, note: 'Corridor restored to normal throughput. Incident marked resolved.', timestamp: new Date().toISOString() },
            ],
          }
        : a
    );
    return alertsStore.find((a) => a.id === id);
  },

  /**
   * Add response note to alert timeline
   */
  async addAlertNote(id, author = 'Authority Officer', note) {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${id}/note`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ author, note }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }

    alertsStore = alertsStore.map((a) =>
      a.id === id
        ? {
            ...a,
            responseNotes: [
              ...(a.responseNotes || []),
              { author, note, timestamp: new Date().toISOString() },
            ],
          }
        : a
    );
    return alertsStore.find((a) => a.id === id);
  },

  /**
   * Broadcast high-priority advisory to public devotees
   */
  async broadcastAdvisory(advisory) {
    try {
      const res = await fetch(`${BASE_URL}/alerts/broadcast`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(advisory),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
    }

    const newAdvisory = {
      id: `adv-${Date.now()}`,
      level: advisory.level || 'HIGH_PRIORITY',
      title: advisory.title || 'Pilgrim Advisory',
      message: advisory.message || '',
      timestamp: new Date().toISOString(),
    };
    advisoriesStore.unshift(newAdvisory);
    return newAdvisory;
  },
};
