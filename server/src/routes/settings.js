import { Router } from "express";
import Settings from "../models/Settings.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

async function getSettings() {
  return (await Settings.findOne({ key: "main" })) || (await Settings.create({ key: "main" }));
}

// Public: the client needs the WhatsApp number and shop name.
router.get("/", async (_req, res) => {
  res.json(await getSettings());
});

router.put("/", requireAdmin, async (req, res) => {
  const { shopName, whatsappNumber, currency, tagline } = req.body;
  const settings = await getSettings();
  if (shopName !== undefined) settings.shopName = String(shopName).trim();
  if (whatsappNumber !== undefined) settings.whatsappNumber = String(whatsappNumber).replace(/\D/g, "");
  if (currency !== undefined) settings.currency = String(currency).trim();
  if (tagline !== undefined) settings.tagline = String(tagline).trim();
  await settings.save();
  res.json(settings);
});

export default router;
