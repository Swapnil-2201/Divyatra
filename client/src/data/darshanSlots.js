/**
 * @file darshanSlots.js
 * @description Centralized Darshan Slot quotas and timing schedules for all 4 pilgrimage sites.
 *
 * @typedef {Object} DarshanSlot
 * @property {string} id - Unique identifier for the slot
 * @property {string} templeId - ID of the temple
 * @property {string} time - Time window of the darshan slot
 * @property {string} title - Descriptive title of the puja / darshan
 * @property {number} availableSlots - Currently remaining free quota
 * @property {number} totalSlots - Total slot capacity
 * @property {number} price - Standard general darshan price (usually 0)
 * @property {number} vipPrice - Fast-track VIP / Special entry donation fee (INR)
 * @property {string} [category] - General, Aarti, Abhishekam, or Night Shayan
 */

export const DARSHAN_SLOTS = {
  somnath: [
    {
      id: "s-01",
      templeId: "somnath",
      time: "06:30 AM - 08:00 AM",
      title: "Prabhat Darshan & Mangala Aarti",
      availableSlots: 120,
      totalSlots: 350,
      price: 0,
      vipPrice: 250,
      category: "Aarti"
    },
    {
      id: "s-02",
      templeId: "somnath",
      time: "08:30 AM - 10:30 AM",
      title: "Morning Bilva Puja Slot",
      availableSlots: 85,
      totalSlots: 400,
      price: 0,
      vipPrice: 250,
      category: "Puja"
    },
    {
      id: "s-03",
      templeId: "somnath",
      time: "11:30 AM - 01:00 PM",
      title: "Madhyana Darshan & Rajbhog",
      availableSlots: 45,
      totalSlots: 400,
      price: 0,
      vipPrice: 250,
      category: "General"
    },
    {
      id: "s-04",
      templeId: "somnath",
      time: "04:00 PM - 06:00 PM",
      title: "Sayankal General Darshan",
      availableSlots: 180,
      totalSlots: 450,
      price: 0,
      vipPrice: 250,
      category: "General"
    },
    {
      id: "s-05",
      templeId: "somnath",
      time: "06:30 PM - 08:30 PM",
      title: "Maha Aarti & Deep Darshan",
      availableSlots: 15,
      totalSlots: 350,
      price: 0,
      vipPrice: 350,
      category: "Aarti"
    },
    {
      id: "s-06",
      templeId: "somnath",
      time: "08:45 PM - 09:45 PM",
      title: "Shayan Aarti & Closing Darshan",
      availableSlots: 95,
      totalSlots: 300,
      price: 0,
      vipPrice: 250,
      category: "Night"
    }
  ],

  dwarka: [
    {
      id: "d-01",
      templeId: "dwarka",
      time: "06:30 AM - 08:00 AM",
      title: "Mangala Aarti & Abhishekam",
      availableSlots: 40,
      totalSlots: 400,
      price: 0,
      vipPrice: 300,
      category: "Aarti"
    },
    {
      id: "d-02",
      templeId: "dwarka",
      time: "09:00 AM - 11:00 AM",
      title: "Snan & Shringar Bhog Darshan",
      availableSlots: 15,
      totalSlots: 450,
      price: 0,
      vipPrice: 300,
      category: "General"
    },
    {
      id: "d-03",
      templeId: "dwarka",
      time: "11:30 AM - 01:00 PM",
      title: "Madhyana Gwal Bhog",
      availableSlots: 5,
      totalSlots: 450,
      price: 0,
      vipPrice: 350,
      category: "Bhog"
    },
    {
      id: "d-04",
      templeId: "dwarka",
      time: "05:00 PM - 07:00 PM",
      title: "Uthapan & Sandhya Darshan",
      availableSlots: 65,
      totalSlots: 450,
      price: 0,
      vipPrice: 300,
      category: "General"
    },
    {
      id: "d-05",
      templeId: "dwarka",
      time: "07:30 PM - 09:00 PM",
      title: "Sandhya Aarti & Shayan Bhog",
      availableSlots: 22,
      totalSlots: 400,
      price: 0,
      vipPrice: 350,
      category: "Aarti"
    }
  ],

  ambaji: [
    {
      id: "a-01",
      templeId: "ambaji",
      time: "07:30 AM - 09:30 AM",
      title: "Prabhat Mangala Darshan",
      availableSlots: 220,
      totalSlots: 350,
      price: 0,
      vipPrice: 200,
      category: "Aarti"
    },
    {
      id: "a-02",
      templeId: "ambaji",
      time: "10:00 AM - 11:30 AM",
      title: "Viso Yantra Shringar Puja",
      availableSlots: 180,
      totalSlots: 350,
      price: 0,
      vipPrice: 200,
      category: "Puja"
    },
    {
      id: "a-03",
      templeId: "ambaji",
      time: "12:00 PM - 02:00 PM",
      title: "Rajbhog Aarti Darshan",
      availableSlots: 140,
      totalSlots: 350,
      price: 0,
      vipPrice: 200,
      category: "Bhog"
    },
    {
      id: "a-04",
      templeId: "ambaji",
      time: "04:30 PM - 06:30 PM",
      title: "Sayahna General Darshan",
      availableSlots: 260,
      totalSlots: 400,
      price: 0,
      vipPrice: 200,
      category: "General"
    },
    {
      id: "a-05",
      templeId: "ambaji",
      time: "07:00 PM - 08:30 PM",
      title: "Maha Sandhya Aarti & Deepotsav",
      availableSlots: 85,
      totalSlots: 350,
      price: 0,
      vipPrice: 250,
      category: "Aarti"
    }
  ],

  pavagadh: [
    {
      id: "p-01",
      templeId: "pavagadh",
      time: "05:30 AM - 07:30 AM",
      title: "Dawn Mangala Aarti & Sunrise Darshan",
      availableSlots: 60,
      totalSlots: 350,
      price: 0,
      vipPrice: 200,
      category: "Aarti"
    },
    {
      id: "p-02",
      templeId: "pavagadh",
      time: "08:00 AM - 10:30 AM",
      title: "Morning Peak Darshan",
      availableSlots: 25,
      totalSlots: 400,
      price: 0,
      vipPrice: 200,
      category: "General"
    },
    {
      id: "p-03",
      templeId: "pavagadh",
      time: "11:00 AM - 01:00 PM",
      title: "Midday Bhog & Shakti Darshan",
      availableSlots: 40,
      totalSlots: 350,
      price: 0,
      vipPrice: 200,
      category: "Bhog"
    },
    {
      id: "p-04",
      templeId: "pavagadh",
      time: "03:30 PM - 05:30 PM",
      title: "Afternoon Ascent Darshan",
      availableSlots: 90,
      totalSlots: 400,
      price: 0,
      vipPrice: 200,
      category: "General"
    },
    {
      id: "p-05",
      templeId: "pavagadh",
      time: "06:00 PM - 08:00 PM",
      title: "Sandhya Maha Aarti & Sunset View",
      availableSlots: 35,
      totalSlots: 350,
      price: 0,
      vipPrice: 250,
      category: "Aarti"
    }
  ]
};

/**
 * Get slots for a specific temple
 * @param {string} templeId
 * @returns {DarshanSlot[]}
 */
export const getSlotsByTempleId = (templeId) => {
  return DARSHAN_SLOTS[templeId.toLowerCase()] || [];
};
