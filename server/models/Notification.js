import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    bookingId: { type: String, default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["booking", "darshan", "crowd", "emergency", "system"],
      default: "system",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
    },
    read: { type: Boolean, default: false },
    actionUrl: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    templeId: { type: String, default: "all" },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
