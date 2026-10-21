import mongoose from "mongoose";

// One single document holds the shop settings.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    shopName: { type: String, default: "PC Shop" },
    // International format, digits only. Example: 250780000000
    whatsappNumber: { type: String, default: "" },
    currency: { type: String, default: "RWF" },
    tagline: { type: String, default: "Quality computers, honest prices." },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
