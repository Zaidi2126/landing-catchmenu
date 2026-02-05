# landing-catchmenu

**Catch Menu** — A PHP-based marketing landing page plus a dynamic, API-driven restaurant menu viewer with optional AR (augmented reality) for dishes. No front-end framework; vanilla JS + jQuery.

---

## What this project is

- **Landing site**: Single-page marketing site (How it works, Benefits, Pricing, Contact) for “Catch Menu” (restaurant e-menu + AR service).
- **Menu viewer**: Dynamic menu pages per restaurant (e.g. `/your-restaurant-slug`) that fetch menu data from an external API, then render using one of several HTML/CSS **templates** (m_001–m_005). Supports “View in AR” for 3D models (Android: model-viewer; iOS: Quick Look; desktop: instructions).
- **Backend**: PHP only. No Node, no build step. Optional `router.php` for pretty URLs when using PHP’s built-in server.

---

## Tech stack

| Layer        | Technology |
|-------------|------------|
| **Server**  | PHP (any 7.x/8.x) |
| **Markup**  | HTML (PHP outputs it; `index.php`, `menu.php`, `get_template.php`) |
| **Styles**  | Plain CSS (no Sass/Less; no CSS framework) |
| **Scripts** | JavaScript (jQuery + vanilla JS; no React/Vue) |
| **Fonts**   | Google Fonts (linked from HTML) |
| **AR**      | Google `model-viewer` (script from unpkg) for Android; iOS uses system AR |
| **Data**    | Menu content from external JSON API (production: `zaidi123.pythonanywhere.com`) |

So: **PHP + HTML + CSS + jQuery + external API**. No Composer, no npm, no bundler.

---

## How routing works

Routing is **not** done by Apache/Nginx rewrite rules in this repo. It’s done by a **single PHP script**, `router.php`, which you use **only** when running PHP’s built-in server locally.

- **With PHP built-in server** (e.g. `php -S localhost:8001 router.php`):
  - `router.php` receives every request.
  - **`/` or `/index.php`** → `router.php` includes `index.php` (landing page).
  - **Any other path** (e.g. `/my-restaurant`) → if a **file** with that path exists (e.g. `/css/foo.css`), the server serves it; otherwise `router.php` sets `$_GET['slug'] = path` and includes `menu.php` (menu viewer for that slug).
  - So: `https://localhost:8001/` = landing, `https://localhost:8001/restaurant-name` = menu for `restaurant-name`.

- **On a real host (e.g. InfinityFree, Apache)**:
  - The web server serves files directly. There is **no** rewrite in this repo that sends “unknown” paths to `router.php`.
  - So you typically have:
    - `https://yoursite.com/` or `https://yoursite.com/index.php` → landing.
    - `https://yoursite.com/menu.php?slug=restaurant-name` → menu viewer.
  - Pretty URLs like `/restaurant-name` would require **server-level** rewrite rules (e.g. in `.htaccess` or Nginx config), which are **not** included here. The repo only contains a small `.htaccess` that sets `DirectoryIndex index.php`.

**Summary:** Routing is “router script for PHP CLI server only”; on production, use `index.php` and `menu.php?slug=...` unless you add your own rewrites.

---

## Project structure (high level)

```
.
├── index.php          # Landing page (HTML + inline JS)
├── menu.php           # Menu viewer page (fetches API, picks template, renders)
├── router.php         # Router for PHP built-in server (see above)
├── get_template.php   # Returns raw HTML for a menu template by code (e.g. ?code=m_001)
├── .htaccess          # DirectoryIndex index.php (so / loads index.php)
├── serve.sh           # Helper: cd to project root and run php -S localhost:8001 router.php
│
├── css/               # All stylesheets (see “Where is the CSS?”)
├── js/                # All scripts (see “Where is the JS?”)
├── img/               # All images and SVGs used by the site
├── modal/             # PHP used by the landing page (e.g. contact form handler)
├── menu_templates/    # Static HTML templates for menu layouts (m_001 … m_005)
├── assets/            # Extra assets (e.g. images for templates, not under img/)
│
├── check-structure.php # Optional: run on server to verify css/, js/, img/ exist (then delete)
└── README.md          # This file
```

