const { publishEvent } = require('../config/rabbitmq');
const { logger } = require('../config/logger');

// In-memory store for alerts (should be replaced with database)
let alerts = [];
let alertId = 1;

class AlertService {
  /**
   * Create new alert
   */
  static async createAlert(userId, alertData) {
    try {
      const alert = {
        id: alertId++,
        userId,
        minPrice: alertData.minPrice,
        maxPrice: alertData.maxPrice,
        status: 'active',
        lastTriggered: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      alerts.push(alert);
      logger.info(`✅ Alert created:`, alert);

      return alert;
    } catch (error) {
      logger.error('❌ Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Get all alerts for a user
   */
  static async getUserAlerts(userId) {
    try {
      const userAlerts = alerts.filter(a => a.userId === userId);
      logger.info(`Retrieved ${userAlerts.length} alerts for user ${userId}`);
      return userAlerts;
    } catch (error) {
      logger.error('❌ Error fetching user alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(alertId) {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }
      return alert;
    } catch (error) {
      logger.error('❌ Error fetching alert:', error);
      throw error;
    }
  }

  /**
   * Update alert
   */
  static async updateAlert(alertId, updateData) {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      Object.assign(alert, updateData, { updatedAt: new Date().toISOString() });
      logger.info(`✅ Alert updated:`, alert);

      return alert;
    } catch (error) {
      logger.error('❌ Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Delete alert (soft delete)
   */
  static async deleteAlert(alertId) {
    try {
      const index = alerts.findIndex(a => a.id === alertId);
      if (index === -1) {
        throw new Error('Alert not found');
      }

      const alert = alerts[index];
      alert.status = 'deleted';
      alert.deletedAt = new Date().toISOString();
      logger.info(`✅ Alert soft deleted:`, alert);

      return alert;
    } catch (error) {
      logger.error('❌ Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * Check if price triggers alerts
   */
  static async checkAndTriggerAlerts(currentPrice) {
    try {
      const triggeredAlerts = [];

      for (const alert of alerts) {
        if (alert.status !== 'active') continue;

        const isPriceTriggered = 
          (alert.minPrice && currentPrice <= alert.minPrice) ||
          (alert.maxPrice && currentPrice >= alert.maxPrice);

        if (isPriceTriggered) {
          // Check deduplication (don't trigger within 5 minutes)
          const now = new Date();
          const lastTriggered = alert.lastTriggered ? new Date(alert.lastTriggered) : null;
          const timeSinceLastTrigger = lastTriggered ? (now - lastTriggered) / 1000 / 60 : null;

          if (!timeSinceLastTrigger || timeSinceLastTrigger >= 5) {
            // Update last triggered time
            alert.lastTriggered = now.toISOString();

            // Publish alert_triggered event
            await publishEvent('alerts', 'alert.triggered', {
              alertId: alert.id,
              userId: alert.userId,
              currentPrice,
              minPrice: alert.minPrice,
              maxPrice: alert.maxPrice,
              triggeredAt: now.toISOString()
            });

            triggeredAlerts.push(alert);
            logger.info(`🔔 Alert triggered:`, alert);
          }
        }
      }

      return triggeredAlerts;
    } catch (error) {
      logger.error('❌ Error checking alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert history
   */
  static async getAlertHistory(userId, limit = 10) {
    try {
      // TODO: Implement with database
      return {
        userId,
        history: [],
        message: 'Alert history feature coming soon'
      };
    } catch (error) {
      logger.error('❌ Error fetching alert history:', error);
      throw error;
    }
  }
}

module.exports = AlertService;
