import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Admin from "../models/Admin.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { username = "", password = "" } = req.body;
  const admin = await Admin.findOne({ username: username.trim().toLowerCase() });
  const ok = admin && (await bcrypt.compare(password, admin.passwordHash));
  if (!ok) return res.status(401).json({ message: "Wrong username or password." });

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, username: admin.username });
});

router.get("/me", requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select("username");
  if (!admin) return res.status(401).json({ message: "Account not found." });
  res.json({ username: admin.username });
});

router.put("/password", requireAdmin, async (req, res) => {
  const { currentPassword = "", newPassword = "" } = req.body;
  if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters." });
  const admin = await Admin.findById(req.adminId);
  if (!(await bcrypt.compare(currentPassword, admin.passwordHash)))
    return res.status(400).json({ message: "Current password is wrong." });
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();
  res.json({ message: "Password updated." });
});

export default router;
