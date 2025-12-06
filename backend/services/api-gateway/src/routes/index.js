const express = require('express');
const httpProxy = require('http-proxy');

const router = express.Router();

// Create proxy instances for each service
const proxies = {
  auth: httpProxy.createProxyServer({ target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', changeOrigin: true }),
  user: httpProxy.createProxyServer({ target: process.env.USER_SERVICE_URL || 'http://user-service:3002', changeOrigin: true }),
  price: httpProxy.createProxyServer({ target: process.env.PRICE_SERVICE_URL || 'http://price-service:3003', changeOrigin: true }),
  alert: httpProxy.createProxyServer({ target: process.env.ALERT_SERVICE_URL || 'http://alert-service:3004', changeOrigin: true }),
  email: httpProxy.createProxyServer({ target: process.env.EMAIL_SERVICE_URL || 'http://email-service:3005', changeOrigin: true }),
  notification: httpProxy.createProxyServer({ target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006', changeOrigin: true }),
  admin: httpProxy.createProxyServer({ target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3007', changeOrigin: true }),
  logging: httpProxy.createProxyServer({ target: process.env.LOGGING_SERVICE_URL || 'http://logging-service:3008', changeOrigin: true })
};

// Determine which service based on route
router.all('*', (req, res, next) => {
  // Get service from the parent path (e.g., /auth from /auth/register)
  const baseUrlParts = req.baseUrl.split('/').filter(x => x); // Remove empty strings
  const service = baseUrlParts[0]; // First part is service name
  
  const proxy = proxies[service];

  if (!proxy) {
    console.error(`Service not found: ${service}`, 'baseUrl:', req.baseUrl, 'url:', req.url);
    return res.status(404).json({ success: false, message: `Service not found: ${service}` });
  }

  // Remove the service prefix from the path
  // e.g., /auth/register becomes /register
  const pathWithoutService = req.url.startsWith('/' + service) 
    ? req.url.slice(service.length + 1) 
    : req.url;

  console.log(`Proxying ${req.method} ${req.baseUrl}${req.url} to ${service} service as ${pathWithoutService}`);
  
  // Override req.url before proxying
  req.url = pathWithoutService;
  
  proxy.web(req, res, (error) => {
    if (error) {
      console.error('Proxy error:', error);
      res.status(503).json({ success: false, message: 'Service unavailable', error: error.message });
    }
  });
});

// Error handling
Object.values(proxies).forEach((proxy) => {
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({ success: false, message: 'Service unavailable' });
  });
});

module.exports = router;
