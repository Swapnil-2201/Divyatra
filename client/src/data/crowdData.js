/**
 * @file crowdData.js
 * @description Centralized crowd intelligence, edge CCTV count baselines, and predictive metrics.
 *
 * @typedef {Object} TempleCrowdOverview
 * @property {string} templeId - ID of the temple
 * @property {string} name - Name of the temple
 * @property {number} crowdPercentage - Current density percentage (0 - 100)
 * @property {string} status - 'low' | 'moderate' | 'high' | 'critical'
 * @property {number} activeCount - Estimated active devotees in premise
 * @property {number} avgWait - Estimated waiting time in minutes
 * @property {string} statusLabel - Human readable telemetry status
 * @property {string} statusColor - 'emerald' | 'amber' | 'rose' | 'red'
 * @property {string} trend - 'stable' | 'increasing' | 'decreasing'
 */

export const INITIAL_CROWD_DATA = {
  totalActivePilgrims: 15620,
  averageWaitTimeMinutes: 34,
  activeCriticalZones: 2,
  systemAlertLevel: "ELEVATED_WATCH",
  lastUpdated: new Date().toISOString(),

  templeOverview: [
    {
      templeId: "somnath",
      name: "Shree Somnath Jyotirlinga",
      crowdPercentage: 58,
      status: "moderate",
      activeCount: 3840,
      avgWait: 28,
      statusLabel: "Optimal Flow — Smooth Queues",
      statusColor: "emerald",
      trend: "stable"
    },
    {
      templeId: "dwarka",
      name: "Shree Dwarkadhish Temple",
      crowdPercentage: 79,
      status: "high",
      activeCount: 5620,
      avgWait: 52,
      statusLabel: "High Congestion — Queues Active",
      statusColor: "amber",
      trend: "increasing"
    },
    {
      templeId: "ambaji",
      name: "Shree Arasuri Ambaji Mata Temple",
      crowdPercentage: 32,
      status: "low",
      activeCount: 1950,
      avgWait: 14,
      statusLabel: "Minimal Wait — Highly Recommended",
      statusColor: "emerald",
      trend: "decreasing"
    },
    {
      templeId: "pavagadh",
      name: "Shree Mahakali Mata Temple",
      crowdPercentage: 74,
      status: "high",
      activeCount: 4210,
      avgWait: 45,
      statusLabel: "Ropeway Queue Active (35 min)",
      statusColor: "amber",
      trend: "stable"
    }
  ],

  hourlyPredictions: [
    { hour: "06:00 AM", somnath: 35, dwarka: 45, ambaji: 20, pavagadh: 30, overall: 32 },
    { hour: "08:00 AM", somnath: 55, dwarka: 70, ambaji: 28, pavagadh: 65, overall: 54 },
    { hour: "10:00 AM", somnath: 65, dwarka: 85, ambaji: 35, pavagadh: 80, overall: 66 },
    { hour: "12:00 PM", somnath: 72, dwarka: 90, ambaji: 40, pavagadh: 75, overall: 69 },
    { hour: "02:00 PM", somnath: 48, dwarka: 60, ambaji: 25, pavagadh: 45, overall: 44 },
    { hour: "04:00 PM", somnath: 60, dwarka: 75, ambaji: 38, pavagadh: 65, overall: 59 },
    { hour: "06:00 PM", somnath: 85, dwarka: 92, ambaji: 55, pavagadh: 82, overall: 78 },
    { hour: "08:00 PM", somnath: 70, dwarka: 80, ambaji: 45, pavagadh: 50, overall: 61 },
    { hour: "10:00 PM", somnath: 25, dwarka: 30, ambaji: 15, pavagadh: 10, overall: 20 }
  ],

  criticalZonesList: [
    {
      id: "cz-1",
      templeId: "dwarka",
      templeName: "Dwarkadhish Temple",
      zoneName: "Moksha Dwaar Turnstiles (Gate 1)",
      currentDensity: "88%",
      threshold: "75%",
      severity: "CRITICAL",
      actionRecommended: "Open Reserve Turnstiles 5 & 6; divert incoming queue to Gomti Ghat holding plaza."
    },
    {
      id: "cz-2",
      templeId: "pavagadh",
      templeName: "Pavagadh Mahakali",
      zoneName: "Machi Ropeway Boarding Queue",
      currentDensity: "82%",
      threshold: "70%",
      severity: "WARNING",
      actionRecommended: "Deploy express stairway marshals and inform devotees of 35-minute wait time."
    }
  ]
};

/**
 * Simulate live telemetry pulse
 */
export const generateSimulatedCrowdPulse = (baseData = INITIAL_CROWD_DATA) => {
  const updatedOverview = baseData.templeOverview.map((item) => {
    const delta = Math.floor((Math.random() - 0.48) * 6);
    const newPct = Math.min(96, Math.max(18, item.crowdPercentage + delta));
    let status = "low";
    let statusColor = "emerald";
    if (newPct > 75) {
      status = "high";
      statusColor = "rose";
    } else if (newPct > 45) {
      status = "moderate";
      statusColor = "amber";
    }
    const newCount = Math.round(item.activeCount * (1 + delta / 100));
    const newWait = Math.max(5, Math.round((newPct / 100) * 60));

    return {
      ...item,
      crowdPercentage: newPct,
      activeCount: newCount,
      avgWait: newWait,
      status,
      statusColor
    };
  });

  const totalActive = updatedOverview.reduce((sum, i) => sum + i.activeCount, 0);
  const avgWait = Math.round(
    updatedOverview.reduce((sum, i) => sum + i.avgWait, 0) / updatedOverview.length
  );

  return {
    ...baseData,
    totalActivePilgrims: totalActive,
    averageWaitTimeMinutes: avgWait,
    lastUpdated: new Date().toISOString(),
    templeOverview: updatedOverview
  };
};
