/**
 * AI Crowd Congestion Alerts & Incidents Seed Data
 */

export const initialAlerts = [
  {
    id: "alt-001",
    templeId: "dwarka",
    templeName: "Dwarkadhish Temple",
    title: "High Congestion Predicted at Moksha Dwaar Entry",
    description: "CCTV Computer Vision algorithm detected sudden footfall inflow of 140 pilgrims/min exceeding the 95 pilgrims/min safety corridor threshold at Moksha Dwaar.",
    zone: "Moksha Dwaar (Gate 1)",
    severity: "HIGH", // "INFO", "MEDIUM", "HIGH", "CRITICAL"
    type: "CONGESTION_SURGE",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: "ACTIVE", // "ACTIVE", "ACKNOWLEDGED", "RESOLVED"
    acknowledgedBy: null,
    resolvedAt: null,
    metrics: {
      currentDensity: 88,
      threshold: 75,
      estimatedClearanceMinutes: 25
    },
    recommendedAction: "Activate Reserve Turnstiles 5 & 6 and direct general queue to Gomti Ghat holding bay."
  },
  {
    id: "alt-002",
    templeId: "pavagadh",
    templeName: "Pavagadh Mahakali Mandir",
    title: "Queue Length Exceeded Threshold at Summit Ropeway Station",
    description: "Ropeway landing deck queue has backed up 60 meters towards the mountain staircase, creating a potential pinch point near Gate 3.",
    zone: "Summit Upper Ropeway Deck",
    severity: "MEDIUM",
    type: "QUEUE_BOTTLENECK",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: "ACKNOWLEDGED",
    acknowledgedBy: "Inspector R. Jadeja (Security Control)",
    resolvedAt: null,
    metrics: {
      currentDensity: 82,
      threshold: 70,
      estimatedClearanceMinutes: 18
    },
    recommendedAction: "Regulate Machi base boarding departures by 20% until summit clears."
  },
  {
    id: "alt-003",
    templeId: "somnath",
    templeName: "Shree Somnath Jyotirlinga",
    title: "Unusual Crowd Movement Cluster Detected in Zone B (Sabhamandap)",
    description: "AI spatial clustering identified a localized grouping causing a slowdown in the central aisle before evening Aarti.",
    zone: "Sabhamandap Outer Hall",
    severity: "MEDIUM",
    type: "ANOMALOUS_MOVEMENT",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: "RESOLVED",
    acknowledgedBy: "Chief Marshal M. Varma",
    resolvedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metrics: {
      currentDensity: 52,
      threshold: 65,
      estimatedClearanceMinutes: 0
    },
    recommendedAction: "Marshals mobilized to maintain dual-lane continuous flow."
  },
  {
    id: "alt-004",
    templeId: "ambaji",
    templeName: "Shree Ambaji Shaktipeeth",
    title: "Smooth Flow Maintained Across All 4 Zones",
    description: "All automated camera feeds report zero bottlenecks. Average sanctum wait time is under 15 minutes.",
    zone: "Premise Wide",
    severity: "INFO",
    type: "STATUS_UPDATE",
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    status: "RESOLVED",
    acknowledgedBy: "System Automated Audit",
    resolvedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    metrics: {
      currentDensity: 32,
      threshold: 70,
      estimatedClearanceMinutes: 0
    },
    recommendedAction: "Continue regular staffing roster."
  }
];

export const alerts = initialAlerts;



