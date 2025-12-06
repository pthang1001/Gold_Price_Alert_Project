const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();

// Middleware - IMPORTANT: Proxies must come BEFORE express.json() or they will receive an empty stream
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('combined'));

// Proxy routes BEFORE body parsing
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/user', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/price', createProxyMiddleware({
  target: process.env.PRICE_SERVICE_URL || 'http://price-service:3003',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/alert', createProxyMiddleware({
  target: process.env.ALERT_SERVICE_URL || 'http://alert-service:3004',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/email', createProxyMiddleware({
  target: process.env.EMAIL_SERVICE_URL || 'http://email-service:3005',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/notification', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/admin', createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3007',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

app.use('/logging', createProxyMiddleware({
  target: process.env.LOGGING_SERVICE_URL || 'http://logging-service:3008',
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  logger: console
}));

// Body parsing AFTER proxies
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



