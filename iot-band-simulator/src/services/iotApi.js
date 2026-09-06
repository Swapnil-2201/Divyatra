/**
 * @file iotApi.js
 * @description REST API client for DivYatra IoT Smart Band Simulator
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const iotApi = {
  /**
   * Fetch complete band state (Cold start & periodic sync)
   */
  async getBandState(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/state`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Failed to fetch band state from server, using local fallback:', err.message);
      return null;
    }
  },

  /**
   * Acknowledge pass on wristband
   */
  async acknowledgePass(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Acknowledge call failed:', err.message);
      return { success: true, status: 'PASS ACTIVE' };
    }
  },

  /**
   * Trigger emergency SOS alert from band
   */
  async triggerEmergency(bandId = 'DV-BAND-0001', payload = {}) {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Emergency trigger failed:', err.message);
      return {
        success: true,
        incidentId: `EMG-LOCAL-${Date.now()}`,
        emergencyStatus: { active: true, timestamp: new Date().toISOString(), ...payload },
      };
    }
  },

  /**
   * Retrieve band event timeline
   */
  async getBandEvents(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/events`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Reset band to clean standby state
   */
  async resetBand(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Reset band call failed:', err.message);
      return { success: true };
    }
  },

  /**
   * Demo Simulation Triggers (Pass, Crowd, Health, Emergency)
   */
  async simulateEvent(bandId = 'DV-BAND-0001', type = 'CROWD_ALERT') {
    try {
      const res = await fetch(`${BASE_URL}/iot/band/${bandId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Simulation trigger failed:', err.message);
      return { success: true, local: true };
    }
  },

  /**
   * Fetch Live Crowd Telemetry from existing crowd API
   */
  async getCrowdTelemetry(templeId = 'somnath') {
    try {
      const res = await fetch(`${BASE_URL}/crowd/${templeId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      return {
        templeId,
        crowdPercentage: 58,
        estimatedWaitMinutes: 34,
        statusLabel: 'Moderate',
      };
    }
  },
};
