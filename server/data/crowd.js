/**
 * Real-time Crowd Intelligence & Prediction Seed Data
 */

export const crowdOverview = {
  totalActivePilgrims: 15620,
  averageWaitTimeMinutes: 34,
  activeCriticalZones: 3,
  systemAlertLevel: "ELEVATED_WATCH",
  lastUpdated: new Date().toISOString(),
  templeOverview: [
    {
      templeId: "somnath",
      name: "Shree Somnath Jyotirlinga",
      crowdPercentage: 58,
      status: "optimal",
      activeCount: 3840,
      avgWait: 28,
      criticalZonesCount: 0,
      flowRatePerMinute: 45,
      trend: "stable"
    },
    {
      templeId: "dwarka",
      name: "Shree Dwarkadhish Temple",
      crowdPercentage: 79,
      status: "congested",
      activeCount: 5620,
      avgWait: 52,
      criticalZonesCount: 2,
      flowRatePerMinute: 62,
      trend: "rising"
    },
    {
      templeId: "ambaji",
      name: "Shree Ambaji Shaktipeeth",
      crowdPercentage: 32,
      status: "low",
      activeCount: 1950,
      avgWait: 14,
      criticalZonesCount: 0,
      flowRatePerMinute: 28,
      trend: "falling"
    },
    {
      templeId: "pavagadh",
      name: "Shree Pavagadh Mahakali",
      crowdPercentage: 74,
      status: "moderate_high",
      activeCount: 4210,
      avgWait: 45,
      criticalZonesCount: 1,
      flowRatePerMinute: 38,
      trend: "rising"
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
      templeId: "dwarka",
      templeName: "Dwarkadhish Temple",
      zoneName: "Garbhagriha Inner Sanctum Altar",
      currentDensity: "84%",
      threshold: "70%",
      severity: "WARNING",
      actionRecommended: "Enforce 15-second continuous walking darshan flow."
    },
    {
      id: "cz-3",
      templeId: "pavagadh",
      templeName: "Pavagadh Mahakali",
      zoneName: "Summit Upper Ropeway Deck",
      currentDensity: "82%",
      threshold: "75%",
      severity: "WARNING",
      actionRecommended: "Throttle bottom ropeway departure rate by 20% to relieve summit platform."
    }
  ]
};

export const crowdData = crowdOverview;

export const updateSimulatedCrowd = () => {
  crowdOverview.templeOverview.forEach((t) => {
    const delta = Math.floor((Math.random() - 0.48) * 6);
    t.crowdPercentage = Math.min(95, Math.max(20, t.crowdPercentage + delta));
    t.activeCount = Math.round(t.activeCount * (1 + delta / 100));
    t.avgWait = Math.max(5, Math.round((t.crowdPercentage / 100) * 60));
  });
  crowdOverview.totalActivePilgrims = crowdOverview.templeOverview.reduce((s, t) => s + t.activeCount, 0);
  crowdOverview.lastUpdated = new Date().toISOString();
  return crowdOverview;
};

