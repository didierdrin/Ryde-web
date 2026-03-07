const BACKEND = process.env.RAILWAY_API_URL || 'https://ryde-backend-production-1fd1.up.railway.app';

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const path = req.query.path;
  if (!path) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const qs = { ...req.query };
  delete qs.path;
  const queryString = Object.keys(qs).length
    ? '?' + new URLSearchParams(qs).toString()
    : '';
  const backendUrl = `${BACKEND}/api/${path}${queryString}`;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await getRawBody(req);
  }

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const contentType = backendRes.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(backendRes.status);
    const text = await backendRes.text();
    res.send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', message: 'Backend unavailable' });
  }
};
