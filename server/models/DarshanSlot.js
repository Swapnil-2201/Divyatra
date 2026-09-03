import mongoose from "mongoose";

const darshanSlotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    templeId: { type: String, required: true, index: true },
    time: { type: String, required: true },
    title: { type: String, required: true },
    availableSlots: { type: Number, required: true, default: 100 },
    totalSlots: { type: Number, required: true, default: 350 },
    price: { type: Number, default: 0 },
    vipPrice: { type: Number, default: 250 },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

export const DarshanSlot =
  mongoose.models.DarshanSlot || mongoose.model("DarshanSlot", darshanSlotSchema);
