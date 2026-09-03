/**
 * @file bookings.js
 * @description Centralized Booking models, sample passes, and pass validation schemas.
 *
 * @typedef {Object} LeadPilgrim
 * @property {string} name - Full name
 * @property {string} phone - Mobile contact
 * @property {string} [email] - Email address
 * @property {string} [idType] - 'Aadhaar Card' | 'Passport' | 'Voter ID' | 'Driving License'
 * @property {string} [idNumber] - ID number
 */

export const INITIAL_DRAFT_BOOKING = {
  templeId: 'somnath',
  templeName: 'Shree Somnath Jyotirlinga',
  date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  timeSlot: '06:30 AM - 08:00 AM (Prabhat Aarti)',
  slotId: 's-01',
  pilgrimCount: 2,
  leadPilgrim: {
    name: 'Ramesh Patel',
    phone: '+91 98250 12345',
    email: 'ramesh.patel@example.com',
    idType: 'Aadhaar Card',
    idNumber: 'XXXX-XXXX-8842'
  },
  coPilgrims: [
    { name: 'Pooja Patel', age: 34, gender: 'Female' }
  ],
  specialQueue: false, // Senior / Divyangjan
  specialAssistanceType: 'None',
  prasadCart: [],
  vipPassFee: 0,
  prasadTotal: 0,
  totalAmount: 0
};

export const INITIAL_CONFIRMED_PASSES = [
  {
    id: "BK-SOM-7821",
    bookingId: "BK-SOM-7821",
    templeId: "somnath",
    templeName: "Shree Somnath Jyotirlinga",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: "06:30 AM - 08:00 AM (Prabhat Aarti)",
    pilgrimCount: 2,
    leadPilgrim: {
      name: "Ramesh Patel",
      phone: "+91 98250 12345",
      email: "ramesh.patel@example.com",
      idProof: "Aadhaar Card XXXX-8842"
    },
    specialQueue: false,
    prasadCount: 1,
    prasadName: "Shree Somnath Mahaprasad Box",
    amountPaid: 350,
    status: "CONFIRMED",
    paymentId: "pay_RZP_SOMNATH_9921",
    qrCodeData: "DIVYATRA:SOMNATH:BK-SOM-7821:RAMESH_PATEL:2PAX:VERIFIED",
    createdAt: new Date().toISOString()
  }
];
