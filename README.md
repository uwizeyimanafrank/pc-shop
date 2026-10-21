# PC Shop

A catalog shop for one PC seller. One admin manages everything. Visitors browse, look at each PC from every side (or spin it 360°), build a cart, and send it to the seller on WhatsApp. No signup needed for visitors.

Stack: MongoDB, Express, React (Vite), Tailwind CSS, Framer Motion.

## 1. Run it on your computer

You need Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

### Backend
```bash
cd server
cp .env.example .env      # then open .env and fill it in
npm install
npm run seed              # creates the admin account + shop settings (run once)
npm run dev               # API on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev               # site on http://localhost:5173
```

Open http://localhost:5173/admin/login and log in with the ADMIN_USERNAME and ADMIN_PASSWORD from `.env`.

## 2. How the seller uses it

1. Settings: set the shop name and the WhatsApp number (country code first, digits only, like 250780000000).
2. Computers > Add computer: fill in name, price, specs, condition. Save.
3. After saving, the Photos section appears:
   - Upload one photo per side: front, right, back, left, top, bottom. Do it for "Closed case" and, if you want, "Open case".
   - Upload the 360° set (24 photos is ideal, minimum 8). Name the files 01, 02, 03... so they stay in order.
4. Change status to Reserved or Sold when needed. Sold items go to the end of the shop and cannot be added to a cart.

## 3. Taking the 360° photos

- Phone on a tripod that never moves. Same distance, same light, plain background.
- PC on a turntable (or a lazy Susan). Turn it the same amount each shot: 15 degrees for 24 photos.
- Photos are resized and converted to WebP by the server, so you can upload them straight from the phone.

## 4. How the WhatsApp cart works

The cart page builds a message from the cart and opens `https://wa.me/<seller number>?text=...`. WhatsApp opens with the list already written. The buyer presses send, then talks about the price with the seller. No WhatsApp API, no cost.

"Save cart" stores a copy of the cart on that visitor's device (localStorage). Carts also stay saved automatically between visits.

## 5. Deploying later

- Client: `npm run build` in `client`, host the `dist` folder (Netlify, Vercel, etc). Set `VITE_API_URL=https://your-api-domain` when building.
- Server: set `CLIENT_URL` to your site address in `.env`, and use a strong `JWT_SECRET`.
- Photos are stored in `server/uploads`. Many free hosts erase files on restart. For a real deployment use a host with a persistent disk, or move uploads to Cloudinary or S3 (only `server/src/middleware/upload.js` needs to change).
- Back up the `uploads` folder and the database.

## 6. Planned next

- 3D viewer: the `model3d` field already exists on the product. Add React Three Fiber and show the viewer when a .glb is set, keeping the photo views as fallback.
- Customer accounts for advanced features.
