/**
 * Seed dataset for Target Pilgrimage Sites:
 * 1. Shree Somnath Jyotirlinga (Veraval, Gujarat)
 * 2. Shree Dwarkadhish Temple (Jagat Mandir, Dwarka)
 * 3. Maa Ambaji Temple (Arasur, Banaskantha)
 * 4. Mahakali Temple (Pavagadh Hill, Panchmahal)
 */

export const temples = [
  {
    id: "somnath",
    name: "Shree Somnath Jyotirlinga",
    shortName: "Somnath Temple",
    deity: "Lord Shiva (First of Twelve Jyotirlingas)",
    location: "Prabhas Patan, Veraval, Gujarat",
    coordinates: { lat: 20.8880, lng: 70.4012 },
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    tagline: "The Eternal Shrine by the Arabian Sea",
    description: "Somnath is revered as the first amongst the twelve holy Jyotirlinga shrines of Lord Shiva. Perched on the Arabian Sea coast, the temple stands as a glorious testament to faith, having been reconstructed in grand Chalukya architecture with intricate stone carvings, the sacred Banstambh, and a timeless spiritual aura.",
    historicalSignificance: "Mentioned in the Rigveda and Skanda Purana, Somnath is known as the 'Shrine Eternal'. The current grand Kailash Mahameru Prasad temple was reconstructed under the vision of Sardar Vallabhbhai Patel and inaugurated by Dr. Rajendra Prasad in 1951.",
    timings: {
      darshanOpen: "06:00 AM",
      darshanClose: "10:00 PM",
      morningAarti: "07:00 AM",
      afternoonAarti: "12:00 PM",
      eveningAarti: "07:00 PM",
      soundAndLightShow: "08:00 PM - 09:00 PM"
    },
    liveStatus: {
      crowdLevel: "moderate", // "low", "moderate", "high", "critical"
      crowdPercentage: 58,
      estimatedWaitMinutes: 28,
      activePilgrimsInPremise: 3840,
      dailyCapacity: 65000,
      todayTotalVisitors: 32450,
      vipQueueWaitMinutes: 10,
      statusLabel: "Optimal Flow",
      statusColor: "emerald",
      peakHoursToday: "06:30 PM - 08:30 PM"
    },
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
    darshanSlots: [
      { id: "s-01", time: "06:30 AM - 08:00 AM", title: "Prabhat Darshan & Mangala Aarti", availableSlots: 120, totalSlots: 350, price: 0, vipPrice: 250 },
      { id: "s-02", time: "08:30 AM - 10:30 AM", title: "Morning Bilva Puja Slot", availableSlots: 85, totalSlots: 400, price: 0, vipPrice: 250 },
      { id: "s-03", time: "11:30 AM - 01:00 PM", title: "Madhyana Darshan & Rajbhog", availableSlots: 45, totalSlots: 400, price: 0, vipPrice: 250 },
      { id: "s-04", time: "04:00 PM - 06:00 PM", title: "Sayankal General Darshan", availableSlots: 180, totalSlots: 450, price: 0, vipPrice: 250 },
      { id: "s-05", time: "06:30 PM - 08:30 PM", title: "Maha Aarti & Deep Darshan", availableSlots: 15, totalSlots: 350, price: 0, vipPrice: 350 },
      { id: "s-06", time: "08:45 PM - 09:45 PM", title: "Shayan Aarti & Closing Darshan", availableSlots: 95, totalSlots: 300, price: 0, vipPrice: 250 }
    ],
    cctvCams: [
      { id: "cam-som-01", name: "Gate 1 Main Entry", count: 42, status: "Online", streamFps: 30 },
      { id: "cam-som-02", name: "Sabhamandap Queue", count: 86, status: "Online", streamFps: 30 },
      { id: "cam-som-03", name: "Garbhagriha Corridor", count: 34, status: "Online", streamFps: 30 },
      { id: "cam-som-04", name: "Seafront Exit Plaza", count: 28, status: "Online", streamFps: 30 }
    ]
  },
  {
    id: "dwarka",
    name: "Shree Dwarkadhish Temple",
    shortName: "Dwarkadhish (Jagat Mandir)",
    deity: "Lord Krishna (Dwarkanath / King of Dwarka)",
    location: "Dwarka, Devbhumi Dwarka, Gujarat",
    coordinates: { lat: 22.2376, lng: 68.9678 },
    image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
    tagline: "The Sacred Kingdom of Dwarkadhish & Char Dham Shrine",
    description: "Dwarkadhish Temple, also known as the Jagat Mandir, is one of the four holiest Char Dham pilgrimage sites of India. Situated at the holy confluence of the Gomti River and Arabian Sea, the 5-story spire rests on 72 magnificent carved pillars, flying the legendary 52-yard sacred Dhwaja (flag).",
    historicalSignificance: "Dating back over 2,200 years and traditionally founded by Vajranabha, Lord Krishna's great-grandson, the temple stands at the supreme seat of Krishna's golden kingdom. The 52-yard flag hoisted 5 times daily represents the 52 gates of ancient Dwarka.",
    timings: {
      darshanOpen: "06:30 AM",
      darshanClose: "09:30 PM",
      morningAarti: "07:00 AM (Mangala)",
      afternoonAarti: "12:30 PM (Shringar)",
      eveningAarti: "07:30 PM (Sandhya)",
      soundAndLightShow: "08:15 PM - 09:00 PM (Gomti Ghat)"
    },
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
    },
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
    darshanSlots: [
      { id: "d-01", time: "06:30 AM - 08:00 AM", title: "Mangala Aarti & Abhishekam", availableSlots: 40, totalSlots: 400, price: 0, vipPrice: 300 },
      { id: "d-02", time: "09:00 AM - 11:00 AM", title: "Snan & Shringar Bhog Darshan", availableSlots: 15, totalSlots: 450, price: 0, vipPrice: 300 },
      { id: "d-03", time: "11:30 AM - 01:00 PM", title: "Madhyana Gwal Bhog", availableSlots: 5, totalSlots: 450, price: 0, vipPrice: 350 },
      { id: "d-04", time: "05:00 PM - 07:00 PM", title: "Uthapan & Sandhya Darshan", availableSlots: 65, totalSlots: 450, price: 0, vipPrice: 300 },
      { id: "d-05", time: "07:30 PM - 09:00 PM", title: "Sandhya Aarti & Shayan Bhog", availableSlots: 22, totalSlots: 400, price: 0, vipPrice: 350 }
    ],
    cctvCams: [
      { id: "cam-dwk-01", name: "Moksha Dwaar Turnstiles", count: 94, status: "Online", streamFps: 30 },
      { id: "cam-dwk-02", name: "Jagat Mandir Outer Courtyard", count: 112, status: "Online", streamFps: 30 },
      { id: "cam-dwk-03", name: "Central Sanctum Queue", count: 78, status: "Online", streamFps: 30 },
      { id: "cam-dwk-04", name: "Gomti Ghat Confluence Stalls", count: 52, status: "Online", streamFps: 30 }
    ]
  },
  {
    id: "ambaji",
    name: "Shree Arasuri Ambaji Mata Temple",
    shortName: "Ambaji Shaktipeeth",
    deity: "Maa Amba (Principal 51 Shaktipeeth - Heart of Sati)",
    location: "Ambaji, Danta Taluka, Banaskantha, Gujarat",
    coordinates: { lat: 24.3314, lng: 72.8532 },
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1600&q=80",
    tagline: "Supreme Shaktipeeth of Gujarat on the Holy Arasur Hills",
    description: "Ambaji is one of the paramount 51 Shaktipeeths where the heart of Goddess Sati is believed to have fallen. Uniquely, the temple enshrines no idol, but instead venerates the divine sacred 'Viso Yantra' inscribed with Vedic mantras, adorned with pure gold and silver plating under a glittering 103-feet golden kalash.",
    historicalSignificance: "Nestled in the ancient Aravalli ranges near Gabbar Hill, Ambaji has been a supreme pilgrimage hub for centuries. Gabbar Hill houses the eternal Akhand Jyot and footprint impressions of the Goddess.",
    timings: {
      darshanOpen: "07:00 AM",
      darshanClose: "09:00 PM",
      morningAarti: "07:30 AM",
      afternoonAarti: "12:00 PM (Bhog)",
      eveningAarti: "07:00 PM",
      soundAndLightShow: "07:45 PM - 08:30 PM (Gabbar 3D Projection)"
    },
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
    },
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
    darshanSlots: [
      { id: "a-01", time: "07:30 AM - 09:30 AM", title: "Prabhat Mangala Darshan", availableSlots: 220, totalSlots: 350, price: 0, vipPrice: 200 },
      { id: "a-02", time: "10:00 AM - 11:30 AM", title: "Viso Yantra Shringar Puja", availableSlots: 180, totalSlots: 350, price: 0, vipPrice: 200 },
      { id: "a-03", time: "12:00 PM - 02:00 PM", title: "Rajbhog Aarti Darshan", availableSlots: 140, totalSlots: 350, price: 0, vipPrice: 200 },
      { id: "a-04", time: "04:30 PM - 06:30 PM", title: "Sayahna General Darshan", availableSlots: 260, totalSlots: 400, price: 0, vipPrice: 200 },
      { id: "a-05", time: "07:00 PM - 08:30 PM", title: "Maha Sandhya Aarti & Deepotsav", availableSlots: 85, totalSlots: 350, price: 0, vipPrice: 250 }
    ],
    cctvCams: [
      { id: "cam-amb-01", name: "Chachar Chowk Main Entrance", count: 28, status: "Online", streamFps: 30 },
      { id: "cam-amb-02", name: "Viso Yantra Sanctum Queue", count: 35, status: "Online", streamFps: 30 },
      { id: "cam-amb-03", name: "Mohanthal Prasad Distribution", count: 44, status: "Online", streamFps: 30 },
      { id: "cam-amb-04", name: "Gabbar Ropeway Terminal", count: 21, status: "Online", streamFps: 30 }
    ]
  },
  {
    id: "pavagadh",
    name: "Shree Mahakali Mata Temple",
    shortName: "Pavagadh Mahakali Mandir",
    deity: "Maa Mahakali (Supreme Shaktipeeth & UNESCO Hill Complex)",
    location: "Pavagadh Hill, Champaner, Panchmahal, Gujarat",
    coordinates: { lat: 22.4608, lng: 73.5244 },
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    bannerImage: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1600&q=80",
    tagline: "The Sacred High-Altitude Cliff Peak of Champaner-Pavagadh",
    description: "Rising 800 meters above the Champaner plains, the Shree Mahakali Temple crowns the summit of Pavagadh Hill. Recognized as a UNESCO World Heritage site cultural landscape, the temple recently restored its grand Dhwajarohan mast and expanded its hilltop parikrama path, accessed via modern ropeway and scenic stone stairways.",
    historicalSignificance: "Pavagadh translates to 'one quarter hill' (Pāvaka-gadha). Famous for its ancient fortifications dating back to the 8th century, sage Vishwamitra is believed to have performed severe penance here to invoke Goddess Mahakali.",
    timings: {
      darshanOpen: "05:30 AM",
      darshanClose: "08:30 PM",
      morningAarti: "06:00 AM",
      afternoonAarti: "12:30 PM",
      eveningAarti: "07:15 PM",
      ropewayTimings: "06:00 AM - 07:30 PM"
    },
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
    },
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
    darshanSlots: [
      { id: "p-01", time: "05:30 AM - 07:30 AM", title: "Dawn Mangala Aarti & Sunrise Darshan", availableSlots: 60, totalSlots: 350, price: 0, vipPrice: 200 },
      { id: "p-02", time: "08:00 AM - 10:30 AM", title: "Morning Peak Darshan", availableSlots: 25, totalSlots: 400, price: 0, vipPrice: 200 },
      { id: "p-03", time: "11:00 AM - 01:00 PM", title: "Midday Bhog & Shakti Darshan", availableSlots: 40, totalSlots: 350, price: 0, vipPrice: 200 },
      { id: "p-04", time: "03:30 PM - 05:30 PM", title: "Afternoon Ascent Darshan", availableSlots: 90, totalSlots: 400, price: 0, vipPrice: 200 },
      { id: "p-05", time: "06:00 PM - 08:00 PM", title: "Sandhya Maha Aarti & Sunset View", availableSlots: 35, totalSlots: 350, price: 0, vipPrice: 250 }
    ],
    cctvCams: [
      { id: "cam-pav-01", name: "Machi Ropeway Boarding Queue", count: 85, status: "Online", streamFps: 30 },
      { id: "cam-pav-02", name: "Summit Staircase Chokepoint", count: 68, status: "Online", streamFps: 30 },
      { id: "cam-pav-03", name: "Mahakali Altar Main Chamber", count: 46, status: "Online", streamFps: 30 },
      { id: "cam-pav-04", name: "Upper Parikrama Corridor", count: 38, status: "Online", streamFps: 30 }
    ]
  }
];


export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    return res.status(200).json({
      success: true,
      data: temples
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching temples'
    });
  }
}
