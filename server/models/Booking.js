import mongoose from "mongoose";

const coPilgrimSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
  },
  { _id: false }
);

const prasadCartItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    templeId: { type: String, required: true, index: true },
    templeName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    slotId: { type: String, default: "s-01" },
    pilgrimCount: { type: Number, required: true, default: 1 },
    leadPilgrim: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      idType: { type: String, default: "Aadhaar Card" },
      idNumber: { type: String, default: "" },
      idProof: { type: String, default: "" },
    },
    coPilgrims: [coPilgrimSchema],
    facilities: [{ type: String }],
    specialQueue: { type: Boolean, default: false },
    specialAssistanceType: { type: String, default: "None" },
    prasadCart: [prasadCartItemSchema],
    vipPassFee: { type: Number, default: 0 },
    prasadTotal: { type: Number, default: 0 },
    amountPaid: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "confirmed",
      index: true,
    },
    paymentId: { type: String, default: "" },
    qrCodeData: { type: String, required: true },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
