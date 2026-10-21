import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { assetUrl } from "../lib/api";
import { cartWhatsAppLink, money } from "../lib/format";

export default function Cart() {
  const { settings, items, total, setQty, removeItem, clearCart, saveCart, saved, loadSaved, deleteSaved } = useShop();
  const canSend = items.length > 0 && Boolean(settings.whatsappNumber);
  const link = canSend ? cartWhatsAppLink({ phone: settings.whatsappNumber, shopName: settings.shopName, items, currency: settings.currency }) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your cart</h1>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-solder p-10 text-center">
          <p className="mb-4 text-ink/70">Your cart is empty. Add a computer you like and it will show up here.</p>
          <Link to="/" className="btn-dark">Browse computers</Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-solder rounded-2xl border border-solder bg-paper">
            <AnimatePresence initial={false}>
              {items.map((i) => (
                <motion.li
                  key={i.id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 overflow-hidden p-4"
                >
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-solder/50">
                    {i.image && <img src={assetUrl(i.image)} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${i.id}`} className="block truncate font-semibold hover:underline">{i.name}</Link>
                    <p className="text-sm text-ink/70">{money(i.price, settings.currency)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button aria-label="One less" className="btn-ghost !px-3" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                    <span className="w-7 text-center font-semibold">{i.qty}</span>
                    <button aria-label="One more" className="btn-ghost !px-3" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
                  </div>
                  <button aria-label={`Remove ${i.name}`} className="text-sm font-medium text-red-700 hover:underline" onClick={() => removeItem(i.id)}>Remove</button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-ink/70">Total</span>
            <motion.span key={total} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="font-display text-3xl font-bold text-board">
              {money(total, settings.currency)}
            </motion.span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={link} target="_blank" rel="noreferrer" className={`btn-primary flex-1 ${!canSend ? "pointer-events-none opacity-50" : ""}`}>
              Send cart to seller on WhatsApp
            </a>
            <button className="btn-ghost" onClick={saveCart}>Save cart</button>
            <button className="btn-ghost" onClick={clearCart}>Clear</button>
          </div>
          {!settings.whatsappNumber && <p className="mt-3 text-sm text-red-700">The seller has not set a WhatsApp number yet.</p>}
          <p className="mt-3 text-sm text-ink/60">WhatsApp opens with your list already written. Press send, then talk about the price with the seller.</p>
        </>
      )}

      {saved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold">Saved carts</h2>
          <ul className="space-y-2">
            {saved.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-solder bg-paper p-3">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="flex gap-2">
                  <button className="btn-dark !py-1.5" onClick={() => loadSaved(s.id)}>Open</button>
                  <button className="btn-ghost !py-1.5" onClick={() => deleteSaved(s.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
