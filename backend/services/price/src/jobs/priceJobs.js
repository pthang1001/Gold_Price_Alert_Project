const Bull = require('bull');
const PriceService = require('../services/PriceService');
const { logger } = require('../config/logger');

// Create price job queue
const priceQueue = new Bull('price-updates', {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 2
  }
});

// Process price update jobs
priceQueue.process(async (job) => {
  try {
    logger.info('🔄 Processing price update job');
    const price = await PriceService.fetchCurrentPrice();
    return { success: true, price };
  } catch (error) {
    logger.error('❌ Price update job failed:', error);
    throw error;
  }
});

// Job events
priceQueue.on('completed', (job) => {
  logger.info(`✅ Price job ${job.id} completed`);
});

priceQueue.on('failed', (job, error) => {
  logger.error(`❌ Price job ${job.id} failed:`, error.message);
});

/**
 * Initialize recurring price fetch jobs
 */
const initializePriceJobs = async () => {
  try {
    // Clear existing jobs
    await priceQueue.clean(0);
    
    // Add recurring job every 10 minutes (600000 ms)
    const repeatInterval = process.env.PRICE_UPDATE_INTERVAL || 600000; // 10 minutes default
    
    await priceQueue.add(
      { task: 'fetch-price' },
      {
        repeat: {
          every: repeatInterval
        },
        removeOnComplete: true
      }
    );
    
    logger.info(`✅ Price job scheduled to run every ${repeatInterval / 1000} seconds`);
    
    // Run initial fetch
    await PriceService.fetchCurrentPrice();
  } catch (error) {
    logger.error('❌ Failed to initialize price jobs:', error);
    throw error;
  }
};

module.exports = {
  priceQueue,
  initializePriceJobs
};
