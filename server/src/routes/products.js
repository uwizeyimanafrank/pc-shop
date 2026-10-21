import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload, saveImage, deleteImage } from "../middleware/upload.js";

const router = Router();

const SIDE_LABELS = ["front", "right", "back", "left", "top", "bottom"];

const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found." });
  next();
};

// Only allow fields we expect (stops people from injecting random data).
function pickProductFields(body) {
  const out = {};
  for (const k of ["name", "brand", "category", "condition", "status", "description", "model3d"]) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (body.price !== undefined) out.price = Number(body.price);
  if (body.negotiable !== undefined) out.negotiable = Boolean(body.negotiable);
  if (body.specs && typeof body.specs === "object") {
    out.specs = {};
    for (const k of ["cpu", "ram", "storage", "gpu", "screen", "os"]) out.specs[k] = body.specs[k] ?? "";
  }
  return out;
}

// ---------- Public ----------
router.get("/", async (req, res) => {
  const { search, condition, category, status, minPrice, maxPrice, sort = "newest" } = req.query;
  const filter = {};
  if (search) filter.$text = { $search: String(search) };
  if (condition) filter.condition = condition;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  const sorts = { newest: { createdAt: -1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 } };
  const products = await Product.find(filter).sort(sorts[sort] || sorts.newest);
  res.json(products);
});

router.get("/:id", validId, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json(product);
});

// ---------- Admin ----------
router.post("/", requireAdmin, async (req, res) => {
  const product = await Product.create(pickProductFields(req.body));
  res.status(201).json(product);
});

router.put("/:id", requireAdmin, validId, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pickProductFields(req.body), {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json(product);
});

router.delete("/:id", requireAdmin, validId, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  product.media.forEach((m) => deleteImage(m.url));
  res.json({ message: "Product deleted." });
});

/**
 * Upload images.
 * body: state = closed|open, type = side|spin, label = front|right|... (sides only)
 * files: field "files"
 *  - side: replaces the existing image with the same state + label
 *  - spin: replaces the whole spin set for that state (frames ordered by file name)
 */
router.post("/:id/media", requireAdmin, validId, upload.array("files", 72), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const state = req.body.state === "open" ? "open" : "closed";
  const type = req.body.type === "spin" ? "spin" : "side";
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ message: "Choose at least one image." });

  let toRemove = [];
  const added = [];

  if (type === "side") {
    const label = String(req.body.label || "").toLowerCase();
    if (!SIDE_LABELS.includes(label)) return res.status(400).json({ message: `Label must be one of: ${SIDE_LABELS.join(", ")}.` });
    toRemove = product.media.filter((m) => m.type === "side" && m.state === state && m.label === label);
    const url = await saveImage(files[0].buffer, { width: 1400 });
    added.push({ state, type, label, order: SIDE_LABELS.indexOf(label), url });
  } else {
    if (files.length < 8) return res.status(400).json({ message: "A 360° spin needs at least 8 photos (24 is ideal)." });
    toRemove = product.media.filter((m) => m.type === "spin" && m.state === state);
    const sorted = [...files].sort((a, b) =>
      a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
    );
    for (let i = 0; i < sorted.length; i++) {
      const url = await saveImage(sorted[i].buffer, { width: 900 });
      added.push({ state, type, label: "", order: i, url });
    }
  }

  const removeIds = new Set(toRemove.map((m) => String(m._id)));
  product.media = product.media.filter((m) => !removeIds.has(String(m._id)));
  product.media.push(...added);
  await product.save();
  toRemove.forEach((m) => deleteImage(m.url));

  res.status(201).json(product);
});

router.delete("/:id/media", requireAdmin, validId, async (req, res) => {
  // Delete one image (?mediaId=) or a whole spin set (?state=open&type=spin)
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const { mediaId, state, type } = req.query;
  const doomed = product.media.filter((m) =>
    mediaId ? String(m._id) === mediaId : m.state === state && m.type === type
  );
  if (!doomed.length) return res.status(404).json({ message: "Nothing to delete." });

  const ids = new Set(doomed.map((m) => String(m._id)));
  product.media = product.media.filter((m) => !ids.has(String(m._id)));
  await product.save();
  doomed.forEach((m) => deleteImage(m.url));
  res.json(product);
});

export default router;
