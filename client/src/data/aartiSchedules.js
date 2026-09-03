/**
 * @file aartiSchedules.js
 * @description Centralized daily Aarti, Puja, and light & sound schedules for all 4 temples.
 *
 * @typedef {Object} AartiTiming
 * @property {string} name - Name of the Aarti / Ritual
 * @property {string} time - Exact schedule time
 * @property {string} description - Significance and deity ritual note
 */

export const AARTI_SCHEDULES = {
  somnath: {
    templeId: "somnath",
    darshanOpen: "06:00 AM",
    darshanClose: "10:00 PM",
    morningAarti: "07:00 AM (Prabhat Mangala)",
    afternoonAarti: "12:00 PM (Madhyana Bhog)",
    eveningAarti: "07:00 PM (Sandhya Maha Aarti)",
    nightAarti: "09:30 PM (Shayan Aarti)",
    soundAndLightShow: "08:00 PM - 09:00 PM (Jay Somnath Sound & Light)",
    rituals: [
      { name: "Prabhat Mangala Aarti", time: "07:00 AM", description: "First morning darshan with holy Vedic chanting and conch resonance." },
      { name: "Bilva Patra & Gangajal Abhishekam", time: "09:30 AM", description: "Sacred offering of fresh Bilva leaves over the Jyotirlinga." },
      { name: "Madhyana Rajbhog Aarti", time: "12:00 PM", description: "Midday royal feast offering to Lord Someshwar." },
      { name: "Sandhya Deepotsav & Maha Aarti", time: "07:00 PM", description: "Evening grand 108-lamp Aarti facing the Arabian Sea." },
      { name: "Shayan Aarti", time: "09:30 PM", description: "Final night ritual and temple sanctum closure." }
    ]
  },

  dwarka: {
    templeId: "dwarka",
    darshanOpen: "06:30 AM",
    darshanClose: "09:30 PM",
    morningAarti: "07:00 AM (Mangala Aarti)",
    afternoonAarti: "12:30 PM (Shringar Bhog)",
    eveningAarti: "07:30 PM (Sandhya Aarti)",
    nightAarti: "09:00 PM (Shayan Bhog Aarti)",
    soundAndLightShow: "08:15 PM - 09:00 PM (Gomti Ghat)",
    rituals: [
      { name: "Mangala Aarti", time: "07:00 AM", description: "Awakening of the King of Dwarka with Gomti holy teerth." },
      { name: "Shringar Darshan & Abhishekam", time: "10:30 AM", description: "Lord Krishna adorned in silk pitambar and gold mukut." },
      { name: "Rajbhog Feast", time: "12:30 PM", description: "Grand 56-Bhog royal offerings in the Jagat Mandir sanctum." },
      { name: "Sandhya Maha Aarti", time: "07:30 PM", description: "Evening twilight Aarti with Tulsi incense." },
      { name: "Shayan Aarti", time: "09:00 PM", description: "Night resting ritual and closure of Moksha Dwaar." }
    ]
  },

  ambaji: {
    templeId: "ambaji",
    darshanOpen: "07:00 AM",
    darshanClose: "09:00 PM",
    morningAarti: "07:30 AM (Mangala)",
    afternoonAarti: "12:00 PM (Rajbhog)",
    eveningAarti: "07:00 PM (Sandhya Maha Aarti)",
    nightAarti: "08:45 PM (Shayan)",
    soundAndLightShow: "07:45 PM - 08:30 PM (Gabbar 3D Projection Mapping)",
    rituals: [
      { name: "Prabhat Mangala Aarti", time: "07:30 AM", description: "Morning divine lighting of the sacred Viso Yantra." },
      { name: "Viso Yantra Shringar Puja", time: "10:00 AM", description: "Adorning the sacred golden altar with fresh flower malas and chundadi." },
      { name: "Rajbhog Offering", time: "12:00 PM", description: "Noon offering of pure Gir cow ghee Mohanthal." },
      { name: "Maha Sandhya Aarti & Deepotsav", time: "07:00 PM", description: "Evening spectacle of 1001 oil lamps across Chachar Chowk." },
      { name: "Shayan Aarti", time: "08:45 PM", description: "Night resting prayers for Goddess Amba." }
    ]
  },

  pavagadh: {
    templeId: "pavagadh",
    darshanOpen: "05:30 AM",
    darshanClose: "08:30 PM",
    morningAarti: "06:00 AM (Mangala)",
    afternoonAarti: "12:30 PM (Bhog)",
    eveningAarti: "07:15 PM (Sandhya Aarti)",
    nightAarti: "08:15 PM (Shayan)",
    ropewayTimings: "06:00 AM - 07:30 PM (Machi Base to Summit)",
    rituals: [
      { name: "Dawn Mangala Aarti", time: "06:00 AM", description: "Sunrise Shakti prayer at the 800m summit peak." },
      { name: "Chunari & Kumkum Puja", time: "09:30 AM", description: "Consecration of red silk chunaris for devotees." },
      { name: "Midday Bhog Aarti", time: "12:30 PM", description: "Offering of pure ghee sukhadi and roasted makhana." },
      { name: "Sandhya Maha Aarti", time: "07:15 PM", description: "Sunset twilight worship with scenic hilltop vista." },
      { name: "Shayan Darshan", time: "08:15 PM", description: "Final temple closure before hill descent." }
    ]
  }
};

/**
 * Helper to fetch aarti schedule for a temple
 * @param {string} templeId
 */
export const getAartiScheduleByTempleId = (templeId) => {
  return AARTI_SCHEDULES[templeId.toLowerCase()] || AARTI_SCHEDULES.somnath;
};
