const BASE = import.meta.env.VITE_API_URL || "";

export const getToken = () => localStorage.getItem("admin_token");
export const setToken = (t) => (t ? localStorage.setItem("admin_token", t) : localStorage.removeItem("admin_token"));

/** Turns "/uploads/x.webp" into a full URL (works in dev and production). */
export const assetUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${BASE}${u}`);

async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const api = {
  products: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/products${q ? `?${q}` : ""}`);
  },
  product: (id) => request(`/products/${id}`),
  createProduct: (body) => request("/products", { method: "POST", body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: "PUT", body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  uploadMedia: (id, form) => request(`/products/${id}/media`, { method: "POST", form }),
  deleteMedia: (id, query) => request(`/products/${id}/media?${new URLSearchParams(query)}`, { method: "DELETE" }),
  settings: () => request("/settings"),
  saveSettings: (body) => request("/settings", { method: "PUT", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  changePassword: (body) => request("/auth/password", { method: "PUT", body }),
};
