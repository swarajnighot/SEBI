// Netlify serverless function — replaces server.cjs for production
// Proxies requests to sebi.gov.in, bypassing CORS and X-Frame-Options restrictions

exports.handler = async (event) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    const base64Body = Buffer.from(buffer).toString('base64');

    return {
      statusCode: response.status,
      headers: { ...CORS_HEADERS, 'Content-Type': contentType },
      body: base64Body,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 502, headers: CORS_HEADERS, body: `Upstream error: ${err.message}` };
  }
};
