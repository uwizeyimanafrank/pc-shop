import "express-async-errors";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import settingsRoutes from "./routes/settings.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || true }));
app.use(express.json({ limit: "1mb" }));

// Images are fixed files with unique names, so they can be cached for a long time.
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "30d", immutable: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = ["ValidationError", "MulterError", "CastError"].includes(err.name) ? 400 : err.status || 500;
  res.status(status).json({ message: err.message || "Something went wrong." });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch((e) => {
    console.error("Could not start:", e.message);
    process.exit(1);
  });
