# Catch Menu

**Catch Menu** — A React marketing site and API-driven restaurant menu viewer with optional AR (augmented reality) for dishes.

- **Landing:** Single-page marketing (How it works, Benefits, Pricing, Contact).
- **Menu viewer:** Dynamic menu per restaurant at `/:slug`, fetching data from an external API and rendering one of several layouts (m_001–m_005). “View in AR” for 3D models (Android: model-viewer; iOS: Quick Look; desktop: instructions).

---

## Tech stack

| Layer     | Technology |
|----------|------------|
| **Build** | Vite |
| **UI**   | React 18, React Router 6 |
| **Styles** | Plain CSS (in `css/` and component-scoped in `src/`) |
| **Fonts** | Google Fonts |
| **AR**   | Google `model-viewer` (unpkg) for Android; iOS system AR |
| **Data** | JSON API (default: `zaidi123.pythonanywhere.com`) |

---

## Project structure

```
.
├── index.html          # Vite entry (loads React app)
├── package.json
├── vite.config.js
├── .htaccess           # SPA fallback for Apache (serve index.html for routes)
│
├── public/             # Static assets (symlinks to css/, img/, js/)
├── src/
│   ├── main.jsx
│   ├── App.jsx         # Routes: / and /:slug
│   ├── config.js       # API_BASE (VITE_API_BASE)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   └── MenuPage.jsx
│   ├── components/menu/  # Menu layouts (Default, M002–M005)
│   ├── context/ArContext.jsx
│   └── utils/menuData.js
│
├── css/                # Global styles (landing + menu)
├── img/                # Images and SVGs
├── js/                 # Legacy scripts (jQuery, plugins, init) for landing
└── assets/             # Extra assets
```

---

## Routes

- **`/`** — Landing page.
- **`/:slug`** — Menu for restaurant `slug`. Fetches `GET {API_BASE}/api/menu/{slug}/`, then renders the template from `data.theme.template_code` (m_001–m_005).

---

## How to run

1. **Node.js 18+** and npm.

2. **Install and dev:**
   ```bash
   npm install
   npm run dev
   ```
   Dev server: `http://localhost:5173` (or next free port).

3. **Assets:** `public/` has symlinks to `css/`, `img/`, `js/`. If they’re missing (e.g. fresh clone):
   ```bash
   cd public && ln -sf ../css css && ln -sf ../img img && ln -sf ../js js
   ```

4. **API:** Menu data from `VITE_API_BASE`. Default: `https://zaidi123.pythonanywhere.com`. Override in `.env`:
   ```
   VITE_API_BASE=https://your-api.com
   ```

---

## Build and deploy

```bash
npm run build
```

Output is in **`dist/`**. The server must serve **`index.html`** for every route (so `/thehub7` loads the app and React Router can show the menu). Otherwise you get 404 on direct links or refresh.

- **Vercel:** The repo includes **`vercel.json`** with a rewrite so all paths serve `index.html`. Redeploy after pulling.
- **Netlify:** **`public/_redirects`** is copied to `dist/` and tells Netlify to serve `index.html` for all routes.
- **Apache:** Use the included `.htaccess` (copy it into `dist/`). Document root = `dist/`.
- **Nginx:** `try_files $uri $uri/ /index.html;`

---

## Summary

- **Stack:** Vite, React, React Router. No PHP.
- **Routes:** `/` = landing, `/:slug` = menu (slug = restaurant identifier).
- **Menu:** Slug → API → JSON → template (m_001–m_005) → render; AR handled per device (Android model-viewer, iOS Quick Look, desktop message).
- **Assets:** `/css/`, `/img/`, `/js/` via `public/` (symlinks in dev; copied into `dist/` on build).
