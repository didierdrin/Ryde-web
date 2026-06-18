const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Dev-only proxy when REACT_APP_API_URL is unset and api.js uses relative `/api`.
 * Run ryde-backend on port 3000 and ryde-web on 3001:
 *   set PORT=3001 && npm start
 */
module.exports = function (app) {
  const target = process.env.BACKEND_PROXY_TARGET || 'http://localhost:3000';
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