- **No** `vendor/`, **no** `node_modules/`, **no** `public/` vs `src/`: everything lives in this one tree. Document root should point at this folder (or the folder that contains `index.php`, `css/`, `js/`, `img/`).

---

## Where is the CSS?

All stylesheets are in **`/css/`** (relative to the site root). The project uses **root-relative** paths: every asset URL starts with `/` (e.g. `/css/style.css`), so the same paths work from `/` and from `/menu.php?slug=...`.

| File            | Role |
|-----------------|------|
| `css/style.css` | Main layout, sections, components for the **landing** page |
| `css/plugins.css` | Third-party / plugin styles (e.g. nicescroll, ripples, YT player) |
| `css/colors.css` | Color variables / theme |
| `css/darkMode.css` | Dark mode overrides |
| `css/catch-menu.css` | Shared styles for **both** landing and **menu viewer** (menu layout, AR, footer, etc.) |
| `css/font/`     | Local webfonts (e.g. xcon) |

**Where they’re loaded:**

- **Landing** (`index.php`): in `<head>`, links to `/css/plugins.css`, `/css/colors.css`, `/css/darkMode.css`, `/css/style.css`, `/css/catch-menu.css` (and conditional `/js/modernizr.custom.js` for IE).
- **Menu viewer** (`menu.php`): in `<head>`, links to `/css/catch-menu.css` only (plus Google Fonts and model-viewer).

So: **CSS is only in `css/`**, and all references use **`/css/...`** (leading slash). There is no `BASE_URL` or relative `css/...` in the codebase for these.

---

## Where is the JS?

All scripts are in **`/js/`** (again, root-relative).

| File              | Role |
|-------------------|------|
| `js/jquery.js`    | jQuery (core) |
| `js/plugins.js`   | Various jQuery plugins (nicescroll, ripples, magnific popup, etc.) |
| `js/init.js`      | Landing page: animations, contact form submit (POST to `/modal/contact.php`), data-attributes, etc. |
| `js/modernizr.custom.js` | Feature detection (loaded only for old IE in index.php) |
| `js/ie8.js`       | IE8 fallbacks (loaded conditionally in index.php) |

**Where they’re loaded:**

- **Landing** (`index.php`): at bottom of body, `<script src="/js/jquery.js">`, then `/js/ie8.js` (conditional), `/js/plugins.js`, `/js/init.js`, plus **inline** script for hero image, typewriter, and optional CSS debug.
- **Menu viewer** (`menu.php`): no jQuery; one **inline** script that contains the whole menu app (API fetch, template selection, DOM render, AR handling). It uses `API_BASE` and `slug` injected from PHP.

So: **JS is only in `js/`** (and inline in `index.php` / `menu.php`). All script src use **`/js/...`**.

---

## Where are the images?

All site images and SVGs are under **`/img/`** (root-relative), e.g.:

- `/img/favicon.png`
- `/img/bg_image.png` (hero on landing)
- `/img/logo/`, `/img/svg/`, `/img/patterns/`, `/img/slider/`, etc.

Landing and menu pages use only **`/img/...`** (no `img/...` or `../img/...`). Some **menu_templates** or **assets** may reference their own paths (e.g. `../assets/...` inside a template); those are template-specific.

---

## How the menu viewer works (data + templates)

1. **URL / slug**  
   User opens the menu page with a “slug” (e.g. `menu.php?slug=my-restaurant` or, with router, `/my-restaurant`). `menu.php` reads `$_GET['slug']`.

2. **API**  
   The inline script in `menu.php` calls:
   - `GET {API_BASE}/api/menu/{slug}/`  
   - `API_BASE` is set in PHP: on production (host containing `zaidi123.pythonanywhere.com`) it’s `https://zaidi123.pythonanywhere.com`; locally it’s `http://<host>:8000`.

