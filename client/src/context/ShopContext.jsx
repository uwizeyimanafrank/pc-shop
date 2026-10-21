import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { coverImage } from "../lib/format";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export function ShopProvider({ children }) {
  const [settings, setSettings] = useState({ shopName: "PC Shop", whatsappNumber: "", currency: "RWF", tagline: "" });
  const [items, setItems] = useState(() => load("pc_cart", []));
  const [saved, setSaved] = useState(() => load("pc_saved_carts", []));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.settings().then(setSettings).catch(() => {});
  }, []);
  useEffect(() => localStorage.setItem("pc_cart", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("pc_saved_carts", JSON.stringify(saved)), [saved]);

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 2200 ? null : t)), 2300);
  }, []);

  const addToCart = useCallback(
    (p) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === p._id);
        if (found) return prev.map((i) => (i.id === p._id ? { ...i, qty: i.qty + 1 } : i));
        return [...prev, { id: p._id, name: p.name, price: p.price, image: coverImage(p), qty: 1 }];
      });
      notify(`${p.name} added to cart`);
    },
    [notify]
  );

  const setQty = (id, qty) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))));
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setItems([]);

  const saveCart = () => {
    if (!items.length) return;
    const name = `Cart of ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${items.length} item${items.length > 1 ? "s" : ""}`;
    setSaved((prev) => [{ id: String(Date.now()), name, items }, ...prev].slice(0, 10));
    notify("Cart saved on this device");
  };
  const loadSaved = (id) => {
    const found = saved.find((s) => s.id === id);
    if (found) {
      setItems(found.items);
      notify("Saved cart loaded");
    }
  };
  const deleteSaved = (id) => setSaved((prev) => prev.filter((s) => s.id !== id));

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const value = useMemo(
    () => ({ settings, setSettings, items, count, total, addToCart, setQty, removeItem, clearCart, saved, saveCart, loadSaved, deleteSaved, toast, notify }),
    [settings, items, count, total, saved, toast, addToCart, notify]
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
