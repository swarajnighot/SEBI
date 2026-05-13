// Netlify serverless function — CORS proxy for sebi.gov.in
// Handles text (HTML, XML) and binary (PDF).
// Netlify Functions hard-cap is 6 MB per response body. For PDFs exceeding
// that limit the proxy returns a JSON sentinel so the client can open the
// file directly in an iframe instead of buffering it through JS.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MAX_INLINE_BYTES = 5 * 1024 * 1024; // 5 MB safety margin below 6 MB cap

const isBinaryType = (contentType = '') =>
  !contentType.includes('text/') &&
  !contentType.includes('application/xml') &&
  !contentType.includes('application/xhtml') &&
  !contentType.includes('application/json');

const tooLargeResponse = (target) => ({
  statusCode: 200,
  headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  body: JSON.stringify({ __proxyTooLarge: true, directUrl: target }),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const target = event.queryStringParameters?.url;

  if (!target) {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Missing ?url= parameter' };
  }

  if (!target.startsWith('https://www.sebi.gov.in/')) {
    return { statusCode: 403, headers: CORS_HEADERS, body: 'Only sebi.gov.in URLs are allowed' };
  }

  try {
    const signal = AbortSignal.timeout(23000);

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
        'Accept': '*/*',
      },
      redirect: 'follow',
      signal,
    });

    // Pass 4xx errors through so the client can distinguish "not found" from proxy errors.
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: `SEBI returned ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    if (isBinaryType(contentType)) {
      // Bail early if Content-Length header reveals the file is too large.
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      if (contentLength > MAX_INLINE_BYTES) return tooLargeResponse(target);

      const buffer = await response.arrayBuffer();

      // Double-check after buffering (Content-Length may be absent or wrong).
      if (buffer.byteLength > MAX_INLINE_BYTES) return tooLargeResponse(target);

      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': contentType },
        body: Buffer.from(buffer).toString('base64'),
        isBase64Encoded: true,
      };
    } else {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': contentType },
        body: text,
      };
    }
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    return {
      statusCode: timedOut ? 504 : 502,
      headers: CORS_HEADERS,
      body: timedOut ? 'Proxy timeout: SEBI server took too long' : `Upstream error: ${err.message}`,
    };
  }
};
