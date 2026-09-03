/**
 * @file alerts.js
 * @description Centralized alerts, administrative warnings, and high-priority advisories for temple corridors.
 *
 * @typedef {Object} SystemAlert
 * @property {string} id - Unique alert ID
 * @property {string} templeId - ID of the temple ('somnath' | 'dwarka' | 'ambaji' | 'pavagadh' | 'all')
 * @property {string} templeName - Temple name
 * @property {string} zone - Zone name or location of the incident
 * @property {string} type - 'CROWD_SURGE' | 'WEATHER_ALERT' | 'QUEUE_HOLD' | 'MEDICAL_DISPATCH' | 'SECURITY'
 * @property {string} severity - 'CRITICAL' | 'WARNING' | 'INFO'
 * @property {string} message - Human readable operational message
 * @property {string} actionRequired - Recommended control action for authorities
 * @property {string} timestamp - ISO timestamp of alert creation
 * @property {boolean} acknowledged - Whether duty officer has acknowledged
 * @property {boolean} resolved - Whether the issue is marked resolved
 */

export const INITIAL_ALERTS = [
  {
    id: "alt-dwk-01",
    templeId: "dwarka",
    templeName: "Dwarkadhish Temple",
    zone: "Moksha Dwaar (Gate 1 Entry)",
    type: "CROWD_SURGE",
    severity: "CRITICAL",
    message: "Gate 1 turnstile density reached 88% capacity. Heavy devotee inflow from Gomti Ghat.",
    actionRequired: "Open Reserve Turnstiles 5 & 6; divert incoming queue to Gomti Ghat holding plaza.",
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    acknowledged: false,
    resolved: false
  },
  {
    id: "alt-pav-02",
    templeId: "pavagadh",
    templeName: "Pavagadh Mahakali",
    zone: "Machi Ropeway Boarding Terminal",
    type: "QUEUE_HOLD",
    severity: "WARNING",
    message: "Ropeway waiting time reached 35 minutes. Ascent crowd queue is extending to lower parking.",
    actionRequired: "Deploy express stairway marshals and broadcast estimated wait times over PA system.",
    timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    acknowledged: true,
    resolved: false
  },
  {
    id: "alt-som-03",
    templeId: "somnath",
    templeName: "Shree Somnath Jyotirlinga",
    zone: "Seafront Promenade (South Plaza)",
    type: "WEATHER_ALERT",
    severity: "INFO",
    message: "High tide coastal warning active until 08:30 PM. Sea spray along lower parapet.",
    actionRequired: "Security personnel to maintain safety perimeter along Arabian Sea railing.",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledged: true,
    resolved: false
  },
  {
    id: "alt-amb-04",
    templeId: "ambaji",
    templeName: "Maa Ambaji Temple",
    zone: "Chachar Chowk Altar",
    type: "CROWD_SURGE",
    severity: "INFO",
    message: "All queue zones functioning optimally at 32% capacity. Zero congestion detected.",
    actionRequired: "Standard patrol duty active.",
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    acknowledged: true,
    resolved: true
  }
];

export const BROADCAST_ADVISORIES = [
  {
    id: "adv-01",
    level: "HIGH_PRIORITY",
    title: "Maha Aarti Fast-Track Booking",
    message: "Evening Maha Aarti slot passes now open for booking across all four shrines. Book in advance to bypass peak queue delays."
  }
];
