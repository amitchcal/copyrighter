# ⚡ Copyrighter — 1,000 Viral Hooks Studio + Gemini AI

An interactive copywriting suite and viral hook generator powered by a curated database of **1,002 viral short-form hooks** (categorized across Educational, Storytelling, Myth Busting, Authority, Comparison, Day In The Life, and Random) with live Instagram/TikTok inspiration links, coupled with **Google Gemini AI** for custom generation, hook remixing, and full reel scriptwriting.

---

## 🌟 Key Features

### 1. ✨ Gemini AI Studio
- **⚡ AI Hook Generator from Scratch**:
  - Enter your Niche, Target Audience, Dream Result, Pain Point, and Tone (Viral & High Energy, Contrarian Truth, Raw Vulnerability, High-Status Authority, Step-by-Step).
  - Gemini generates 5 custom viral hooks with Text Overlays, Spoken Lines, Visual Directions, and psychological rationale.
- **🔄 AI Hook Remixing**:
  - Click **"✨ Remix"** on any of the 1,002 hooks in the database to have Gemini adapt that exact hook formula for your specific niche into 3 tailored variations.
- **🎬 Full 30-60s Reel Script Generator**:
  - Expand any hook into a retention-optimized short-form video script with Hook (0-3s), Agitate/Retention (3-12s), 3 Rapid Value Steps (12-40s), and a High-Converting CTA (40-50s).

### 2. ⚡ Global Variable Filler & Niche Studio
- Fill in your audience, topic, dream result, pain point, action, or metric once.
- Instantly populates across the entire 1,000+ hook database with vibrant highlights.
- Includes 1-click presets for **Creator / Social**, **Fitness / Health**, **B2B / SaaS**, **Finance / Wealth**, and **E-Commerce**.

### 3. 🔍 Instant Search & Live Categorization
- Filter by 7 core categories:
  - 📘 **Educational** (472 hooks)
  - 📖 **Storytelling** (368 hooks)
  - 💥 **Myth Busting** (57 hooks)
  - 🏆 **Authority** (47 hooks)
  - ⚖️ **Comparison** (31 hooks)
  - ☀️ **Day In The Life** (16 hooks)
  - 🎲 **Random** (11 hooks)
- Real-time search across hooks, categories, and placeholder tags.

### 4. 🎯 Dedicated Hook Customizer & Inspo Links
- Click "Customize" on any card (or click directly on any placeholder tag) to open a dedicated remix modal with live text preview.
- Direct links to the original Instagram / TikTok viral videos.

### 5. ⭐ Bookmarking & Export
- Star your favorite hooks (persisted locally).
- Export your bookmarks or filtered hooks to **Plain Text (.txt)** or **Spreadsheet (.csv)**.

---

## 🚀 How to Run

### Method 1: Full AI Experience via Python Server (Recommended)
Run the dedicated server with Gemini AI support:
```bash
python server.py
```
Open **`http://localhost:8080`** in your browser. This uses the `GEMINI_API_KEY` stored securely in `.env` and powers all AI endpoints seamlessly.

### Method 2: Open Directly in Browser
Double-click `index.html` to open it as a local file. The app will use direct client-side fallback calls to Google's Gemini REST API with the key configured in `.env` / `localStorage`.

---

## 📁 Project Structure

- `server.py` — Python backend server with Gemini AI endpoints (`/api/generate-hooks`, `/api/remix-hook`, `/api/generate-script`, `/api/status`).
- `index.html` — Interactive Web App UI with AI Studio modal & tabbed generator.
- `styles.css` — Responsive glassmorphism dark mode design system.
- `app.js` — Client-side state manager, AI caller with multi-model fallback, variable engine, search & filter logic.
- `hooks_data.js` — JavaScript bundle of the 1,002 hooks.
- `viral_hooks.json` — Clean, structured JSON dataset.
- `viral_hooks.csv` — CSV spreadsheet ready for Google Sheets or Excel.
- `.env` — Secure storage for `GEMINI_API_KEY`.
- `.gitignore` — Protects `.env` from accidental commits.
- `parse_hooks.py` — Python parser that extracted and repaired the original Word document.
