// SEBI Monitor — local proxy server
// Requires Node.js 18+ (uses built-in fetch)
// Usage:  node server.js
// Then set USE_LOCAL_PROXY = true in index.html

const http = require('http');
const { URL } = require('url');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers — allow the local HTML file to call this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const reqUrl  = new URL(req.url, `http://localhost:${PORT}`);
  const target  = reqUrl.searchParams.get('url');

  if (!target) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing ?url= parameter');
    return;
  }

  // Basic allowlist — only proxy sebi.gov.in
  if (!target.startsWith('https://www.sebi.gov.in/')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Only sebi.gov.in URLs are allowed');
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':           'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language':  'en-IN,en-GB;q=0.9,en;q=0.8',
        'Accept-Encoding':  'gzip, deflate, br',
        'Referer':          'https://www.sebi.gov.in/',
        'Origin':           'https://www.sebi.gov.in',
        'Cache-Control':    'no-cache',
        'Pragma':           'no-cache',
        'DNT':              '1',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua':        '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest':   'document',
        'sec-fetch-mode':   'navigate',
        'sec-fetch-site':   'same-origin',
        'sec-fetch-user':   '?1',
      },
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer      = Buffer.from(await upstream.arrayBuffer());

    // Forward 530/5xx from Cloudflare as 503 so the client can distinguish
    const status = upstream.status === 530 ? 503 : upstream.status;
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(buffer);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Upstream error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`SEBI proxy running at http://localhost:${PORT}`);
  console.log('Set USE_LOCAL_PROXY = true in index.html, then reload the page.');
});
