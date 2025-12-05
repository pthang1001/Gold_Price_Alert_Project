const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date()
  });
});

// Service proxy configuration
const serviceProxies = {
  auth: httpProxy.createProxyServer({ target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001' }),
  user: httpProxy.createProxyServer({ target: process.env.USER_SERVICE_URL || 'http://user-service:3002' }),
  price: httpProxy.createProxyServer({ target: process.env.PRICE_SERVICE_URL || 'http://price-service:3003' }),
  alert: httpProxy.createProxyServer({ target: process.env.ALERT_SERVICE_URL || 'http://alert-service:3004' }),
  email: httpProxy.createProxyServer({ target: process.env.EMAIL_SERVICE_URL || 'http://email-service:3005' }),
  notification: httpProxy.createProxyServer({ target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006' }),
  admin: httpProxy.createProxyServer({ target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3007' }),
  logging: httpProxy.createProxyServer({ target: process.env.LOGGING_SERVICE_URL || 'http://logging-service:3008' })
};

// Error handler for proxies
Object.values(serviceProxies).forEach((proxy) => {
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({ success: false, message: 'Service unavailable', error: err.message });
  });
});

// Routes
app.use('/auth', require('./routes'));
app.use('/user', require('./routes'));
app.use('/price', require('./routes'));
app.use('/alert', require('./routes'));
app.use('/email', require('./routes'));
app.use('/notification', require('./routes'));
app.use('/admin', require('./routes'));
app.use('/logging', require('./routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on port ${PORT}`);
});

module.exports = app;
