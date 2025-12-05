const express = require('express');
const httpProxy = require('http-proxy');

const router = express.Router();

// Create proxy instances for each service
const proxies = {
  auth: httpProxy.createProxyServer({ target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001' }),
  user: httpProxy.createProxyServer({ target: process.env.USER_SERVICE_URL || 'http://user-service:3002' }),
  price: httpProxy.createProxyServer({ target: process.env.PRICE_SERVICE_URL || 'http://price-service:3003' }),
  alert: httpProxy.createProxyServer({ target: process.env.ALERT_SERVICE_URL || 'http://alert-service:3004' }),
  email: httpProxy.createProxyServer({ target: process.env.EMAIL_SERVICE_URL || 'http://email-service:3005' }),
  notification: httpProxy.createProxyServer({ target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006' }),
  admin: httpProxy.createProxyServer({ target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3007' }),
  logging: httpProxy.createProxyServer({ target: process.env.LOGGING_SERVICE_URL || 'http://logging-service:3008' })
};

// Determine which service based on route
router.all('*', (req, res, next) => {
  const service = req.baseUrl.split('/')[1]; // Get service name from URL
  const proxy = proxies[service];

  if (!proxy) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }

  // Forward request with /api prefix
  req.url = '/api' + req.url;
  proxy.web(req, res);
});

// Error handling
Object.values(proxies).forEach((proxy) => {
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({ success: false, message: 'Service unavailable' });
  });
});

module.exports = router;
