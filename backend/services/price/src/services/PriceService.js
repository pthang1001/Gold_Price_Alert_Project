const axios = require('axios');
const redisClient = require('../config/redis');
const { publishEvent } = require('../config/rabbitmq');
const { logger } = require('../config/logger');

const GOLD_PRICE_API = 'https://api.metals.live/v1/spot/gold';
const CACHE_KEY = 'current_gold_price';
const CACHE_DURATION = 300; // 5 minutes

class PriceService {
  /**
   * Fetch current gold price from external API
   */
  static async fetchCurrentPrice() {
    try {
      // Check cache first
      const cachedPrice = await redisClient.get(CACHE_KEY);
      if (cachedPrice) {
        logger.info('💾 Price from cache');
        return JSON.parse(cachedPrice);
      }

      // Fetch from API
      const response = await axios.get(GOLD_PRICE_API, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Gold Price Alert Service'
        }
      });

      const priceData = {
        price: response.data.gold,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'metals.live'
      };

      // Cache the price
      await redisClient.setex(CACHE_KEY, CACHE_DURATION, JSON.stringify(priceData));
      logger.info('✅ Gold price fetched and cached:', priceData);

      // Publish event
      await publishEvent('prices', 'price.updated', priceData);

      return priceData;
    } catch (error) {
      logger.error('❌ Error fetching gold price:', error.message);
      throw error;
    }
  }

  /**
   * Get cached current price
   */
  static async getCurrentPrice() {
    try {
      const cachedPrice = await redisClient.get(CACHE_KEY);
      if (cachedPrice) {
        return JSON.parse(cachedPrice);
      }
      
      // If cache expired, fetch fresh
      return await this.fetchCurrentPrice();
    } catch (error) {
      logger.error('❌ Error getting current price:', error);
      throw error;
    }
  }

  /**
   * Invalidate price cache
   */
  static async invalidateCache() {
    try {
      await redisClient.del(CACHE_KEY);
      logger.info('♻️ Price cache invalidated');
    } catch (error) {
      logger.error('❌ Error invalidating cache:', error);
    }
  }
}

module.exports = PriceService;