3. **Response**  
   API returns JSON (restaurant info, categories, dishes, template code, optional 3D/AR URLs, etc.). The script parses it and chooses a **template code** (e.g. `m_002`).

4. **Template HTML**  
   Template markup is **not** in `menu.php`. It’s in **`menu_templates/`**:
   - `m_001.html` … `m_005.html`  
   The app can load template HTML via **`get_template.php?code=m_001`** (returns the raw HTML of `menu_templates/m_001.html`), or the script may embed/inject template logic. Either way, the **source of truth** for layout is the `m_*.html` files.

5. **Rendering**  
   The script fills the menu page DOM (categories, dishes, images, AR links, footer) using the API data and the chosen template. AR links point to the API’s 3D model URLs or external AR viewers.

So: **Backend = PHP (menu.php + get_template.php), data = external API, UI = HTML templates in `menu_templates/` + CSS in `css/`.**

---

## Static assets rule (for developers)

All project static assets (CSS, JS, images, modal endpoint) use **paths that start with a slash**:

- **css** → `/css/...`
- **js** → `/js/...`
- **img** → `/img/...`
- **modal** → e.g. `/modal/contact.php`

Do **not** use:

- `css/file.css`, `js/init.js`, `img/logo.png` (no leading slash)
- `BASE_URL + "css/file.css"` or any pattern that can produce a path without a leading slash

This keeps behavior consistent regardless of whether the site is at the domain root or a subpath (as long as the server is configured so that `/` is the app root).

---

## How to run locally

1. **PHP**  
   You need PHP (7.x or 8.x) on the command line.

2. **From project root** (the folder that contains `index.php`, `router.php`, `css/`, `js/`, `img/`):
   ```bash
   php -S localhost:8001 router.php
   ```
   Or use the helper script (from project root):
   ```bash
   ./serve.sh
   ```
   (`serve.sh` just `cd`s to the script’s directory and runs the command above.)

3. **Open**  
   - Landing: `http://localhost:8001/`  
   - Menu (if API is available): `http://localhost:8001/some-slug`

4. **API**  
   Menu data is loaded from an external API. For local menu testing, that API must be reachable (e.g. local backend on port 8000 or the production API). Production hostname is `zaidi123.pythonanywhere.com`.

---

## Deployment (e.g. InfinityFree)

- Upload the **entire** project so that **document root** is the folder that contains `index.php`, `css/`, `js/`, `img/`, `menu.php`, `router.php`, `get_template.php`, `menu_templates/`, `modal/`, etc.
- **Do not** upload so that the site is at `yoursite.com/some-subfolder/` unless you’re prepared to configure a base path (this repo currently uses no base path; all assets are `/css/`, `/js/`, `/img/`).
- Ensure **index.php** is the default document (the included `.htaccess` sets `DirectoryIndex index.php` for Apache).
- After upload, if CSS/JS don’t load, use **check-structure.php** once: open `https://yoursite.com/check-structure.php` to verify that `css/`, `js/`, `img/` exist and list files; then **delete** `check-structure.php` for security.

---

## Summary

- **What it is:** PHP landing page + API-driven menu viewer with optional AR; no front-end framework.
- **Tech:** PHP, HTML, CSS, jQuery + vanilla JS, external JSON API, Google Fonts, model-viewer for AR.
- **Routing:** `router.php` only when using PHP’s built-in server; on a normal host, use `index.php` and `menu.php?slug=...` (or add your own rewrites).
- **CSS:** All in **`/css/`** (style, plugins, colors, darkMode, catch-menu, fonts).
- **JS:** All in **`/js/`** (jQuery, plugins, init) plus inline in `index.php` and `menu.php`.
- **Images:** All under **`/img/`**; assets for templates in **`assets/`**.
- **Menu logic:** Slug → API → JSON → choose template (m_001–m_005) → render; templates live in **`menu_templates/`**; optional template HTML via **`get_template.php?code=...`**.

If you read this and the repo tree, you have a complete picture of the stack, routing, and where everything lives without opening the project in an editor.
