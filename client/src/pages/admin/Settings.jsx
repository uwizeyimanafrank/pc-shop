import { useState } from "react";
import { api } from "../../lib/api";
import { useShop } from "../../context/ShopContext";

export default function Settings() {
  const { settings, setSettings, notify } = useShop();
  const [form, setForm] = useState(settings);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const saved = await api.saveSettings(form);
      setSettings(saved);
      setForm(saved);
      notify("Settings saved");
    } catch (err) { notify(err.message); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.changePassword(pw);
      setPw({ currentPassword: "", newPassword: "" });
      notify("Password updated");
    } catch (err) { notify(err.message); }
  };

  return (
    <div className="grid max-w-3xl gap-10">
      <form onSubmit={save} className="space-y-4">
        <h1 className="text-2xl font-bold">Shop settings</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="shopName">Shop name</label>
          <input id="shopName" value={form.shopName || ""} onChange={set("shopName")} required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tagline">Line on the home page</label>
          <input id="tagline" value={form.tagline || ""} onChange={set("tagline")} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="wa">WhatsApp number for carts</label>
          <input id="wa" inputMode="numeric" placeholder="250780000000" value={form.whatsappNumber || ""} onChange={set("whatsappNumber")} />
          <p className="text-xs text-ink/60">Country code first, digits only, no + or spaces. Rwanda numbers start with 250.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="cur">Currency</label>
          <input id="cur" value={form.currency || ""} onChange={set("currency")} />
        </div>
        <button className="btn-primary">Save settings</button>
      </form>

      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="text-xl font-bold">Change password</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="cp">Current password</label>
          <input id="cp" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="np">New password (8+ characters)</label>
          <input id="np" type="password" autoComplete="new-password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
        </div>
        <button className="btn-dark">Update password</button>
      </form>
    </div>
  );
}
