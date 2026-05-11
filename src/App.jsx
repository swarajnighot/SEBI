import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProgressBar from './components/ProgressBar';
import FeedItem from './components/FeedItem';
import LogBox from './components/LogBox';
import Toast from './components/Toast';
import PdfModal from './components/PdfModal';
import ScanProgress from './components/ScanProgress';
import { extractToSection } from './utils/pdfReader';
import './App.css';

// ---------- Configuration ----------
const RSS_URL = 'https://www.sebi.gov.in/sebirss.xml';

// In production (Netlify) use the serverless function; locally use server.cjs
const PROXY_BASE = import.meta.env.PROD
  ? '/.netlify/functions/proxy?url='
  : 'http://localhost:3001/proxy?url=';

const CORS_PROXIES = [url => `${PROXY_BASE}${encodeURIComponent(url)}`];
const FETCH_TIMEOUT_MS = 15000;
const EXCLUDED_CATS = new Set(['orders', 'enforcement', 'other']);
const SEBI_BASE = 'https://www.sebi.gov.in';
const SCRAPE_CATEGORIES = [
  { cat: 'acts', ssid: 1, label: 'Acts' },
  { cat: 'rules', ssid: 2, label: 'Rules' },
  { cat: 'regulations', ssid: 3, label: 'Regulations' },
  { cat: 'general-orders', ssid: 4, label: 'General Orders' },
  { cat: 'guidelines', ssid: 5, label: 'Guidelines' },
  { cat: 'master-circulars', ssid: 6, label: 'Master Circulars' },
];

const PDF_SIGNATURE = '%PDF-';
const DEBUG_PDF_MATCH = true;

