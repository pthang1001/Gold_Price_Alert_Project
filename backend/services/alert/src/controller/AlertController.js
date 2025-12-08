const AlertService = require('../services/alertService');
const { logger } = require('../config/logger');
const Joi = require('joi');

class AlertController {
  /**
   * POST /alerts - Create alert
   */
  static async createAlert(req, res, next) {
    try {
      const schema = Joi.object({
        minPrice: Joi.number().min(0).optional(),
        maxPrice: Joi.number().min(0).optional()
      }).or('minPrice', 'maxPrice');

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const userId = req.user?.id || 'test-user'; // TODO: Get from JWT token
      const alert = await AlertService.createAlert(userId, value);

      res.status(201).json({
        success: true,
        data: alert
      });
    } catch (error) {
      logger.error('Error creating alert:', error);
      next(error);
    }
  }

  /**
   * GET /alerts - Get all user alerts
   */
  static async getUserAlerts(req, res, next) {
    try {
      const userId = req.user?.id || 'test-user'; // TODO: Get from JWT token
      const { page = 1, limit = 10 } = req.query;

      const userAlerts = await AlertService.getUserAlerts(userId);

      res.status(200).json({
        success: true,
        data: userAlerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userAlerts.length
        }
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      next(error);
    }
  }

  /**
   * GET /alerts/:id - Get alert detail
   */
  static async getAlertDetail(req, res, next) {
    try {
      const { id } = req.params;
      const alert = await AlertService.getAlertById(parseInt(id));

      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      logger.error('Error fetching alert:', error);
      next(error);
    }
  }

  /**
   * PUT /alerts/:id - Update alert
   */
  static async updateAlert(req, res, next) {
    try {
      const { id } = req.params;
      const schema = Joi.object({
        minPrice: Joi.number().min(0).optional(),
        maxPrice: Joi.number().min(0).optional(),
        status: Joi.string().valid('active', 'paused').optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const alert = await AlertService.updateAlert(parseInt(id), value);

      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      logger.error('Error updating alert:', error);
      next(error);
    }
  }

  /**
   * DELETE /alerts/:id - Delete alert
   */
  static async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const alert = await AlertService.deleteAlert(parseInt(id));

      res.status(200).json({
        success: true,
        data: alert,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      next(error);
    }
  }

  /**
   * GET /alerts/history - Get alert trigger history
   */
  static async getAlertHistory(req, res, next) {
    try {
      const userId = req.user?.id || 'test-user'; // TODO: Get from JWT token
      const { limit = 10 } = req.query;

      const history = await AlertService.getAlertHistory(userId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error fetching alert history:', error);
      next(error);
    }
  }
}

module.exports = AlertController;
