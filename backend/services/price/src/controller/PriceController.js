const PriceService = require('../services/PriceService');
const { logger } = require('../config/logger');

class PriceController {
  /**
   * GET /prices/current - Get current gold price
   */
  static async getCurrentPrice(req, res, next) {
    try {
      const price = await PriceService.getCurrentPrice();
      res.status(200).json({
        success: true,
        data: price
      });
    } catch (error) {
      logger.error('Error fetching current price:', error);
      next(error);
    }
  }

  /**
   * GET /prices/history - Get price history
   * Query params: days=7 (default)
   */
  static async getPriceHistory(req, res, next) {
    try {
      const { days = 7 } = req.query;
      
      // TODO: Implement price history from database
      // For now, return mock data
      res.status(200).json({
        success: true,
        data: {
          days: parseInt(days),
          prices: [],
          message: 'Price history feature coming soon'
        }
      });
    } catch (error) {
      logger.error('Error fetching price history:', error);
      next(error);
    }
  }

  /**
   * GET /prices/statistics - Get price statistics
   */
  static async getPriceStatistics(req, res, next) {
    try {
      // TODO: Implement statistics from database
      // For now, return mock data
      res.status(200).json({
        success: true,
        data: {
          min: 0,
          max: 0,
          average: 0,
          message: 'Statistics feature coming soon'
        }
      });
    } catch (error) {
      logger.error('Error fetching price statistics:', error);
      next(error);
    }
  }

  /**
   * POST /prices/refresh - Manually refresh price (for testing)
   */
  static async refreshPrice(req, res, next) {
    try {
      await PriceService.invalidateCache();
      const price = await PriceService.fetchCurrentPrice();
      
      res.status(200).json({
        success: true,
        data: price,
        message: 'Price refreshed successfully'
      });
    } catch (error) {
      logger.error('Error refreshing price:', error);
      next(error);
    }
  }
}

module.exports = PriceController;