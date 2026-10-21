import { useCallback, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "./context/ShopContext";
import BootLoader from "./components/BootLoader";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import AdminLayout from "./pages/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProductEditor from "./pages/admin/ProductEditor";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  const { settings } = useShop();
  const location = useLocation();
  const [booting, setBooting] = useState(() => !sessionStorage.getItem("booted"));
  const finish = useCallback(() => { sessionStorage.setItem("booted", "1"); setBooting(false); }, []);

  return (
    <>
      <AnimatePresence>{booting && <BootLoader name={settings.shopName} onDone={finish} />}</AnimatePresence>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname.startsWith("/admin") ? "admin" : location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products/new" element={<ProductEditor />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<p className="py-24 text-center">Page not found.</p>} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Toast />
    </>
  );
}
