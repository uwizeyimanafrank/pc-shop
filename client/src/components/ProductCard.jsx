import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { assetUrl } from "../lib/api";
import { coverImage, money, specLine } from "../lib/format";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product, index = 0 }) {
  const { settings, addToCart } = useShop();
  const img = coverImage(product);
  const sold = product.status === "sold";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.35 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-solder bg-paper"
    >
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-solder/50">
        {img ? (
          <img
            src={assetUrl(img)}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${sold ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink/50">No photo yet</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="tag bg-paper text-ink capitalize">{product.condition}</span>
          {product.status !== "available" && <span className="tag bg-ink text-paper capitalize">{product.status}</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold leading-snug">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-ink/70">{specLine(product) || product.brand}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-xl font-bold text-board">{money(product.price, settings.currency)}</p>
            {product.negotiable && <span className="tag mt-1 bg-gold/30 text-ink">Price can be discussed</span>}
          </div>
          <button className="btn-primary" disabled={sold} onClick={() => addToCart(product)}>
            {sold ? "Sold" : "Add"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