function App() {
  // State
  const [items, setItems] = useState([]);
  const [knownLinks, setKnownLinks] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [checkTime, setCheckTime] = useState('19:00');
  const [countdownSec, setCountdownSec] = useState(0);
  const [totalCycleSec, setTotalCycleSec] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [checksRun, setChecksRun] = useState(0);
  const [logs, setLogs] = useState([]);
  const [toSearchTerms, setToSearchTerms] = useState([
    'All Alternative Investment Funds (AIFs)',
    'All intermediaries registered with SEBI under Section 12 of the Securities and Exchange Board of India Act, 1992',
    'All registered intermediaries',
  ]);
  const [scanningCount, setScanningCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false, item: null, blobUrl: null, error: null, loading: false, loadingText: '' 
  });
  
  // Filters
  const [filterCat, setFilterCat] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterNewOnly, setFilterNewOnly] = useState(false);
  const [filterScraped, setFilterScraped] = useState(false);
  const [filterMatchedOnly, setFilterMatchedOnly] = useState(false);

  // Refs for timers
  const timeoutIdRef = useRef(null);
  const countdownIdRef = useRef(null);
  const isFirstRunRef = useRef(true);

  // Helper: Get ms until next occurrence of HH:mm
  const getMsUntil = (timeStr) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hrs, mins, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target.getTime() - now.getTime();
  };

  // Helper: Log message
  const log = useCallback((text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-199), { text: `[${time}] ${text}`, type }]);
  }, []);

  const debugLog = useCallback((text, extra = null, type = 'info') => {
    if (!DEBUG_PDF_MATCH) return;
    if (extra !== null) console.log(`[PDF DEBUG] ${text}`, extra);
    else console.log(`[PDF DEBUG] ${text}`);
    log(`[PDF DEBUG] ${text}`, type);
  }, [log]);

  // Helper: Request Notifications
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ---------- Data Fetching ----------

  const fetchWithTimeout = async (url) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  };

  const fetchRSS = async () => {
    log('Fetching RSS feed...', 'info');
    let xmlText;
    let lastErr;
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxyUrl = CORS_PROXIES[i](RSS_URL);
      try {
        xmlText = await fetchWithTimeout(proxyUrl);
        break;
      } catch (err) {
        lastErr = err;
        log(`Proxy ${i + 1} failed: ${err.message}`, 'warn');
      }
    }
    if (!xmlText) throw lastErr;

    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const nodes = xml.querySelectorAll('item');
    return Array.from(nodes).map(node => ({
      title: node.querySelector('title')?.textContent?.trim() || 'No title',
      link: node.querySelector('link')?.textContent?.trim() || '',
      pubDate: node.querySelector('pubDate')?.textContent?.trim() || '',
      desc: node.querySelector('description')?.textContent?.trim() || '',
      cat: detectCategory(node.querySelector('link')?.textContent?.trim()),
      source: 'rss',
      detectedAt: new Date().toISOString()
    }));
  };

  const scrapeCategory = async (cfg) => {
    const url = `${SEBI_BASE}/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=${cfg.ssid}&smid=0`;
    let html;
    try {
      html = await fetchViaProxy(url);
    } catch (err) {
      log(`Scrape failed [${cfg.label}]: ${err.message}`, 'err');
      return [];
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll('table tr');
    const results = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;
      const linkEl = cells[1]?.querySelector('a') || cells[0]?.querySelector('a');
      if (!linkEl) return;
      let href = linkEl.getAttribute('href') || '';
      if (!href.startsWith('http')) href = SEBI_BASE + (href.startsWith('/') ? '' : '/') + href;
      const year = cells[0]?.textContent?.trim() || '';
      results.push({
        title: linkEl.textContent?.trim(),
        link: href,
        pubDate: year, // Keep the raw string from the year column
        desc: linkEl.textContent?.trim(),
        cat: cfg.cat,
        source: 'scrape',
        detectedAt: new Date().toISOString()
      });
    });
    return results;
  };

  const fetchViaProxy = async (target) => {
    for (const p of CORS_PROXIES) {
      try { return await fetchWithTimeout(p(target)); } catch(e) {}
    }
    throw new Error('All proxies failed');
  };

  const decodeBase64ToArrayBuffer = (base64) => {
    const cleaned = (base64 || '').replace(/\s+/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  // Normalizes PDF responses across local proxy (binary) and Netlify (possible base64 text).
  const fetchPdfArrayBuffer = async (pdfUrl) => {
    let lastErr = null;
    for (const makeProxy of CORS_PROXIES) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 22000);
        const res = await fetch(makeProxy(pdfUrl), { cache: 'no-store', signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();

        const rawBuffer = await res.arrayBuffer();
        const textPrefix = new TextDecoder('ascii').decode(rawBuffer.slice(0, 32));
        if (textPrefix.startsWith(PDF_SIGNATURE)) {
          debugLog('Proxy returned raw PDF bytes.', { pdfUrl, contentType, size: rawBuffer.byteLength });
          return rawBuffer;
        }

        const fullText = new TextDecoder('ascii').decode(rawBuffer).trim();
        if (fullText.startsWith('JVBERi0')) {
          const decoded = decodeBase64ToArrayBuffer(fullText);
          debugLog('Proxy returned base64 PDF payload.', { pdfUrl, contentType, encodedSize: fullText.length, decodedSize: decoded.byteLength });
          return decoded;
        }

        throw new Error(`Unexpected PDF payload. content-type=${contentType || 'unknown'} prefix=${textPrefix.slice(0, 20)}`);
      } catch (err) {
        lastErr = err;
        debugLog('PDF fetch attempt failed.', { pdfUrl, error: err.message }, 'warn');
      }
    }
    throw lastErr || new Error('Failed to fetch PDF.');
  };

  const resolvePdfUrl = async (detailLink) => {
    try {
      const html = await fetchViaProxy(detailLink);
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const iframeEl = doc.querySelector('iframe[src*="sebi_data"]');
      if (iframeEl) {
        const src = iframeEl.getAttribute('src') || '';
        const fm = src.match(/[?&]file=([^&]+)/);
        if (fm) {
          const filePath = decodeURIComponent(fm[1]);
          return filePath.startsWith('http') ? filePath : SEBI_BASE + filePath;
        }
      }

      const pdfA = doc.querySelector('a[href$=".pdf"]');
      if (pdfA) {
        const href = pdfA.getAttribute('href');
        return href.startsWith('http') ? href : SEBI_BASE + href;
      }
    } catch (e) {}

    const m = detailLink.match(/\/([a-z]+-\d{4})\/[^/]*_(\d+)\.html$/i);
    return m ? `${SEBI_BASE}/sebi_data/attachdocs/${m[1]}/${m[2]}.pdf` : null;
  };

  const handleViewPdf = async (item) => {
    if (modal.blobUrl) URL.revokeObjectURL(modal.blobUrl);
    setModal({ isOpen: true, item, blobUrl: null, error: null, loading: true, loadingText: 'Fetching detail page...' });

    try {
      const pdfUrl = await resolvePdfUrl(item.link);
      if (!pdfUrl) throw new Error('Could not find PDF link on page.');

      setModal(prev => ({ ...prev, loadingText: 'Downloading PDF...' }));
      
      const buf = await fetchPdfArrayBuffer(pdfUrl);
      const blob = new Blob([buf], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setModal(prev => ({ ...prev, blobUrl, loading: false }));
    } catch (err) {
      setModal(prev => ({ ...prev, error: err.message, loading: false }));
      log(`PDF Error: ${err.message}`, 'err');
    }
  };

  const closeModal = () => {
    if (modal.blobUrl) URL.revokeObjectURL(modal.blobUrl);
    setModal({ isOpen: false, item: null, blobUrl: null, error: null, loading: false, loadingText: '' });
  };

  const detectCategory = (link) => {
    if (!link) return 'other';
    const p = link.toLowerCase();
    if (p.includes('/legal/acts')) return 'acts';
    if (p.includes('/legal/rules')) return 'rules';
    if (p.includes('/legal/regulations')) return 'regulations';
    if (p.includes('/legal/guidelines')) return 'guidelines';
    if (p.includes('/legal/circulars')) return 'circulars';
    if (p.includes('/legal/master')) return 'master-circulars';
    if (p.includes('/legal/general')) return 'general-orders';
    if (p.includes('/legal/gazette')) return 'gazette';
    if (p.includes('/legal/')) return 'legal';
    return 'other';
  };

  // ---------- AIF Background Scanner ----------

  const matchesAny = (toSection, terms) =>
    terms.some(t => t.trim().length > 0 && toSection.toLowerCase().includes(t.trim().toLowerCase()));

  const scanItemForAIF = useCallback(async (item, searchTerms) => {
    setScanningCount(prev => prev + 1);
    try {
      const pdfUrl = await resolvePdfUrl(item.link);
      if (!pdfUrl) {
        debugLog('Could not resolve PDF URL for item.', { title: item.title, link: item.link }, 'warn');
        return;
      }

      const arrayBuffer = await fetchPdfArrayBuffer(pdfUrl);
      debugLog('Running To-section extraction.', { title: item.title, pdfUrl, size: arrayBuffer.byteLength });

      const toSection = await extractToSection(arrayBuffer);
      const matched = toSection ? matchesAny(toSection, searchTerms) : false;
      debugLog('To-section extraction completed.', {
        title: item.title,
        matched,
        toLength: toSection ? toSection.length : 0,
        preview: toSection ? toSection.substring(0, 160) : 'NO_TO_SECTION_FOUND',
      });
      if (matched) log(`Match found in "To": ${item.title.substring(0, 60)}`, 'new');
      setItems(prev => prev.map(i =>
        i.link === item.link ? { ...i, toSection: toSection || '', aifTagged: matched } : i
      ));
    } catch (e) {
      debugLog('Background scan failed.', { title: item.title, link: item.link, error: e.message }, 'err');
    }
    finally { setScanningCount(prev => prev - 1); }
  }, [debugLog, log]);

  const processNewItemsForAIF = useCallback((newItems, searchTerms) => {
    newItems.forEach(item => scanItemForAIF(item, searchTerms));
  }, [scanItemForAIF]);

  // Re-evaluate aifTagged for already-scanned items when terms list changes
  useEffect(() => {
    setItems(prev => prev.map(item => {
      if (item.toSection === undefined) return item;
      return { ...item, aifTagged: matchesAny(item.toSection, toSearchTerms) };
    }));
  }, [toSearchTerms]);

  // ---------- Core Logic ----------

  const doCheck = async () => {
    setChecksRun(prev => prev + 1);
    try {
      const [rss, scrapedSettled] = await Promise.all([
        fetchRSS().catch(e => { log(`RSS Error: ${e.message}`, 'err'); return []; }),
        Promise.allSettled(SCRAPE_CATEGORIES.map(c => scrapeCategory(c)))
      ]);

      const scraped = scrapedSettled
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      const combined = [...rss, ...scraped].filter(i => !EXCLUDED_CATS.has(i.cat));
      
      setItems(prevItems => {
        const newKnown = new Set(knownLinks);
        const newFound = [];
        const updatedItems = [...prevItems];

        combined.forEach(item => {
          if (!newKnown.has(item.link)) {
            newKnown.add(item.link);
            const isNew = !isFirstRunRef.current;
            const newItem = { ...item, isNew };
            updatedItems.unshift(newItem);
            if (isNew) {
              newFound.push(newItem);
              log(`NEW: ${item.title.substring(0, 60)}...`, 'new');
            }
          }
        });

        if (newFound.length > 0) {
          setNewCount(prev => prev + newFound.length);
          setToast({ title: `${newFound.length} New Items`, text: newFound[0].title });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("SEBI Update", { body: `${newFound.length} new items found.` });
          }
          processNewItemsForAIF(newFound, toSearchTerms);
        }

        setKnownLinks(newKnown);
        isFirstRunRef.current = false;
        return updatedItems;
      });

      log('Check completed.', 'info');
    } catch (err) {
      log(`Check failed: ${err.message}`, 'err');
    }
    
    if (isRunning) {
      scheduleNext();
    }
  };

  const scheduleNext = () => {
    const delay = getMsUntil(checkTime);
    setCountdownSec(Math.floor(delay / 1000));
    setTotalCycleSec(Math.floor(delay / 1000));
    
    timeoutIdRef.current = setTimeout(doCheck, delay);
    
    clearInterval(countdownIdRef.current);
    countdownIdRef.current = setInterval(() => {
      setCountdownSec(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const startPolling = () => {
    if (isRunning) return;
    setIsRunning(true);
    log(`Scheduling next check for ${checkTime}.`, 'info');
    scheduleNext();
  };

  const stopPolling = () => {
    setIsRunning(false);
    clearTimeout(timeoutIdRef.current);
    clearInterval(countdownIdRef.current);
    setCountdownSec(0);
    log('Monitoring stopped.', 'info');
  };

  const clearAll = () => {
    setItems([]);
    setKnownLinks(new Set());
    setNewCount(0);
    setChecksRun(0);
    setLogs([]);
    isFirstRunRef.current = true;
    log('All data cleared.', 'info');
  };

  // Filtered view
  const filteredItems = items.filter(it => {
    if (filterCat !== 'all' && it.cat !== filterCat) return false;
    if (filterNewOnly && !it.isNew) return false;
    if (!filterScraped && it.source === 'scrape') return false;
    if (filterSearch && !it.title.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    if (filterMatchedOnly && !it.aifTagged) return false;
    return true;
  });

  const legalCount = items.filter(i => i.cat !== 'other').length;

  return (
    <div className="dashboard-layout">
      {/* Sidebar Area */}
      <aside className="sidebar">
        <Header
          isRunning={isRunning}
          onStart={startPolling}
          onStop={stopPolling}
          onCheckNow={doCheck}
          onClear={clearAll}
          lastChecked={checksRun > 0 ? new Date().toLocaleTimeString() : null}
          toSearchTerms={toSearchTerms}
          onToSearchTermsChange={setToSearchTerms}
        />


        <LogBox logs={logs} />
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <FilterBar
          filterCat={filterCat} setFilterCat={setFilterCat}
          filterSearch={filterSearch} setFilterSearch={setFilterSearch}
          filterNewOnly={filterNewOnly} setFilterNewOnly={setFilterNewOnly}
          filterScraped={filterScraped} setFilterScraped={setFilterScraped}
          filterMatchedOnly={filterMatchedOnly} setFilterMatchedOnly={setFilterMatchedOnly}
          checkTime={checkTime} setCheckTime={setCheckTime}
        />
        <ScanProgress count={scanningCount} />
        <ProgressBar countdownSec={countdownSec} totalSec={totalCycleSec} />

        <section className="feed-section">
          <header className="section-header">
            <h2 className="section-title">📋 Feed Items ({filteredItems.length})</h2>
            <div className="source-legend">
              <span className="dot rss"></span> RSS (Blue Outline)
              <span className="dot scrape"></span> Scraped (Yellow Outline)
            </div>
          </header>
          
          <div id="feed-list">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => <FeedItem key={item.link} item={item} onViewPdf={handleViewPdf} />)
            ) : (
              <div className="empty-state">
                <div className="big-icon">📡</div>
                <p>No items found. Click <strong>Check Now</strong> to fetch data.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <PdfModal 
        isOpen={modal.isOpen}
        item={modal.item}
        blobUrl={modal.blobUrl}
        error={modal.error}
        loading={modal.loading}
        loadingText={modal.loadingText}
        onClose={closeModal}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
