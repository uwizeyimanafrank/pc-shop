import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api, assetUrl } from "../../lib/api";
import { coverImage, money } from "../../lib/format";
import { useShop } from "../../context/ShopContext";

export default function Dashboard() {
  const { settings, notify } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api.products().then(setProducts).catch((e) => notify(e.message)).finally(() => setLoading(false));
  }, [notify]);

  const setStatus = async (p, status) => {
    try {
      const updated = await api.updateProduct(p._id, { status });
      setProducts((list) => list.map((x) => (x._id === p._id ? updated : x)));
    } catch (e) { notify(e.message); }
  };

  const remove = async () => {
    try {
      await api.deleteProduct(toDelete._id);
      setProducts((list) => list.filter((x) => x._id !== toDelete._id));
      notify("Computer deleted");
    } catch (e) { notify(e.message); }
    setToDelete(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Computers ({products.length})</h1>
        <Link to="/admin/products/new" className="btn-primary">Add computer</Link>
      </div>

      {loading && <p className="text-ink/60">Loading…</p>}
      {!loading && !products.length && (
        <div className="rounded-2xl border border-dashed border-solder p-10 text-center text-ink/70">
          No computers yet. Add your first one to start the shop.
        </div>
      )}

      <ul className="divide-y divide-solder rounded-2xl border border-solder bg-paper">
        {products.map((p) => (
          <li key={p._id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-solder/50">
              {coverImage(p) && <img src={assetUrl(coverImage(p))} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-sm text-ink/70">{money(p.price, settings.currency)}</p>
            </div>
            <select value={p.status} onChange={(e) => setStatus(p, e.target.value)} aria-label={`Status of ${p.name}`}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <Link to={`/admin/products/${p._id}`} className="btn-ghost !py-1.5">Edit</Link>
            <button className="btn-ghost !py-1.5 text-red-700" onClick={() => setToDelete(p)}>Delete</button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {toDelete && (
          <motion.div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setToDelete(null)}>
            <motion.div
              role="dialog" aria-modal="true"
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="w-full max-w-sm rounded-2xl bg-paper p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold">Delete this computer?</h2>
              <p className="mt-2 text-sm text-ink/70">"{toDelete.name}" and all its photos will be removed. This cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button className="btn-ghost" onClick={() => setToDelete(null)}>Keep it</button>
                <button className="btn-danger" onClick={remove}>Delete computer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
