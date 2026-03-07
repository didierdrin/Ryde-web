const BACKEND = (process.env.RAILWAY_API_URL || 'https://ryde-backend-production-1fd1.up.railway.app').replace(/\/+$/, '');
const FETCH_TIMEOUT_MS = 25000;

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Body read timeout')), 5000);
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function getRequestBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body;
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'object') return JSON.stringify(req.body);
    return String(req.body);
  }
  if (req.method === 'GET' || req.method === 'HEAD') return null;
  return getRawBody(req);
}

function getPathFromRequest(req) {
  let path = req.query && req.query.path;
  if (Array.isArray(path)) path = path.join('/');
  if (path && typeof path === 'string') return path;
  if (req.url) {
    try {
      const idx = req.url.indexOf('?');
      const query = idx >= 0 ? req.url.slice(idx) : '';
      const params = new URLSearchParams(query);
      path = params.get('path');
      if (path) return path;
    } catch (_) {}
  }
  return null;
}

module.exports = async function handler(req, res) {
  const path = getPathFromRequest(req);
  if (!path || path.length === 0) {
    res.status(400).json({ error: 'Missing path', query: req.query, url: req.url });
    return;
  }

  const qs = { ...req.query };
  delete qs.path;
  const queryString = Object.keys(qs).length
    ? '?' + new URLSearchParams(qs).toString()
    : '';
  const backendUrl = `${BACKEND}/api/${path}${queryString}`;

  let body = null;
  try {
    body = await getRequestBody(req);
  } catch (e) {
    console.error('Body read error:', e.message);
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    Accept: req.headers['accept'] || 'application/json',
    'User-Agent': req.headers['user-agent'] || 'Ryde-Web-Proxy/1.0',
  };
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }
  if (body && typeof body === 'string' ? body.length > 0 : body && body.length > 0) {
    headers['Content-Length'] = String(Buffer.byteLength(body));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = backendRes.headers.get('Content-Type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(backendRes.status);
    const text = await backendRes.text();
    res.send(text);
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError' ? 'Backend timeout' : (err.message || 'Backend unavailable');
    console.error('Proxy error:', err.message || err);
    res.status(502).json({ error: 'Bad Gateway', message: msg });
  }
};
