/**
 * @file iotApi.js
 * @description REST API client for DivYatra IoT Smart Band Simulator
 * Supports dynamic Gateway URL configuration (Localhost, Cloud Vercel, or custom)
 */

export const getGatewayUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('divyatra_iot_gateway_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '/api';
};

export const setGatewayUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('divyatra_iot_gateway_url');
    } else {
      localStorage.setItem('divyatra_iot_gateway_url', url.trim().replace(/\/+$/, ''));
    }
  }
};

export const resetGatewayUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('divyatra_iot_gateway_url');
  }
};

export const iotApi = {
  getGatewayUrl,
  setGatewayUrl,
  resetGatewayUrl,

  /**
   * Ping Gateway health and measure roundtrip latency
   */
  async pingGateway() {
    const start = performance.now();
    try {
      const url = `${getGatewayUrl()}/iot/bands`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        return { online: true, latencyMs, url: getGatewayUrl() };
      }
      return { online: false, latencyMs, status: res.status, url: getGatewayUrl() };
    } catch (err) {
      return { online: false, error: err.message, url: getGatewayUrl() };
    }
  },

  /**
   * Fetch complete band state (Cold start & periodic sync)
   */
  async getBandState(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/state`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Failed to fetch band state from server, using local fallback:', err.message);
      return null;
    }
  },

  /**
   * Sync a newly issued pass directly to the band
   */
  async syncPass(bandId = 'DV-BAND-0001', passData = {}) {
    try {
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passData),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ [API] Pass sync call failed:', err.message);
      return { success: true, local: true, ...passData };
    }
  },

  /**
   * Acknowledge pass on wristband
   */
  async acknowledgePass(bandId = 'DV-BAND-0001') {
    try {
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/acknowledge`, {
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
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/emergency`, {
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
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/events`);
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
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/reset`, {
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
      const res = await fetch(`${getGatewayUrl()}/iot/band/${bandId}/simulate`, {
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
      const res = await fetch(`${getGatewayUrl()}/crowd/${templeId}`);
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
