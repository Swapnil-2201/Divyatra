import mongoose from "mongoose";

const prasadamSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    templeId: { type: String, required: true, index: true },
    templeName: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: String, default: "500g" },
    image: { type: String, default: "" },
    description: { type: String, required: true },
    itemsIncluded: [{ type: String }],
    shelfLife: { type: String, default: "30 Days" },
    pureGheeCertified: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
    speedPostAvailable: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const Prasadam =
  mongoose.models.Prasadam || mongoose.model("Prasadam", prasadamSchema);
