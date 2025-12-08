const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { logger } = require('./config/logger');
const alertRoutes = require('./routes');
const { initializeAlertListeners } = require('./jobs/alertJobs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: process.env.SERVICE_NAME || 'Alert Service',
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

const PORT = process.env.PORT || 3004;

const server = app.listen(PORT, async () => {
  logger.info(`✅ ${process.env.SERVICE_NAME || 'Alert Service'} running on port ${PORT}`);
  
  // Initialize alert listeners
  try {
    await initializeAlertListeners();
    logger.info('✅ Alert listeners initialized');
  } catch (error) {
    logger.error('Failed to initialize alert listeners:', error);
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
