// Netlify serverless function — CORS proxy for sebi.gov.in
// Handles both text (HTML, XML) and binary (PDF) responses correctly

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const isBinaryType = (contentType = '') =>
  !contentType.includes('text/') &&
  !contentType.includes('application/xml') &&
  !contentType.includes('application/xhtml') &&
  !contentType.includes('application/json');

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
    // Stay well within Netlify's 26s function timeout
    const signal = AbortSignal.timeout(23000);

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
        'Accept': '*/*',
      },
      redirect: 'follow',
      signal,
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    if (isBinaryType(contentType)) {
      // PDF / binary — encode as base64 so Netlify can transmit it
      const buffer = await response.arrayBuffer();
      return {
        statusCode: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': contentType },
        body: Buffer.from(buffer).toString('base64'),
        isBase64Encoded: true,
      };
    } else {
      // HTML / XML / text — return as plain string
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
