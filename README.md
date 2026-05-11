# SEBI Legal Monitor — React Dashboard

A professional, full-viewport dashboard for real-time monitoring of SEBI (Securities and Exchange Board of India) legal publications. Automatically scans PDF circulars to detect recipient targeting and highlights relevant feed items instantly.

**Live demo:** hosted on Netlify — deploy your own with the one-click guide below.

---

## Key Features

### 1. Dashboard Layout
- **Full-viewport design** — uses the entire browser window with no centering constraints
- **Dark navy sidebar** with controls, recipient filters, and terminal logs
- **Main content area** with a horizontal filter toolbar, progress bar, and feed list

### 2. Intelligent Monitoring & Scheduling
- **Daily fixed-time polling** — schedule checks at a specific time (e.g. 7:00 PM)
- **Real-time countdown** — progress bar tracks time remaining until next scheduled check
- **Parallel scraping** — RSS feed + multiple SEBI categories scraped simultaneously

### 3. PDF "To" Section Scanner
- **Auto-scans new PDFs** in the background whenever a check runs
- **Extracts the "To" section** of each circular (from "To" up to "Dear Sir/Madam" or "Sir/Madam")
- **Matches against a configurable recipient list** — default terms:
  - All Alternative Investment Funds (AIFs)
  - All intermediaries registered with SEBI under Section 12 of the SEBI Act, 1992
  - All registered intermediaries
- **Highlights matched feed items** with an orange accent and a badge
- **Live re-evaluation** — changing the recipient list instantly re-checks all already-scanned items without re-downloading
- **Scan progress banner** — a live spinner shows how many PDFs are currently being scanned

### 4. Recipient Filter Management (Sidebar)
- Add custom recipient terms via a text input (press Enter or click Add)
- Remove individual terms with the × button
- Any term matching the "To" section triggers a highlight on that feed item

### 5. Horizontal Filter Toolbar
Sits above the progress bar in the main content area:
- **Search** — filter feed by title keyword
- **Category** — Acts, Rules, Regulations, Circulars, Guidelines, etc.
- **New only** — show only items detected since the last check
- **Scraped** — toggle inclusion of scraped (non-RSS) items
- **Matched only** — show only items whose PDF "To" section matched a recipient term
- **Check time** — set the daily scheduled check time

### 6. Integrated PDF Viewer
- **Inline PDF modal** — view circulars without leaving the app
- **Serverless proxy** — Netlify Function downloads PDFs as blobs, bypassing SEBI's `X-Frame-Options: SAMEORIGIN` and CORS restrictions
- **Smart URL resolution** — parses SEBI landing pages to find direct PDF attachment URLs
- **Content-aware proxy** — text responses (HTML/XML) returned as plain string; binary (PDF) returned as base64, preventing encoding issues
- **22-second frontend timeout** aligned with the 26-second Netlify function limit for clean error handling

### 7. Visual Language
- **Blue left border** — RSS feed items
- **Yellow left border** — Scraped website items
- **Orange left border + gradient** — items whose "To" section matched a recipient term
- **Category dots** — color-coded dots per publication type (Acts, Rules, Regulations, etc.)

### 8. Developer Tools
- **Terminal log box** — real-time system feedback in the sidebar (JetBrains Mono)
- **Browser notifications** — native OS alerts for new publications
- **Toast notifications** — in-app popups on check completion

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Styling | Vanilla CSS (CSS Variables, Flexbox/Grid) |
| PDF parsing | pdfjs-dist |
| Proxy (production) | Netlify Serverless Function |
| Proxy (local dev) | Node.js `server.cjs` on port 3001 |
| Fonts | Outfit (UI), JetBrains Mono (logs) |

---

## Deploying to Netlify (Recommended)

### 1. Push this repo to GitHub (if not already done)

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and log in
2. Click **"Add new site" → "Import an existing project"**
3. Select **GitHub** and choose this repository
4. Netlify auto-detects `netlify.toml` — build settings are pre-configured:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Click **"Deploy site"**

That's it. The serverless proxy function (`netlify/functions/proxy.js`) deploys automatically alongside the frontend. No separate server needed.

> **Important:** The daily monitoring scheduler runs in the browser tab — you need to keep the tab open for scheduled checks to fire. For fully automated background monitoring without a browser, a backend cron job would be required.

### Proxy Function Details
The Netlify function (`netlify/functions/proxy.js`):
- Only allows requests to `https://www.sebi.gov.in/` (allowlisted)
- Returns HTML/XML as plain text, PDFs as base64-encoded binary
- Has a 23-second internal timeout with a proper `504` response on failure
- Netlify function timeout is set to **26 seconds** in `netlify.toml`

---

## Local Development

### Option A — Standard (two terminals)
```bash
# Terminal 1 — proxy server
node server.cjs

# Terminal 2 — Vite dev server
npm run dev
```
The app auto-detects the local environment and routes through `http://localhost:3001`.

### Option B — Netlify Dev (single terminal, matches production exactly)
```bash
npm install -g netlify-cli
netlify dev
```
Runs Vite + the Netlify Function locally together on `http://localhost:8888`.

---

## Project Structure

```
netlify/
└── functions/
    └── proxy.js             # Serverless CORS proxy (replaces server.cjs in production)
src/
├── App.jsx                  # Main logic, state, scheduling, filtering
├── App.css                  # All component styles
├── index.css                # Global reset (full-viewport)
├── components/
│   ├── Header.jsx           # Sidebar header: controls + recipient filter list
│   ├── FilterBar.jsx        # Horizontal filter toolbar (search, category, toggles)
│   ├── FeedItem.jsx         # Individual publication card
│   ├── ScanProgress.jsx     # PDF scanning progress banner
│   ├── ProgressBar.jsx      # Next-check countdown bar
│   ├── LogBox.jsx           # Terminal-style log output
│   ├── Toast.jsx            # In-app notification popup
│   └── PdfModal.jsx         # Inline PDF viewer modal
└── utils/
    └── pdfReader.js         # PDF.js text extraction + "To" section parser
server.cjs                   # Local dev proxy server (port 3001)
netlify.toml                 # Netlify build + function configuration
```

---

*Built for professional SEBI monitoring and legal compliance tracking.*
