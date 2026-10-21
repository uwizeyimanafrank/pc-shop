import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Toast() {
  const { toast } = useShop();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex items-center gap-4 rounded-xl bg-board px-4 py-3 text-sm text-paper shadow-lg"
          >
            <span>{toast.message}</span>
            {toast.message.includes("added") && (
              <Link to="/cart" className="font-semibold text-gold underline-offset-2 hover:underline">
                View cart
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
