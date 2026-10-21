import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const { settings, count } = useShop();
  return (
    <header className="sticky top-0 z-30 border-b border-solder bg-mask/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-board">
          {settings.shopName}
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-paper">
            Shop
          </NavLink>
          <NavLink to="/cart" className="relative flex items-center gap-2 rounded-lg bg-board px-3 py-2 text-sm font-semibold text-paper hover:bg-board-light">
            Cart
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                className="grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold text-ink"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
