import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

const CONDITIONS = [
  ["", "All"],
  ["new", "New"],
  ["refurbished", "Refurbished"],
  ["used", "Used"],
];

export default function Shop() {
  const { settings } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .products({ search, condition, category, sort })
        .then((list) => { setProducts(list); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, condition, category, sort]);

  // Sold PCs go to the end of the list.
  const ordered = useMemo(
    () => [...products].sort((a, b) => Number(a.status === "sold") - Number(b.status === "sold")),
    [products]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-board sm:text-5xl">
          {settings.tagline || "Find your next computer."}
        </h1>
        <p className="mt-3 text-ink/70">
          Pick what you like, build a cart, and send it to the seller on WhatsApp. Prices can be discussed there.
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, brand or spec"
          className="w-full lg:max-w-sm"
          aria-label="Search computers"
        />
        <div className="flex flex-wrap gap-1 rounded-full border border-solder bg-paper p-1">
          {CONDITIONS.map(([value, label]) => (
            <button
              key={label}
              onClick={() => setCondition(value)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${condition === value ? "bg-board text-paper" : "hover:bg-solder/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto">
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Type">
            <option value="">All types</option>
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
            <option value="all-in-one">All-in-one</option>
            <option value="other">Other</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
      {loading && !products.length && <p className="py-16 text-center text-ink/60">Loading computers…</p>}
      {!loading && !error && !ordered.length && (
        <p className="py-16 text-center text-ink/60">No computers match this search. Try clearing a filter.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {ordered.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
