/**
 * Emergency Response & Operational Command Seed Data
 */

export const emergencyData = {
  emergencyContacts: [
    { name: "State Disaster Management Control Room", number: "1070", available: "24x7" },
    { name: "Gujarat Police Temple Security Wing", number: "112 / 100", available: "24x7" },
    { name: "Emergency Medical & 108 Ambulance", number: "108", available: "24x7" },
    { name: "Somnath Trust Central Security Control", number: "+91 2876 231200", available: "24x7" },
    { name: "Dwarkadhish Temple Administration Control", number: "+91 2892 234080", available: "24x7" },
    { name: "Ambaji Temple Trust Emergency Cell", number: "+91 2749 262136", available: "24x7" },
    { name: "Pavagadh Ropeway & Hill Rescue Unit", number: "+91 2676 245642", available: "24x7" }
  ],
  activeIncidents: [
    {
      id: "inc-101",
      templeId: "dwarka",
      templeName: "Shree Dwarkadhish Temple",
      zone: "Gate 1 Moksha Dwaar Entry Queue",
      type: "MEDICAL_ASSISTANCE",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      reportedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      details: "Elderly pilgrim experienced slight dehydration in queue corridor 3. Mobile Paramedic Unit 2 dispatched with hydration kit and wheelchair.",
      assignedTeam: "Rapid Medical Response Unit Alpha",
      timeline: [
        { time: "8 mins ago", event: "Incident triggered via SOS button / CCTV AI motion stop" },
        { time: "6 mins ago", event: "Control room assigned Paramedic Team Alpha" },
        { time: "3 mins ago", event: "First responders reached pilgrim; vitals stable" }
      ]
    },
    {
      id: "inc-102",
      templeId: "pavagadh",
      templeName: "Pavagadh Mahakali Mandir",
      zone: "Summit Staircase Section 4",
      type: "CROWD_BOTTLENECK_REROUTE",
      severity: "HIGH",
      status: "CONTAINED",
      reportedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      details: "Bottleneck near summit staircase due to intermittent rain. Rain sheds opened and auxiliary staircase lane 2 activated.",
      assignedTeam: "Hill Safety Marshal Battalion 4",
      timeline: [
        { time: "22 mins ago", event: "Camera #3 flagged queue stagnation" },
        { time: "18 mins ago", event: "Marshals deployed to diverge traffic to Lane 2" },
        { time: "10 mins ago", event: "Crowd density dropped from 89% to 68%" }
      ]
    }
  ],
  responseUnits: [
    { id: "unit-1", name: "Somnath Quick Reaction Team 1", status: "STANDBY", location: "North Gate Plaza", personnel: 8 },
    { id: "unit-2", name: "Dwarka Rapid Medical Unit Alpha", status: "ON_MISSION", location: "Moksha Dwaar", personnel: 4 },
    { id: "unit-3", name: "Ambaji Shakti Marshal Force", status: "PATROLLING", location: "Chachar Chowk", personnel: 12 },
    { id: "unit-4", name: "Pavagadh Ropeway Evac Squad", status: "STANDBY", location: "Machi Terminal", personnel: 6 }
  ]
};
