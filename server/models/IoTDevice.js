import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    templeId: { type: String, default: "somnath" },
    templeName: { type: String, default: "Shree Somnath Jyotirlinga" },
    zone: { type: String, default: "Sanctum Courtyard" },
    gate: { type: String, default: "Gate 1 Turnstile" },
    coordinates: {
      lat: { type: Number, default: 20.888 },
      lng: { type: Number, default: 70.401 },
    },
  },
  { _id: false }
);

const currentPassSchema = new mongoose.Schema(
  {
    bookingId: { type: String, default: "" },
    templeId: { type: String, default: "" },
    templeName: { type: String, default: "" },
    date: { type: String, default: "" },
    slot: { type: String, default: "" },
    pilgrims: { type: Number, default: 1 },
    leadPilgrim: { type: String, default: "" },
    status: { type: String, default: "ISSUED" }, // ISSUED | ACTIVE | EXPIRED
    qrPayload: { type: String, default: "" },
    issuedAt: { type: String, default: "" },
    acknowledgedAt: { type: String, default: null },
  },
  { _id: false }
);

const emergencyStatusSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: false },
    type: { type: String, default: "NONE" }, // MEDICAL | CROWD | SOS | NONE
    timestamp: { type: String, default: null },
    details: { type: String, default: "" },
    incidentId: { type: String, default: "" },
  },
  { _id: false }
);

const iotNotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, default: "INFO" }, // PASS_ISSUED | CROWD_ALERT | DARSHAN_REMINDER | EMERGENCY
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    read: { type: Boolean, default: false },
  },
  { _id: false }
);

const iotEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    time: { type: String, required: true },
    event: { type: String, required: true },
    type: { type: String, default: "SYSTEM" }, // CONNECT | PASS | QR | ACK | CROWD | HEALTH | EMERGENCY
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const iotDeviceSchema = new mongoose.Schema(
  {
    bandId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: "DV-BAND-0001",
    },
    userId: { type: String, default: null, index: true },
    bookingId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ["CONNECTED", "STANDBY", "ACTIVE", "DISCONNECTED", "ALERT"],
      default: "CONNECTED",
      index: true,
    },
    battery: { type: Number, default: 87 },
    signalStrength: { type: String, default: "Strong" },
    location: { type: locationSchema, default: () => ({}) },
    heartRate: { type: Number, default: 76 },
    stressLevel: { type: String, default: "Normal" },
    temperature: { type: Number, default: 36.8 },
    lastSeen: { type: Date, default: Date.now },
    currentPass: { type: currentPassSchema, default: null },
    emergencyStatus: { type: emergencyStatusSchema, default: () => ({}) },
    notifications: [iotNotificationSchema],
    events: [iotEventSchema],
  },
  { timestamps: true }
);

export const IoTDevice =
  mongoose.models.IoTDevice || mongoose.model("IoTDevice", iotDeviceSchema);
