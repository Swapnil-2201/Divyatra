/**
 * @file crowdService.js
 * @description Service interface for live crowd telemetry, queue forecasts, and simulation pulses.
 */

import { INITIAL_CROWD_DATA, generateSimulatedCrowdPulse } from '../data/crowdData';
import { getTempleDataById } from '../data/temples';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory telemetry cache for client runtime simulation
let currentTelemetryState = { ...INITIAL_CROWD_DATA };

export const crowdService = {
  /**
   * Fetch aggregate live crowd data across all 4 shrines
   * @returns {Promise<typeof INITIAL_CROWD_DATA>}
   */
  async getOverallCrowdData() {
    try {
      const res = await fetch(`${BASE_URL}/crowd`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      currentTelemetryState = json.data || currentTelemetryState;
      return currentTelemetryState;
    } catch (err) {
      return currentTelemetryState;
    }
  },

  /**
   * Fetch specific crowd metrics and wait time for a single temple
   * @param {string} templeId
   * @returns {Promise<{ crowdPercentage: number, estimatedWait: number, statusLabel: string, statusColor: string, activeCount: number }>}
   */
  async getCrowdStatus(templeId) {
    if (!templeId) return null;
    const overall = await this.getOverallCrowdData();
    const overview = overall.templeOverview?.find(
      (t) => t.templeId.toLowerCase() === templeId.toLowerCase()
    );
    const fallbackTemple = getTempleDataById(templeId);

    return {
      templeId: templeId.toLowerCase(),
      name: overview?.name || fallbackTemple?.name,
      crowdPercentage: overview?.crowdPercentage ?? fallbackTemple?.liveStatus?.crowdPercentage ?? 50,
      estimatedWait: overview?.avgWait ?? fallbackTemple?.liveStatus?.estimatedWaitMinutes ?? 25,
      statusLabel: overview?.statusLabel || fallbackTemple?.liveStatus?.statusLabel || "Optimal Flow",
      statusColor: overview?.statusColor || fallbackTemple?.liveStatus?.statusColor || "emerald",
      activeCount: overview?.activeCount ?? fallbackTemple?.liveStatus?.activePilgrimsInPremise ?? 3500,
      trend: overview?.trend || "stable"
    };
  },

  /**
   * Fetch hourly crowd prediction vectors (06:00 AM - 10:00 PM)
   * @returns {Promise<Array>}
   */
  async getHourlyPredictions() {
    const overall = await this.getOverallCrowdData();
    return overall.hourlyPredictions || INITIAL_CROWD_DATA.hourlyPredictions;
  },

  /**
   * Trigger simulated edge-AI sensor telemetry pulse
   * @returns {Promise<typeof INITIAL_CROWD_DATA>}
   */
  async simulateCrowdTelemetry() {
    try {
      const res = await fetch(`${BASE_URL}/crowd/simulate`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        currentTelemetryState = json.data;
        return currentTelemetryState;
      }
    } catch (err) {
      // Local fallback simulation
    }
    currentTelemetryState = generateSimulatedCrowdPulse(currentTelemetryState);
    return currentTelemetryState;
  }
};
