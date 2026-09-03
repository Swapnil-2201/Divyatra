import mongoose from "mongoose";

const responseNoteSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const alertSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    templeId: { type: String, required: true, index: true },
    templeName: { type: String, required: true },
    zone: { type: String, default: "Main Premise" },
    title: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "CONGESTION_SURGE",
        "QUEUE_BOTTLENECK",
        "ANOMALOUS_MOVEMENT",
        "EMERGENCY_INCIDENT",
        "CROWD_SURGE",
        "WEATHER_ALERT",
        "SYSTEM",
        "STATUS_UPDATE",
      ],
      default: "CONGESTION_SURGE",
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "WARNING", "MEDIUM", "INFO"],
      default: "INFO",
    },
    description: { type: String, default: "" },
    message: { type: String, default: "" },
    recommendedAction: { type: String, default: "Monitor corridor flow" },
    actionRequired: { type: String, default: "Monitor corridor flow" },
    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED"],
      default: "ACTIVE",
    },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String, default: null },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    responseNotes: [responseNoteSchema],
    metrics: {
      currentDensity: { type: Number, default: 70 },
      threshold: { type: Number, default: 75 },
      estimatedClearanceMinutes: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

export const Alert =
  mongoose.models.Alert || mongoose.model("Alert", alertSchema);
