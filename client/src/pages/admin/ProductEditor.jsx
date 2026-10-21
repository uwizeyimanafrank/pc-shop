import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, assetUrl } from "../../lib/api";
import { SIDE_ORDER } from "../../lib/format";
import { useShop } from "../../context/ShopContext";

const EMPTY = {
  name: "", brand: "", category: "desktop", condition: "used", status: "available",
  price: "", negotiable: true, description: "",
  specs: { cpu: "", ram: "", storage: "", gpu: "", screen: "", os: "" },
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function MediaManager({ product, onChange }) {
  const { notify } = useShop();
  const [busy, setBusy] = useState("");

  const upload = async (state, type, label, files) => {
    if (!files?.length) return;
    const key = `${state}-${type}-${label}`;
    setBusy(key);
    try {
      const form = new FormData();
      form.append("state", state);
      form.append("type", type);
      form.append("label", label);
      [...files].forEach((f) => form.append("files", f));
      onChange(await api.uploadMedia(product._id, form));
      notify("Photos uploaded");
    } catch (e) { notify(e.message); }
    setBusy("");
  };

  const remove = async (query) => {
    try { onChange(await api.deleteMedia(product._id, query)); } catch (e) { notify(e.message); }
  };

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-xl font-bold">Photos</h2>
        <p className="text-sm text-ink/70">Upload one photo per side. Closed means the case is shut, open means the side panel is off so the inside shows.</p>
      </div>

      {["closed", "open"].map((state) => {
        const spin = product.media.filter((m) => m.type === "spin" && m.state === state);
        return (
          <div key={state} className="rounded-2xl border border-solder bg-paper p-4">
            <h3 className="mb-3 text-lg font-bold">{cap(state)} case</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {SIDE_ORDER.map((label) => {
                const m = product.media.find((x) => x.type === "side" && x.state === state && x.label === label);
                const key = `${state}-side-${label}`;
                return (
                  <div key={label} className="text-center">
                    <div className="mb-1 aspect-square overflow-hidden rounded-lg bg-solder/50">
                      {m ? <img src={assetUrl(m.url)} alt={`${label} ${state}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-ink/50">Empty</div>}
                    </div>
                    <p className="text-xs font-semibold">{cap(label)}</p>
                    <label className="mt-1 block cursor-pointer rounded-md bg-board px-2 py-1 text-xs font-semibold text-paper hover:bg-board-light">
                      {busy === key ? "Uploading…" : m ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" hidden onChange={(e) => { upload(state, "side", label, e.target.files); e.target.value = ""; }} />
                    </label>
                    {m && <button className="mt-1 text-xs text-red-700 hover:underline" onClick={() => remove({ mediaId: m._id })}>Remove</button>}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-solder pt-4">
              <h4 className="font-semibold">360° spin ({spin.length} photos)</h4>
              <p className="mb-2 text-sm text-ink/70">Select all the turntable photos at once (24 is ideal). Name them 01, 02, 03… so the order is right. Uploading again replaces the old set.</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn-dark cursor-pointer">
                  {busy === `${state}-spin-` ? "Uploading, please wait…" : spin.length ? "Replace 360° photos" : "Upload 360° photos"}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => { upload(state, "spin", "", e.target.files); e.target.value = ""; }} />
                </label>
                {spin.length > 0 && <button className="btn-ghost text-red-700" onClick={() => remove({ state, type: "spin" })}>Remove 360° set</button>}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default function ProductEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { notify } = useShop();
  const [form, setForm] = useState(EMPTY);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) { setForm(EMPTY); setProduct(null); return; }
    setLoading(true);
    api.product(id)
      .then((p) => { setProduct(p); setForm({ ...EMPTY, ...p, specs: { ...EMPTY.specs, ...p.specs } }); })
      .catch((e) => notify(e.message))
      .finally(() => setLoading(false));
  }, [id, notify]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setSpec = (k) => (e) => setForm({ ...form, specs: { ...form.specs, [k]: e.target.value } });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form, price: Number(form.price) };
      delete body.media; delete body._id; delete body.__v; delete body.createdAt; delete body.updatedAt;
      if (id) {
        const updated = await api.updateProduct(id, body);
        setProduct(updated);
        notify("Computer saved");
      } else {
        const created = await api.createProduct(body);
        notify("Computer created. Now add photos.");
        nav(`/admin/products/${created._id}`, { replace: true });
      }
    } catch (err) { notify(err.message); }
    setBusy(false);
  };

  if (loading) return <p className="text-ink/60">Loading…</p>;

  const field = (label, key, props = {}) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={key}>{label}</label>
      <input id={key} value={form[key] ?? ""} onChange={set(key)} {...props} />
    </div>
  );
  const spec = (label, key, placeholder) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`spec-${key}`}>{label}</label>
      <input id={`spec-${key}`} value={form.specs[key]} onChange={setSpec(key)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <Link to="/admin" className="mb-3 inline-block text-sm font-medium text-ink/70 hover:text-ink">‹ All computers</Link>
      <h1 className="mb-5 text-2xl font-bold">{id ? "Edit computer" : "Add computer"}</h1>

      <form onSubmit={save} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Name", "name", { required: true, placeholder: "HP EliteDesk 800 G3" })}
          {field("Brand", "brand", { placeholder: "HP" })}
          {field("Price", "price", { required: true, type: "number", min: 0, inputMode: "numeric" })}
          <div className="flex flex-col gap-1">
            <label htmlFor="category">Type</label>
            <select id="category" value={form.category} onChange={set("category")}>
              <option value="desktop">Desktop</option><option value="laptop">Laptop</option>
              <option value="all-in-one">All-in-one</option><option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="condition">Condition</label>
            <select id="condition" value={form.condition} onChange={set("condition")}>
              <option value="new">New</option><option value="refurbished">Refurbished</option><option value="used">Used</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={set("status")}>
              <option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 !p-0" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} />
          Price can be discussed
        </label>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-lg font-bold">Specs</legend>
          {spec("Processor", "cpu", "Intel Core i5-7500")}
          {spec("Memory", "ram", "8 GB DDR4")}
          {spec("Storage", "storage", "256 GB SSD")}
          {spec("Graphics", "gpu", "Intel HD 630")}
          {spec("Screen", "screen", "Not included")}
          {spec("System", "os", "Windows 10 Pro")}
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={5} value={form.description} onChange={set("description")} />
        </div>

        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Create computer"}</button>
      </form>

      {product ? <MediaManager product={product} onChange={setProduct} /> : (
        <p className="mt-8 rounded-xl bg-gold/20 p-4 text-sm">Save the computer first. Then you can upload its photos here.</p>
      )}
    </div>
  );
}
