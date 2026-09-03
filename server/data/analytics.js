/**
 * Historical Analytics, Peak Hours & Comparative Telemetry
 */

export const analyticsData = {
  summary: {
    totalPilgrimsThisMonth: 1485200,
    averageWaitTimeAcrossTemples: "28.4 mins",
    predictionAccuracy: "94.8%",
    activeCCTVCameras: 64,
    alertsResolvedToday: 18,
    vipQuotaBookedToday: "86%",
    prasadKitsDispatched: 3840
  },
  dailyFootfallTrends: [
    { day: "Mon", somnath: 28400, dwarka: 34200, ambaji: 16500, pavagadh: 21800, total: 100900 },
    { day: "Tue", somnath: 26100, dwarka: 31800, ambaji: 15200, pavagadh: 19400, total: 92500 },
    { day: "Wed", somnath: 29500, dwarka: 36400, ambaji: 17800, pavagadh: 22600, total: 106300 },
    { day: "Thu", somnath: 31200, dwarka: 38900, ambaji: 18900, pavagadh: 24100, total: 113100 },
    { day: "Fri", somnath: 38400, dwarka: 46200, ambaji: 22400, pavagadh: 29800, total: 136800 },
    { day: "Sat", somnath: 54200, dwarka: 64800, ambaji: 38900, pavagadh: 44500, total: 202400 },
    { day: "Sun", somnath: 58900, dwarka: 71200, ambaji: 42100, pavagadh: 49200, total: 221400 }
  ],
  darshanThroughputByHour: [
    { hour: "06-08 AM", rate: 3200, waitTime: 12 },
    { hour: "08-10 AM", rate: 5800, waitTime: 28 },
    { hour: "10-12 PM", rate: 7400, waitTime: 46 },
    { hour: "12-02 PM", rate: 6100, waitTime: 38 },
    { hour: "02-04 PM", rate: 4200, waitTime: 18 },
    { hour: "04-06 PM", rate: 6900, waitTime: 35 },
    { hour: "06-08 PM", rate: 8600, waitTime: 54 },
    { hour: "08-10 PM", rate: 4100, waitTime: 22 }
  ],
  templeComparisonMetrics: [
    { name: "Somnath", capacity: 65000, avgWait: 28, satisfactionRate: 98, safetyScore: 99, peakUtilization: 88 },
    { name: "Dwarka", capacity: 70000, avgWait: 52, satisfactionRate: 94, safetyScore: 96, peakUtilization: 94 },
    { name: "Ambaji", capacity: 50000, avgWait: 14, satisfactionRate: 99, safetyScore: 99, peakUtilization: 68 },
    { name: "Pavagadh", capacity: 45000, avgWait: 45, satisfactionRate: 95, safetyScore: 97, peakUtilization: 91 }
  ],
  festivalSurgeForecast: [
    { festival: "Maha Shivratri (Somnath)", expectedMultiplier: "4.8x", riskLevel: "Extreme", recommendedMarshals: 450 },
    { festival: "Janmashtami (Dwarka)", expectedMultiplier: "5.4x", riskLevel: "Extreme", recommendedMarshals: 520 },
    { festival: "Bhadarvi Poonam (Ambaji)", expectedMultiplier: "6.2x", riskLevel: "Critical Surge", recommendedMarshals: 600 },
    { festival: "Chaitra Navratri (Pavagadh)", expectedMultiplier: "4.2x", riskLevel: "High", recommendedMarshals: 380 }
  ]
};
