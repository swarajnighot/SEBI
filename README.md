# 🏛️ SEBI Legal Monitor (React Dashboard)

A high-performance, professional dashboard for real-time monitoring of SEBI (Securities and Exchange Board of India) legal publications. This application migrates the legacy monolithic monitor into a modular React environment with advanced scheduling and inline PDF viewing.

## 🚀 Key Features

### 1. Advanced Dashboard Architecture
- **High-Density Sidebar Layout**: All controls, stats, and real-time logs are condensed into a sleek 380px sidebar, maximizing horizontal space for feed items.
- **Modern UI Tokens**: Built using the **'Outfit'** font family and a professional slate/blue design system with smooth CSS transitions and glassmorphism effects.

### 2. Intelligent Monitoring & Scheduling
- **Daily Fixed-Time Polling**: Instead of simple intervals, the app can be scheduled to run at a specific time daily (e.g., **7:00 PM**), aligning with publication windows.
- **Real-Time Countdown**: A visual progress bar tracks the time remaining until the next scheduled daily check.
- **Parallel Scraping**: Monitors RSS feeds and scrapes multiple SEBI categories (Acts, Rules, Regulations, Circulars, etc.) simultaneously for zero-latency detection.

### 3. Integrated PDF Intelligence
- **Inline PDF Viewer**: View publications directly within the app via a sleek modal.
- **Blob-Proxy Bypass**: Uses a local proxy to download PDFs as Blobs, bypassing SEBI's strict `X-Frame-Options: SAMEORIGIN` and CORS policies that typically block inline viewing.
- **Smart URL Resolution**: Automatically parses SEBI's complex landing pages to find the direct PDF attachment, even when obfuscated.

### 4. Visual Data Language
- **Source-Specific Coding**: 
  - **Blue Outline/Tint**: Represents official RSS feed items.
  - **Yellow Outline/Tint**: Represents scraped website data.
- **New Item Indicators**: Fresh publications are flagged with a distinctive inner glow and a bold right-border highlight.

### 5. Developer & Power User Tools
- **Terminal Logs**: Integrated log box in the sidebar for real-time system feedback.
- **Browser Notifications**: Supports native OS notifications for new publication alerts.
- **Toast Notifications**: In-app popups for immediate feedback on check completion.

## 🛠️ Technical Stack
- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS (Modern CSS Variables & Grid/Flex)
- **Proxy**: Node.js (Express-based) for CORS/PDF fetching
- **Fonts**: Outfit (Google Fonts), JetBrains Mono (Logs)

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Proxy Server (Required)
The application requires the local proxy to bypass SEBI's security headers.
```bash
node server.cjs
```

### 3. Start Development Server
```bash
npm run dev
```

## 📂 Project Structure
- `src/App.jsx`: Main logic, scheduling, and state management.
- `src/components/`:
  - `PdfModal.jsx`: Inline PDF viewer logic.
  - `FeedItem.jsx`: Component for individual publication cards.
  - `Header.jsx` / `FilterBar.jsx` / `StatsRow.jsx`: Sidebar UI components.
- `server.cjs`: The essential CORS-bypassing proxy server.

---
*Developed for professional SEBI monitoring and legal compliance tracking.*
