import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../../lib/api";

export default function AdminLayout() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const hasToken = Boolean(getToken());

  useEffect(() => {
    if (!hasToken) return;
    api.me().then(() => setOk(true)).catch(() => { setToken(null); nav("/admin/login", { replace: true }); });
  }, [hasToken, nav]);

  if (!hasToken) return <Navigate to="/admin/login" replace />;
  if (!ok) return <p className="py-24 text-center text-ink/60">Checking your login…</p>;

  const tab = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? "bg-board text-paper" : "hover:bg-paper"}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-solder pb-4">
        <span className="mr-2 font-display text-lg font-bold">Admin</span>
        <NavLink to="/admin" end className={tab}>Computers</NavLink>
        <NavLink to="/admin/settings" className={tab}>Settings</NavLink>
        <Link to="/" className="ml-auto text-sm font-medium text-ink/70 hover:text-ink">View shop</Link>
        <button className="btn-ghost !py-1.5" onClick={() => { setToken(null); nav("/admin/login"); }}>Log out</button>
      </div>
      <Outlet />
    </div>
  );
}
