/**
 * @file temple3DConfig.js
 * @description Dynamic configuration, 3D world-anchored hotspots, and enlarged camera views for all Gujarat shrines.
 */

import {
  Sparkles,
  Users,
  DoorOpen,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';

/**
 * Centralized, calibrated enlarged default camera and view presets per temple.
 * Configured so the temple model appears ~15-20% more enlarged, prominently occupying ~75-80% of viewport height.
 */
export const DEFAULT_TEMPLE_VIEWS = {
  somnath: {
    cameraPosition: [0, 1.25, 2.75],
    target: [0, 0.50, 0],
    fov: 45,
    modelPosition: [0, 0, 0],
    modelScale: 1.0,
    minDistance: 0.6,
    maxDistance: 10.0
  },
  dwarka: {
    cameraPosition: [0, 1.50, 3.25],
    target: [0, 0.64, 0],
    fov: 45,
    modelPosition: [0, 0, 0],
    modelScale: 1.0,
    minDistance: 0.7,
    maxDistance: 12.0
  },
  ambaji: {
    cameraPosition: [0, 1.85, 3.95],
    target: [0, 0.80, 0],
    fov: 45,
    modelPosition: [0, 0, 0],
    modelScale: 1.0,
    minDistance: 0.8,
    maxDistance: 14.0
  },
  pavagadh: {
    cameraPosition: [0, 1.15, 2.70],
    target: [0, 0.46, 0],
    fov: 45,
    modelPosition: [0, 0, 0],
    modelScale: 1.0,
    minDistance: 0.6,
    maxDistance: 10.0
  }
};

export const TEMPLE_3D_CONFIG = {
  somnath: {
    id: "somnath",
    name: "Shree Somnath Jyotirlinga",
    modelUrl: "/models/temples/somnath-draco.glb",
    proxyModelUrl: "/models/temples/somnath-proxy.glb",
    fallbackModelUrl: "/models/temples/somnath.glb",
    architecturalStyle: "Chalukya & Kailash Mahameru Prasad",
    initialRotation: [0, 0, 0],
    camera: DEFAULT_TEMPLE_VIEWS.somnath,
    lighting: {
      ambientIntensity: 1.5,
      directionalIntensity: 2.3,
      directionalColor: 0xfffaed,
      directionalPosition: [20, 40, 20],
      fillIntensity: 0.85,
      fillColor: 0x90b4e0,
      fillPosition: [-20, 20, -20]
    },
    hotspots: [
      {
        id: "spot-som-1",
        title: "Garbhagriha (Main Golden Sanctum)",
        category: "sanctum",
        position3D: [0.0, 0.85, 0.05],
        density: "62%",
        waitTime: "18 mins",
        details: "Revered Shiva Lingam altar with continuous regulated walking parikrama.",
        color: "bg-[#D5A63A]",
        icon: Sparkles
      },
      {
        id: "spot-som-2",
        title: "Sabhamandap (Central Queue Corridor)",
        category: "queues",
        position3D: [0.0, 0.40, 0.50],
        density: "50%",
        waitTime: "10 mins",
        details: "Spacious shaded queue corridor with giant ceiling air-coolers and digital chant screens.",
        color: "bg-[#E97820]",
        icon: Users
      },
      {
        id: "spot-som-3",
        title: "Gate 1 North Entry & Turnstiles",
        category: "gates",
        position3D: [-0.48, 0.10, 0.70],
        density: "42%",
        waitTime: "5 mins",
        details: "High-speed QR barcode scanners and automated security baggage check.",
        color: "bg-[#10B981]",
        icon: DoorOpen
      },
      {
        id: "spot-som-4",
        title: "Mahaprasad Distribution Center",
        category: "prasad",
        position3D: [0.50, 0.10, 0.45],
        density: "38%",
        waitTime: "4 mins",
        details: "Express counters for Pure Ghee Ladoo & Mohanthal collection.",
        color: "bg-[#F59E0B]",
        icon: ShoppingBag
      },
      {
        id: "spot-som-5",
        title: "First Aid & Medical Emergency Post",
        category: "safety",
        position3D: [0.55, 0.15, -0.30],
        density: "15%",
        waitTime: "0 mins",
        details: "Paramedics station equipped with oxygen cylinders, wheelchair ramp, and direct ambulance corridor.",
        color: "bg-[#EF4444]",
        icon: HeartHandshake
      }
    ]
  },

  dwarka: {
    id: "dwarka",
    name: "Shree Dwarkadhish Temple",
    modelUrl: "/models/temples/dwarkadhish-draco.glb",
    proxyModelUrl: "/models/temples/dwarkadhish-proxy.glb",
    fallbackModelUrl: "/models/temples/dwarkadhish.glb",
    architecturalStyle: "Maha-Gurjara & 72-Pillar Jagat Mandir",
    initialRotation: [0, 0, 0],
    camera: DEFAULT_TEMPLE_VIEWS.dwarka,
    lighting: {
      ambientIntensity: 1.5,
      directionalIntensity: 2.4,
      directionalColor: 0xfff6e6,
      directionalPosition: [25, 45, 25],
      fillIntensity: 0.9,
      fillColor: 0x88b8f0,
      fillPosition: [-25, 25, -25]
    },
    hotspots: [
      {
        id: "spot-dwk-1",
        title: "Jagat Mandir Golden Sanctum (Dwarkanath Altar)",
        category: "sanctum",
        position3D: [-0.05, 0.95, 0.05],
        density: "88%",
        waitTime: "25 mins",
        details: "Supreme deity Krishna Jagat Mandir sanctum under 52-Gaj sacred flag spire.",
        color: "bg-[#D5A63A]",
        icon: Sparkles
      },
      {
        id: "spot-dwk-2",
        title: "Central Sabha Mandap (72-Pillared Hall)",
        category: "queues",
        position3D: [0.0, 0.48, 0.45],
        density: "78%",
        waitTime: "15 mins",
        details: "Ancient 2,200-year carved assembly hall with structured multi-lane holding queues.",
        color: "bg-[#E97820]",
        icon: Users
      },
      {
        id: "spot-dwk-3",
        title: "Moksha Dwaar (North Entry Gateway)",
        category: "gates",
        position3D: [-0.65, 0.12, 0.65],
        density: "84%",
        waitTime: "18 mins",
        details: "Main pilgrimage entry portal with RFID turnstiles and security queuing zone.",
        color: "bg-[#10B981]",
        icon: DoorOpen
      },
      {
        id: "spot-dwk-4",
        title: "56-Bhog Mahaprasad Pavilion",
        category: "prasad",
        position3D: [0.70, 0.18, 0.40],
        density: "45%",
        waitTime: "6 mins",
        details: "Sacred 56-Bhog and dry prasad coupon redemption center.",
        color: "bg-[#F59E0B]",
        icon: ShoppingBag
      },
      {
        id: "spot-dwk-5",
        title: "Gomti Ghat Emergency & First Aid",
        category: "safety",
        position3D: [0.75, 0.55, -0.30],
        density: "12%",
        waitTime: "0 mins",
        details: "Emergency trauma station with medical assistance and direct riverfront access.",
        color: "bg-[#EF4444]",
        icon: HeartHandshake
      }
    ]
  },

  ambaji: {
    id: "ambaji",
    name: "Shree Arasuri Ambaji Mata Temple",
    modelUrl: "/models/temples/ambaji-draco.glb",
    proxyModelUrl: "/models/temples/ambaji-proxy.glb",
    fallbackModelUrl: "/models/temples/ambaji.glb",
    architecturalStyle: "White Marble & Pure Gold Kalash Mandir",
    initialRotation: [0, 0, 0],
    camera: DEFAULT_TEMPLE_VIEWS.ambaji,
    lighting: {
      ambientIntensity: 1.5,
      directionalIntensity: 2.3,
      directionalColor: 0xfff8ee,
      directionalPosition: [20, 40, 20],
      fillIntensity: 0.85,
      fillColor: 0x95c0ea,
      fillPosition: [-20, 20, -20]
    },
    hotspots: [
      {
        id: "spot-amb-1",
        title: "Viso Yantra Golden Inner Sanctum",
        category: "sanctum",
        position3D: [0.0, 1.40, 0.05],
        density: "38%",
        waitTime: "8 mins",
        details: "Holy Viso Yantra sacred sanctum beneath 103-feet golden kalash dome.",
        color: "bg-[#D5A63A]",
        icon: Sparkles
      },
      {
        id: "spot-amb-2",
        title: "Chachar Chowk Main Courtyard",
        category: "queues",
        position3D: [0.0, 0.60, 0.50],
        density: "28%",
        waitTime: "4 mins",
        details: "Expansive marble assembly chowk for devotional garba and smooth parikrama.",
        color: "bg-[#E97820]",
        icon: Users
      },
      {
        id: "spot-amb-3",
        title: "Main Temple Entrance Gate",
        category: "gates",
        position3D: [-0.55, 0.12, 0.70],
        density: "32%",
        waitTime: "3 mins",
        details: "Baggage scanner checkpoint with dedicated Senior Citizen fast lane.",
        color: "bg-[#10B981]",
        icon: DoorOpen
      },
      {
        id: "spot-amb-4",
        title: "Mohanthal Mahaprasad Express Counters",
        category: "prasad",
        position3D: [0.58, 0.12, 0.45],
        density: "45%",
        waitTime: "6 mins",
        details: "Exclusive GI-tagged authentic Mohanthal and Peda prasad dispatch booths.",
        color: "bg-[#F59E0B]",
        icon: ShoppingBag
      },
      {
        id: "spot-amb-5",
        title: "Gabbar Hill Medical & Rescue Post",
        category: "safety",
        position3D: [0.65, 0.20, -0.30],
        density: "10%",
        waitTime: "0 mins",
        details: "Emergency medical room equipped with cardiac monitors and ropeway triage unit.",
        color: "bg-[#EF4444]",
        icon: HeartHandshake
      }
    ]
  },

  pavagadh: {
    id: "pavagadh",
    name: "Shree Mahakali Mata Temple, Pavagadh",
    modelUrl: "/models/temples/pavagadh-draco.glb",
    proxyModelUrl: "/models/temples/pavagadh-proxy.glb",
    fallbackModelUrl: "/models/temples/pavagadh.glb",
    architecturalStyle: "High-Altitude Cliff Top Mandir (UNESCO Landscape)",
    initialRotation: [0, 0, 0],
    camera: DEFAULT_TEMPLE_VIEWS.pavagadh,
    lighting: {
      ambientIntensity: 1.5,
      directionalIntensity: 2.4,
      directionalColor: 0xfffaea,
      directionalPosition: [25, 45, 20],
      fillIntensity: 0.85,
      fillColor: 0x8ab6e8,
      fillPosition: [-25, 20, -20]
    },
    hotspots: [
      {
        id: "spot-pav-1",
        title: "Summit Mahakali Sanctum & Dhwaja Mast",
        category: "sanctum",
        position3D: [0.0, 0.80, 0.05],
        density: "76%",
        waitTime: "20 mins",
        details: "Cliff-top Shaktipeeth inner sanctum and newly restored gold-plated shikhara.",
        color: "bg-[#D5A63A]",
        icon: Sparkles
      },
      {
        id: "spot-pav-2",
        title: "Summit Parikrama & Holding Corridors",
        category: "queues",
        position3D: [0.0, 0.35, 0.50],
        density: "82%",
        waitTime: "22 mins",
        details: "Wide cliff-edge fenced pathways with panoramic valley lookouts.",
        color: "bg-[#E97820]",
        icon: Users
      },
      {
        id: "spot-pav-3",
        title: "Upper Ropeway Terminal Peak Gate",
        category: "gates",
        position3D: [-0.52, 0.10, 0.70],
        density: "70%",
        waitTime: "15 mins",
        details: "High-capacity ropeway arrival gate with turnstiles and crowd flow regulators.",
        color: "bg-[#10B981]",
        icon: DoorOpen
      },
      {
        id: "spot-pav-4",
        title: "Machi & Summit Prasad Pavilion",
        category: "prasad",
        position3D: [0.52, 0.10, 0.45],
        density: "40%",
        waitTime: "5 mins",
        details: "Pure ghee prasad packets and sacred red chunari offering booths.",
        color: "bg-[#F59E0B]",
        icon: ShoppingBag
      },
      {
        id: "spot-pav-5",
        title: "Mountain Rescue & First Aid Unit",
        category: "safety",
        position3D: [0.58, 0.15, -0.30],
        density: "15%",
        waitTime: "0 mins",
        details: "High-altitude paramedic center with oxygen concentrators and stretcher assist.",
        color: "bg-[#EF4444]",
        icon: HeartHandshake
      }
    ]
  }
};

/**
 * Normalizes input temple id/slug and retrieves 3D configuration
 * @param {string} rawId
 * @returns {typeof TEMPLE_3D_CONFIG["somnath"]}
 */
export const getTemple3DConfig = (rawId) => {
  if (!rawId) return TEMPLE_3D_CONFIG.somnath;
  const key = rawId.toLowerCase();
  if (key.includes('dwark') || key === 'dwarka' || key === 'dwarkadhish') {
    return TEMPLE_3D_CONFIG.dwarka;
  }
  if (key.includes('ambaji')) {
    return TEMPLE_3D_CONFIG.ambaji;
  }
  if (key.includes('pavagadh') || key.includes('mahakali')) {
    return TEMPLE_3D_CONFIG.pavagadh;
  }
  if (key.includes('somnath')) {
    return TEMPLE_3D_CONFIG.somnath;
  }
  return TEMPLE_3D_CONFIG[key] || TEMPLE_3D_CONFIG.somnath;
};
