const { subscribeToEvent } = require('../config/rabbitmq');
const AlertService = require('../services/AlertService');
const { logger } = require('../config/logger');

/**
 * Initialize alert listeners for RabbitMQ events
 */
const initializeAlertListeners = async () => {
  try {
    // Listen for price_updated events from Price Service
    await subscribeToEvent('prices', 'price.updated', async (priceData) => {
      try {
        logger.info('🔔 Price updated event received:', priceData);
        
        // Check all alerts against new price
        const triggeredAlerts = await AlertService.checkAndTriggerAlerts(priceData.price);
        
        if (triggeredAlerts.length > 0) {
          logger.info(`📬 ${triggeredAlerts.length} alerts triggered`);
        }
      } catch (error) {
        logger.error('Error processing price update:', error);
      }
    });

    logger.info('✅ Alert listeners initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize alert listeners:', error);
    throw error;
  }
};

module.exports = {
  initializeAlertListeners
};
