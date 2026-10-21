import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";
import Settings from "./models/Settings.js";

await connectDB();

const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 8) {
  console.error("Set ADMIN_PASSWORD (8+ characters) in .env first.");
  process.exit(1);
}

const existing = await Admin.findOne({ username });
if (existing) {
  console.log(`Admin "${username}" already exists. Use Settings > Password in the dashboard to change it.`);
} else {
  await Admin.create({ username, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Admin "${username}" created.`);
}

await Settings.findOneAndUpdate(
  { key: "main" },
  {
    $setOnInsert: {
      shopName: process.env.SHOP_NAME || "PC Shop",
      whatsappNumber: (process.env.SELLER_WHATSAPP || "").replace(/\D/g, ""),
    },
  },
  { upsert: true }
);

await mongoose.disconnect();
console.log("Seed done.");
