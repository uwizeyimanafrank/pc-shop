import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  state: { type: String, enum: ["closed", "open"], default: "closed" },
  type: { type: String, enum: ["side", "spin"], default: "side" },
  // For sides: front | right | back | left | top | bottom
  label: { type: String, default: "" },
  // For spin frames: the frame position (0..n)
  order: { type: Number, default: 0 },
  url: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    category: { type: String, enum: ["desktop", "laptop", "all-in-one", "other"], default: "desktop" },
    condition: { type: String, enum: ["new", "used", "refurbished"], default: "used" },
    status: { type: String, enum: ["available", "reserved", "sold"], default: "available" },
    price: { type: Number, required: true, min: 0 },
    negotiable: { type: Boolean, default: true },
    description: { type: String, default: "" },
    specs: {
      cpu: { type: String, default: "" },
      ram: { type: String, default: "" },
      storage: { type: String, default: "" },
      gpu: { type: String, default: "" },
      screen: { type: String, default: "" },
      os: { type: String, default: "" },
    },
    media: [mediaSchema],
    // Later: path/URL of a .glb file for the real 3D viewer
    model3d: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", description: "text" });

export default mongoose.model("Product", productSchema);
