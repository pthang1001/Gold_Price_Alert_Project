const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { logger } = require('./config/logger');
const priceRoutes = require('./routes');
const { initializePriceJobs } = require('./jobs/priceJobs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/prices', priceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: process.env.SERVICE_NAME || 'Price Service',
    timestamp: new Date()
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, async () => {
  logger.info(`✅ ${process.env.SERVICE_NAME || 'Price Service'} running on port ${PORT}`);
  
  // Initialize background jobs
  try {
    await initializePriceJobs();
    logger.info('✅ Price jobs initialized');
  } catch (error) {
    logger.error('Failed to initialize price jobs:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
