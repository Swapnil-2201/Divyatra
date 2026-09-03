/**
 * @file temples.js
 * @description Centralized, unified data model for all 4 target pilgrimage shrines in Gujarat.
 *
 * @typedef {Object} TempleFacility
 * @property {string} name - Facility name
 * @property {string} icon - Lucide icon name
 * @property {boolean} available - Active availability
 *
 * @typedef {Object} TempleZone
 * @property {string} id - Unique zone identifier
 * @property {string} name - Human readable zone name
 * @property {number} density - Current density percentage (0-100)
 * @property {number} waitMinutes - Average queue delay in minutes
 * @property {string} status - 'Smooth' | 'Moderate' | 'Crowded' | 'High Density' | 'Clear'
 *
 * @typedef {Object} Temple
 * @property {string} id - Unique temple identifier ('somnath' | 'dwarka' | 'ambaji' | 'pavagadh')
 * @property {string} name - Full sacred title
 * @property {string} shortName - Abbreviated name
 * @property {string} deity - Supreme deity worshipped
 * @property {string} location - District, Taluka & State
 * @property {{ lat: number, lng: number }} coordinates - Latitude / Longitude
 * @property {string} tagline - Editorial tagline
 * @property {string} description - Comprehensive overview
 * @property {string} historicalSignificance - Heritage and Skanda Purana significance
 * @property {string} heroImage - Imported local high-res photo
 * @property {string} thumbnail - Imported local thumbnail photo
 * @property {string[]} gallery - Imported local photo gallery
 * @property {string} crowdLevel - 'low' | 'moderate' | 'high' | 'critical'
 * @property {number} occupancy - Estimated active pilgrims in premise
 * @property {number} estimatedWait - Average estimated wait in minutes
 * @property {string} nextAarti - Next scheduled Aarti time
 * @property {number} dailyCapacity - Total maximum daily pilgrims threshold
 * @property {import('./darshanSlots').DarshanSlot[]} darshanSlots - Available booking slots
 * @property {TempleFacility[]} facilities - Pilgrim amenities
 * @property {Object} liveDarshan - Official broadcast metadata & channel links
 * @property {string} officialWebsite - Official trust domain
 * @property {Object} weather - Environmental telemetry
 * @property {TempleZone[]} zones - Premise queue zones
 * @property {Array} cctvCams - Edge AI camera stream metadata
 */

import { TEMPLE_IMAGES, getTempleImage } from './templeImages';
import { DARSHAN_SLOTS } from './darshanSlots';
import { AARTI_SCHEDULES } from './aartiSchedules';
import { TEMPLE_LIVE_STREAMS } from '../services/liveDarshanService';

