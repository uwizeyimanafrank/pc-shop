export const money = (n, currency = "RWF") => `${Number(n || 0).toLocaleString("en-US")} ${currency}`;

export const SIDE_ORDER = ["front", "right", "back", "left", "top", "bottom"];

export function coverImage(product) {
  const media = product.media || [];
  const front = media.find((m) => m.type === "side" && m.state === "closed" && m.label === "front");
  const anySide = media.find((m) => m.type === "side");
  return (front || anySide || media[0])?.url || "";
}

export function specLine(p) {
  const s = p.specs || {};
  return [s.cpu, s.ram, s.storage].filter(Boolean).join(", ");
}

const wa = (phone, text) => `https://wa.me/${String(phone).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export function cartWhatsAppLink({ phone, shopName, items, currency }) {
  const lines = items.map(
    (i) => `• ${i.name} x${i.qty} - ${money(i.price * i.qty, currency)}\n  ${window.location.origin}/product/${i.id}`
  );
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const text = `Hello ${shopName}, I'm interested in:\n\n${lines.join("\n")}\n\nTotal: ${money(total, currency)}\n\nIs the price negotiable?`;
  return wa(phone, text);
}

export function productWhatsAppLink({ phone, shopName, product, currency }) {
  const text = `Hello ${shopName}, I'm asking about:\n\n${product.name} - ${money(product.price, currency)}\n${window.location.origin}/product/${product._id}\n\nIs it still available?`;
  return wa(phone, text);
}
