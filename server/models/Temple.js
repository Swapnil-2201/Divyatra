import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: "shield" },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const zoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    density: { type: Number, default: 50 },
    waitMinutes: { type: Number, default: 15 },
    status: { type: String, default: "Smooth" },
  },
  { _id: false }
);

const liveStatusSchema = new mongoose.Schema(
  {
    crowdLevel: { type: String, enum: ["low", "moderate", "high", "critical"], default: "moderate" },
    crowdPercentage: { type: Number, default: 50 },
    estimatedWaitMinutes: { type: Number, default: 25 },
    activePilgrimsInPremise: { type: Number, default: 3000 },
    dailyCapacity: { type: Number, default: 50000 },
    todayTotalVisitors: { type: Number, default: 20000 },
    vipQueueWaitMinutes: { type: Number, default: 10 },
    statusLabel: { type: String, default: "Optimal Flow" },
    statusColor: { type: String, default: "emerald" },
    peakHoursToday: { type: String, default: "06:00 PM - 08:30 PM" },
  },
  { _id: false }
);

const templeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    deity: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    tagline: { type: String, default: "" },
    description: { type: String, required: true },
    historicalSignificance: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    gallery: [{ type: String }],
    crowdLevel: { type: String, default: "moderate" },
    occupancy: { type: Number, default: 3000 },
    estimatedWait: { type: Number, default: 25 },
    nextAarti: { type: String, default: "07:00 PM (Sandhya Aarti)" },
    dailyCapacity: { type: Number, default: 50000 },
    officialWebsite: { type: String, default: "" },
    liveDarshan: {
      channelName: { type: String, default: "" },
      officialChannelUrl: { type: String, default: "" },
      isCurrentlyLive: { type: Boolean, default: false },
      aartiNote: { type: String, default: "" },
    },
    weather: {
      temp: { type: Number, default: 28 },
      condition: { type: String, default: "Pleasant" },
      humidity: { type: String, default: "60%" },
      windSpeed: { type: String, default: "15 km/h" },
      icon: { type: String, default: "sun" },
    },
    facilities: [facilitySchema],
    zones: [zoneSchema],
    cctvCams: [
      {
        id: { type: String },
        name: { type: String },
        count: { type: Number },
        status: { type: String, default: "Online" },
        streamFps: { type: Number, default: 30 },
      },
    ],
    liveStatus: liveStatusSchema,
  },
  { timestamps: true }
);

export const Temple = mongoose.models.Temple || mongoose.model("Temple", templeSchema);