export const TEMPLES_DATA = [
  // ── 1. SHREE SOMNATH JYOTIRLINGA ──────────────────────────────────────────
  {
    id: "somnath",
    name: "Shree Somnath Jyotirlinga",
    shortName: "Somnath Temple",
    deity: "Lord Shiva (First of Twelve Jyotirlingas)",
    location: "Prabhas Patan, Veraval, Gujarat",
    coordinates: { lat: 20.8880, lng: 70.4012 },
    tagline: "The Eternal Shrine by the Arabian Sea",
    description: "Somnath is revered as the first amongst the twelve holy Jyotirlinga shrines of Lord Shiva. Perched on the Arabian Sea coast, the temple stands as a glorious testament to faith, having been reconstructed in grand Chalukya architecture with intricate stone carvings, the sacred Banstambh, and a timeless spiritual aura.",
    historicalSignificance: "Mentioned in the Rigveda and Skanda Purana, Somnath is known as the 'Shrine Eternal'. The current grand Kailash Mahameru Prasad temple was reconstructed under the vision of Sardar Vallabhbhai Patel and inaugurated by Dr. Rajendra Prasad in 1951.",
    
    // Images resolved directly from authentic local assets
    heroImage: TEMPLE_IMAGES.somnath.hero,
    thumbnail: TEMPLE_IMAGES.somnath.thumbnail,
    gallery: TEMPLE_IMAGES.somnath.gallery,
    
    // Core telemetry
    crowdLevel: "moderate",
    occupancy: 3840,
    estimatedWait: 28,
    nextAarti: "07:00 PM (Sandhya Maha Aarti)",
    dailyCapacity: 65000,
    
    // Timings and slots
    timings: AARTI_SCHEDULES.somnath,
    darshanSlots: DARSHAN_SLOTS.somnath,
    
    // Live streaming metadata
    liveDarshan: TEMPLE_LIVE_STREAMS.somnath,
    officialWebsite: "https://somnath.org",

    // Live environmental status
    weather: {
      temp: 29,
      condition: "Pleasant Coastal Breeze",
      humidity: "62%",
      windSpeed: "18 km/h",
      icon: "wind"
    },

    facilities: [
      { name: "Free Cloakroom & Luggage Locker", icon: "luggage", available: true },
      { name: "Wheelchair & Golf Cart Assist", icon: "wheelchair", available: true },
      { name: "Sardar Patel Dormitory & Guest Houses", icon: "home", available: true },
      { name: "Purified RO Drinking Water Stations", icon: "droplet", available: true },
      { name: "Mobile & Shoe Counter (Gate 1 & 3)", icon: "shield", available: true },
      { name: "24/7 First Aid & Ambulance Booth", icon: "cross", available: true }
    ],

    zones: [
      { id: "zone-a", name: "Main Sanctum (Garbhagriha)", density: 65, waitMinutes: 18, status: "Moderate" },
      { id: "zone-b", name: "Sabhamandap & Outer Hall", density: 50, waitMinutes: 10, status: "Smooth" },
      { id: "zone-c", name: "North Gate Entrance (Gate 1)", density: 42, waitMinutes: 5, status: "Smooth" },
      { id: "zone-d", name: "South Sea Promenade (Gate 2)", density: 30, waitMinutes: 3, status: "Low" },
      { id: "zone-e", name: "Sound & Light Arena", density: 20, waitMinutes: 0, status: "Clear" }
    ],

    cctvCams: [
      { id: "cam-som-01", name: "Gate 1 Main Entry", count: 42, status: "Online", streamFps: 30 },
      { id: "cam-som-02", name: "Sabhamandap Queue", count: 86, status: "Online", streamFps: 30 },
      { id: "cam-som-03", name: "Garbhagriha Corridor", count: 34, status: "Online", streamFps: 30 },
      { id: "cam-som-04", name: "Seafront Exit Plaza", count: 28, status: "Online", streamFps: 30 }
    ],

    liveStatus: {
      crowdLevel: "moderate",
      crowdPercentage: 58,
      estimatedWaitMinutes: 28,
      activePilgrimsInPremise: 3840,
      dailyCapacity: 65000,
      todayTotalVisitors: 32450,
      vipQueueWaitMinutes: 10,
      statusLabel: "Optimal Flow",
      statusColor: "emerald",
      peakHoursToday: "06:30 PM - 08:30 PM"
    }
  },

  // ── 2. SHREE DWARKADHISH TEMPLE ───────────────────────────────────────────
  {
    id: "dwarka",
    name: "Shree Dwarkadhish Temple",
    shortName: "Dwarkadhish (Jagat Mandir)",
    deity: "Lord Krishna (Dwarkanath / King of Dwarka)",
    location: "Dwarka, Devbhumi Dwarka, Gujarat",
    coordinates: { lat: 22.2376, lng: 68.9678 },
    tagline: "The Sacred Kingdom of Dwarkadhish & Char Dham Shrine",
    description: "Dwarkadhish Temple, also known as the Jagat Mandir, is one of the four holiest Char Dham pilgrimage sites of India. Situated at the holy confluence of the Gomti River and Arabian Sea, the 5-story spire rests on 72 magnificent carved pillars, flying the legendary 52-yard sacred Dhwaja (flag).",
    historicalSignificance: "Dating back over 2,200 years and traditionally founded by Vajranabha, Lord Krishna's great-grandson, the temple stands at the supreme seat of Krishna's golden kingdom. The 52-yard flag hoisted 5 times daily represents the 52 gates of ancient Dwarka.",
    
    heroImage: TEMPLE_IMAGES.dwarka.hero,
    thumbnail: TEMPLE_IMAGES.dwarka.thumbnail,
    gallery: TEMPLE_IMAGES.dwarka.gallery,
    
    crowdLevel: "high",
    occupancy: 5620,
    estimatedWait: 52,
    nextAarti: "07:30 PM (Sandhya Aarti)",
    dailyCapacity: 70000,

    timings: AARTI_SCHEDULES.dwarka,
    darshanSlots: DARSHAN_SLOTS.dwarka,
    liveDarshan: TEMPLE_LIVE_STREAMS.dwarka,
    officialWebsite: "https://dwarkadhish.org",

    weather: {
      temp: 31,
      condition: "Sunny & High Tide Warning",
      humidity: "68%",
      windSpeed: "22 km/h",
      icon: "sun"
    },

    facilities: [
      { name: "56-Bhog & Mahaprasad Dining Hall", icon: "utensils", available: true },
      { name: "Gomti Ghat Boating & Bathing Enclosure", icon: "anchor", available: true },
      { name: "Senior Citizen & Specially-Abled Elevators", icon: "arrow-up", available: true },
      { name: "Secure Mobile & Valuables Vaults", icon: "lock", available: true },
      { name: "Pilgrim Rest Lounge with Air Cooling", icon: "wind", available: true },
      { name: "Multilingual Information Helpdesk", icon: "info", available: true }
    ],

    zones: [
      { id: "zone-a", name: "Moksha Dwaar (North Gate Entry)", density: 84, waitMinutes: 25, status: "Congested" },
      { id: "zone-b", name: "Jagat Mandir Sabha Mandap", density: 78, waitMinutes: 18, status: "Crowded" },
      { id: "zone-c", name: "Garbhagriha Golden Altar", density: 88, waitMinutes: 12, status: "High Density" },
      { id: "zone-d", name: "Swarga Dwaar (Gomti River Exit 56 steps)", density: 45, waitMinutes: 5, status: "Smooth" },
      { id: "zone-e", name: "Dhwajarohan Flag Plaza", density: 60, waitMinutes: 8, status: "Moderate" }
    ],

    cctvCams: [
      { id: "cam-dwk-01", name: "Moksha Dwaar Turnstiles", count: 94, status: "Online", streamFps: 30 },
      { id: "cam-dwk-02", name: "Jagat Mandir Outer Courtyard", count: 112, status: "Online", streamFps: 30 },
      { id: "cam-dwk-03", name: "Central Sanctum Queue", count: 78, status: "Online", streamFps: 30 },
      { id: "cam-dwk-04", name: "Gomti Ghat Confluence Stalls", count: 52, status: "Online", streamFps: 30 }
    ],

    liveStatus: {
      crowdLevel: "high",
      crowdPercentage: 79,
      estimatedWaitMinutes: 52,
      activePilgrimsInPremise: 5620,
      dailyCapacity: 70000,
      todayTotalVisitors: 41200,
      vipQueueWaitMinutes: 18,
      statusLabel: "High Congestion - Queues Active",
      statusColor: "amber",
      peakHoursToday: "11:00 AM - 01:00 PM & 06:00 PM - 08:30 PM"
    }
  },

  // ── 3. SHREE ARASURI AMBAJI MATA TEMPLE ───────────────────────────────────
  {
    id: "ambaji",
    name: "Shree Arasuri Ambaji Mata Temple",
    shortName: "Ambaji Shaktipeeth",
    deity: "Maa Amba (Principal 51 Shaktipeeth - Heart of Sati)",
    location: "Ambaji, Danta Taluka, Banaskantha, Gujarat",
    coordinates: { lat: 24.3314, lng: 72.8532 },
    tagline: "Supreme Shaktipeeth of Gujarat on the Holy Arasur Hills",
    description: "Ambaji is one of the paramount 51 Shaktipeeths where the heart of Goddess Sati is believed to have fallen. Uniquely, the temple enshrines no idol, but instead venerates the divine sacred 'Viso Yantra' inscribed with Vedic mantras, adorned with pure gold and silver plating under a glittering 103-feet golden kalash.",
    historicalSignificance: "Nestled in the ancient Aravalli ranges near Gabbar Hill, Ambaji has been a supreme pilgrimage hub for centuries. Gabbar Hill houses the eternal Akhand Jyot and footprint impressions of the Goddess.",
    
    heroImage: TEMPLE_IMAGES.ambaji.hero,
    thumbnail: TEMPLE_IMAGES.ambaji.thumbnail,
    gallery: TEMPLE_IMAGES.ambaji.gallery,
    
    crowdLevel: "low",
    occupancy: 1950,
    estimatedWait: 14,
    nextAarti: "07:00 PM (Maha Sandhya Aarti)",
    dailyCapacity: 50000,

    timings: AARTI_SCHEDULES.ambaji,
    darshanSlots: DARSHAN_SLOTS.ambaji,
    liveDarshan: TEMPLE_LIVE_STREAMS.ambaji,
    officialWebsite: "https://ambajitemple.in",

    weather: {
      temp: 26,
      condition: "Cool Hill Breeze",
      humidity: "48%",
      windSpeed: "12 km/h",
      icon: "cloud"
    },

    facilities: [
      { name: "Gabbar Hill Ropeway (Udan Khatola)", icon: "compass", available: true },
      { name: "Mohan Thal Prasad Distribution Express Counter", icon: "box", available: true },
      { name: "51 Shaktipeeth Parikrama Walkway", icon: "map-pin", available: true },
      { name: "Shree Ambaji Trust AC Guest Houses", icon: "home", available: true },
      { name: "Automated RFID Shoe Storage", icon: "tag", available: true },
      { name: "Free Annakshetra Dining for All Pilgrims", icon: "heart", available: true }
    ],

    zones: [
      { id: "zone-a", name: "Main Sanctum (Viso Yantra Altar)", density: 38, waitMinutes: 8, status: "Smooth" },
      { id: "zone-b", name: "Chachar Chowk (Courtyard)", density: 28, waitMinutes: 4, status: "Clear" },
      { id: "zone-c", name: "Prasad Counter Complex", density: 45, waitMinutes: 6, status: "Moderate" },
      { id: "zone-d", name: "Gabbar Ropeway Lower Station", density: 35, waitMinutes: 10, status: "Smooth" }
    ],

    cctvCams: [
      { id: "cam-amb-01", name: "Chachar Chowk Main Entrance", count: 28, status: "Online", streamFps: 30 },
      { id: "cam-amb-02", name: "Viso Yantra Sanctum Queue", count: 35, status: "Online", streamFps: 30 },
      { id: "cam-amb-03", name: "Mohanthal Prasad Distribution", count: 44, status: "Online", streamFps: 30 },
      { id: "cam-amb-04", name: "Gabbar Ropeway Terminal", count: 21, status: "Online", streamFps: 30 }
    ],

    liveStatus: {
      crowdLevel: "low",
      crowdPercentage: 32,
      estimatedWaitMinutes: 14,
      activePilgrimsInPremise: 1950,
      dailyCapacity: 50000,
      todayTotalVisitors: 18900,
      vipQueueWaitMinutes: 5,
      statusLabel: "Minimal Wait - Highly Recommended",
      statusColor: "emerald",
      peakHoursToday: "07:00 PM - 08:30 PM"
    }
  },

  // ── 4. SHREE MAHAKALI MATA TEMPLE, PAVAGADH ───────────────────────────────
  {
    id: "pavagadh",
    name: "Shree Mahakali Mata Temple",
    shortName: "Pavagadh Mahakali Mandir",
    deity: "Maa Mahakali (Supreme Shaktipeeth & UNESCO Hill Complex)",
    location: "Pavagadh Hill, Champaner, Panchmahal, Gujarat",
    coordinates: { lat: 22.4608, lng: 73.5244 },
    tagline: "The Sacred High-Altitude Cliff Peak of Champaner-Pavagadh",
    description: "Rising 800 meters above the Champaner plains, the Shree Mahakali Temple crowns the summit of Pavagadh Hill. Recognized as a UNESCO World Heritage site cultural landscape, the temple recently restored its grand Dhwajarohan mast and expanded its hilltop parikrama path, accessed via modern ropeway and scenic stone stairways.",
    historicalSignificance: "Pavagadh translates to 'one quarter hill' (Pāvaka-gadha). Famous for its ancient fortifications dating back to the 8th century, sage Vishwamitra is believed to have performed severe penance here to invoke Goddess Mahakali.",
    
    heroImage: TEMPLE_IMAGES.pavagadh.hero,
    thumbnail: TEMPLE_IMAGES.pavagadh.thumbnail,
    gallery: TEMPLE_IMAGES.pavagadh.gallery,
    
    crowdLevel: "high",
    occupancy: 4210,
    estimatedWait: 45,
    nextAarti: "07:15 PM (Sandhya Aarti)",
    dailyCapacity: 45000,

    timings: AARTI_SCHEDULES.pavagadh,
    darshanSlots: DARSHAN_SLOTS.pavagadh,
    liveDarshan: TEMPLE_LIVE_STREAMS.pavagadh,
    officialWebsite: "https://gujarattourism.com/destination/details/champaner-pavagadh",

    weather: {
      temp: 24,
      condition: "Misty Mountain Summit",
      humidity: "75%",
      windSpeed: "24 km/h",
      icon: "cloud-rain"
    },

    facilities: [
      { name: "Machi to Hilltop High-Speed Ropeway", icon: "navigation", available: true },
      { name: "Paved Stride Steps with Rain Canopies", icon: "umbrella", available: true },
      { name: "Hilltop Emergency Medical Post", icon: "activity", available: true },
      { name: "Safe Mountain Railing & Stair Rest Benches", icon: "shield", available: true },
      { name: "Prasad & Coconut Counter at Machi & Summit", icon: "coffee", available: true },
      { name: "Shuttle Bus from Manchi Base", icon: "truck", available: true }
    ],

    zones: [
      { id: "zone-a", name: "Summit Mahakali Sanctum", density: 76, waitMinutes: 20, status: "Crowded" },
      { id: "zone-b", name: "Upper Ropeway Terminal Peak", density: 82, waitMinutes: 22, status: "High Queue" },
      { id: "zone-c", name: "Machi Base Ropeway Station", density: 70, waitMinutes: 15, status: "Moderate" },
      { id: "zone-d", name: "Teliya Talav & Pilgrim Pathway", density: 40, waitMinutes: 5, status: "Smooth" }
    ],

    cctvCams: [
      { id: "cam-pav-01", name: "Machi Ropeway Boarding Queue", count: 85, status: "Online", streamFps: 30 },
      { id: "cam-pav-02", name: "Summit Staircase Chokepoint", count: 68, status: "Online", streamFps: 30 },
      { id: "cam-pav-03", name: "Mahakali Altar Main Chamber", count: 46, status: "Online", streamFps: 30 },
      { id: "cam-pav-04", name: "Upper Parikrama Corridor", count: 38, status: "Online", streamFps: 30 }
    ],

    liveStatus: {
      crowdLevel: "high",
      crowdPercentage: 74,
      estimatedWaitMinutes: 45,
      activePilgrimsInPremise: 4210,
      dailyCapacity: 45000,
      todayTotalVisitors: 28400,
      vipQueueWaitMinutes: 15,
      statusLabel: "Ropeway Queue Active (35 min)",
      statusColor: "amber",
      peakHoursToday: "08:00 AM - 11:30 AM & 04:30 PM - 07:00 PM"
    }
  }
];

/**
 * Helper to fetch all temples
 * @returns {Temple[]}
 */
export const getAllTemples = () => TEMPLES_DATA;

/**
 * Helper to fetch single temple by ID
 * @param {string} id
 * @returns {Temple | undefined}
 */
export const getTempleDataById = (id) => {
  return TEMPLES_DATA.find((t) => t.id.toLowerCase() === id.toLowerCase()) || TEMPLES_DATA[0];
};
