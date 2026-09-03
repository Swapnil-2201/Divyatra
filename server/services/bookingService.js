import { Booking } from "../models/Booking.js";
import { isDatabaseConnected } from "../config/db.js";
import { templeService } from "./templeService.js";

const inMemoryBookings = [
  {
    bookingId: "BK-SOM-8808",
    userId: "usr-demo-pilgrim",
    templeId: "somnath",
    templeName: "Shree Somnath Jyotirlinga",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: "06:30 AM - 08:00 AM (Prabhat Aarti)",
    slotId: "s-01",
    pilgrimCount: 2,
    leadPilgrim: {
      name: "Ramesh Patel",
      phone: "+91 98250 12345",
      email: "pilgrim@divyatra.in",
      idType: "Aadhaar Card",
      idNumber: "XXXX-XXXX-8842",
      idProof: "Aadhaar Card",
    },
    coPilgrims: [{ name: "Pooja Patel", age: 34, gender: "Female" }],
    facilities: ["Wheelchair Assistance", "Shoe Locker #42"],
    specialQueue: false,
    prasadCart: [
      { id: "som-1", name: "Shree Somnath Mahaprasad Box", price: 250, quantity: 2 }
    ],
    vipPassFee: 0,
    prasadTotal: 500,
    amountPaid: 500,
    status: "confirmed",
    paymentId: "pay_DEMO_01",
    qrCodeData: JSON.stringify({
      bookingId: "BK-SOM-8808",
      temple: "Shree Somnath Jyotirlinga",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      slot: "06:30 AM - 08:00 AM (Prabhat Aarti)",
      pilgrims: 2,
      leadPilgrim: "Ramesh Patel",
      status: "confirmed",
      verificationUrl: "https://divyatra.in/confirmation?id=BK-SOM-8808",
    }),
    createdAt: new Date().toISOString(),
  },
];

export const bookingService = {
  /**
   * Create new Darshan Pass booking
   */
  async createBooking(data) {
    const templeObj = await templeService.getTempleById(data.templeId || "somnath");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const templeCode = (data.templeId || "SOM").toUpperCase().slice(0, 3);
    const bookingId = `BK-${templeCode}-${randomSuffix}`;
    const leadName = data.leadPilgrim?.name || "Devotee";
    const templeName = data.templeName || templeObj?.name || "Shree Somnath Jyotirlinga";
    const date = data.date || new Date().toISOString().split("T")[0];
    const timeSlot = data.timeSlot || "06:30 AM - 08:00 AM (Prabhat Aarti)";
    const pilgrimCount = Number(data.pilgrimCount) || 1;
    const status = data.status || "confirmed";

    // Generate Scannable QR Payload containing required items
    const qrPayloadObj = {
      bookingId,
      temple: templeName,
      date,
      slot: timeSlot,
      pilgrims: pilgrimCount,
      leadPilgrim: leadName,
      status,
      timestamp: new Date().toISOString(),
      gatePassCode: `DY-${templeCode}-${Date.now().toString(36).toUpperCase()}`,
    };
    const qrCodeData = JSON.stringify(qrPayloadObj);

    const bookingDoc = {
      bookingId,
      userId: data.userId || null,
      templeId: data.templeId || "somnath",
      templeName,
      date,
      timeSlot,
      slotId: data.slotId || "s-01",
      pilgrimCount,
      leadPilgrim: {
        name: leadName,
        phone: data.leadPilgrim?.phone || "+91 98765 43210",
        email: data.leadPilgrim?.email || "",
        idType: data.leadPilgrim?.idType || "Aadhaar Card",
        idNumber: data.leadPilgrim?.idNumber || "",
        idProof: data.leadPilgrim?.idProof || data.leadPilgrim?.idType || "Aadhaar Card",
      },
      coPilgrims: data.coPilgrims || [],
      facilities: data.facilities || [],
      specialQueue: Boolean(data.specialQueue),
      specialAssistanceType: data.specialAssistanceType || "None",
      prasadCart: data.prasadCart || [],
      vipPassFee: data.vipPassFee || 0,
      prasadTotal: data.prasadTotal || 0,
      amountPaid: data.totalAmount ?? data.amountPaid ?? 0,
      status,
      paymentId: data.paymentId || `pay_DEMO_${Date.now()}`,
      qrCodeData,
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        const created = await Booking.create(bookingDoc);
        return created.toObject();
      } catch (err) {
        console.warn("⚠️ Mongoose booking write fallback to memory:", err.message);
      }
    }

    inMemoryBookings.unshift(bookingDoc);
    return bookingDoc;
  },

  /**
   * Retrieve single booking pass by ID
   */
  async getBookingById(id) {
    if (!id) return null;
    if (isDatabaseConnected()) {
      const found = await Booking.findOne({
        $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      }).lean();
      if (found) return found;
    }
    return (
      inMemoryBookings.find((b) => b.bookingId === id || b.id === id) || inMemoryBookings[0]
    );
  },

  /**
   * Retrieve booking history for authenticated user
   */
  async getUserBookings(userId, email = "") {
    if (isDatabaseConnected()) {
      const filter = {};
      if (userId && email) {
        filter.$or = [{ userId }, { "leadPilgrim.email": email.toLowerCase() }];
      } else if (userId) {
        filter.userId = userId;
      } else if (email) {
        filter["leadPilgrim.email"] = email.toLowerCase();
      }
      const list = await Booking.find(filter).sort({ createdAt: -1 }).lean();
      return list;
    }

    return inMemoryBookings.filter(
      (b) =>
        !userId ||
        b.userId === userId ||
        (email && b.leadPilgrim?.email?.toLowerCase() === email.toLowerCase())
    );
  },

  /**
   * Retrieve all bookings (Authority & Admin view)
   */
  async getAllBookings(templeId = null) {
    if (isDatabaseConnected()) {
      const filter = templeId ? { templeId } : {};
      return Booking.find(filter).sort({ createdAt: -1 }).lean();
    }

    if (templeId) {
      return inMemoryBookings.filter((b) => b.templeId === templeId);
    }
    return inMemoryBookings;
  },

  /**
   * Update booking status (pending | confirmed | cancelled | completed)
   */
  async updateBookingStatus(bookingId, status) {
    if (isDatabaseConnected()) {
      const updated = await Booking.findOneAndUpdate(
        { bookingId },
        { $set: { status } },
        { new: true }
      ).lean();
      if (updated) return updated;
    }

    const item = inMemoryBookings.find((b) => b.bookingId === bookingId);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  },
};
