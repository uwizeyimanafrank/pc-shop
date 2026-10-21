import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { money, productWhatsAppLink } from "../lib/format";
import { useShop } from "../context/ShopContext";
import ProductViewer from "../components/ProductViewer";

const SPEC_LABELS = [
  ["cpu", "Processor"],
  ["ram", "Memory"],
  ["storage", "Storage"],
  ["gpu", "Graphics"],
  ["screen", "Screen"],
  ["os", "System"],
];

export default function Product() {
  const { id } = useParams();
  const { settings, addToCart } = useShop();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    api.product(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4">{error}</p>
        <Link to="/" className="btn-dark">Back to the shop</Link>
      </div>
    );
  if (!product) return <p className="py-24 text-center text-ink/60">Loading…</p>;

  const sold = product.status === "sold";
  const specs = SPEC_LABELS.filter(([k]) => product.specs?.[k]);
  const canWhatsApp = Boolean(settings.whatsappNumber);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/" className="mb-4 inline-block text-sm font-medium text-ink/70 hover:text-ink">‹ All computers</Link>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductViewer media={product.media} name={product.name} />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="tag bg-board text-paper capitalize">{product.condition}</span>
            <span className="tag bg-solder text-ink capitalize">{product.category}</span>
            {product.status !== "available" && <span className="tag bg-ink text-paper capitalize">{product.status}</span>}
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          {product.brand && <p className="mt-1 text-ink/70">{product.brand}</p>}

          <p className="mt-5 font-display text-3xl font-bold text-board">{money(product.price, settings.currency)}</p>
          {product.negotiable && <p className="mt-1 text-sm text-ink/70">The seller is open to discussing the price on WhatsApp.</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" disabled={sold} onClick={() => addToCart(product)}>
              {sold ? "Sold" : "Add to cart"}
            </button>
            <a
              className={`btn-ghost ${!canWhatsApp ? "pointer-events-none opacity-50" : ""}`}
              href={canWhatsApp ? productWhatsAppLink({ phone: settings.whatsappNumber, shopName: settings.shopName, product, currency: settings.currency }) : undefined}
              target="_blank"
              rel="noreferrer"
            >
              Ask about this PC on WhatsApp
            </a>
          </div>

          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-solder border-y border-solder">
              {specs.map(([k, label]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-3 text-sm">
                  <dt className="text-ink/60">{label}</dt>
                  <dd className="font-medium">{product.specs[k]}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.description && <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed text-ink/80">{product.description}</p>}
        </div>
      </div>
    </div>
  );
}
