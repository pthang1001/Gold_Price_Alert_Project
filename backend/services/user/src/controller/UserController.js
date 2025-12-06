const UserService = require('../services/UserService');
const logger = require('../middleware/logger');

class UserController {
  /**
   * POST /users/profile
   * Create user profile
   */
  static async createProfile(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await UserService.createUserProfile(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: profile
      });

      logger.info(`Profile created for user: ${userId}`);
    } catch (error) {
      logger.error(`Create profile error: ${error.message}`);
      next(error);
    }
  }

  /**
   * GET /users/profile
   * Get user profile
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const profile = await UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      next(error);
    }
  }

  /**
   * PUT /users/profile
   * Update user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const updated = await UserService.updateUserProfile(userId, req.body);

      res.status(200).json({
        success: true,
        data: updated
      });

      logger.info(`Profile updated for user: ${userId}`);
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      next(error);
    }
  }

  /**
   * GET /users/preferences
   * Get user preferences
   */
  static async getPreferences(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const preferences = await UserService.getUserPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      logger.error(`Get preferences error: ${error.message}`);
      next(error);
    }
  }

  /**
   * PUT /users/preferences
   * Update user preferences
   */
  static async updatePreferences(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const updated = await UserService.updateUserPreferences(userId, req.body);

      res.status(200).json({
        success: true,
        data: updated
      });

      logger.info(`Preferences updated for user: ${userId}`);
    } catch (error) {
      logger.error(`Update preferences error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /users/change-password
   * Change user password
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];
      const { old_password, new_password } = req.body;

      if (!userId || !old_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const result = await UserService.changePassword(userId, old_password, new_password);

      res.status(200).json({
        success: true,
        message: result.message || 'Password changed successfully'
      });

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      next(error);
    }
  }

  /**
   * DELETE /users/account
   * Request account deletion (7 day grace period)
   */
  static async requestAccountDeletion(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];
      const email = req.user?.email || req.headers['x-user-email'];

      if (!userId || !email) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await UserService.requestAccountDeletion(userId, email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });

      logger.info(`Account deletion requested for user: ${userId}`);
    } catch (error) {
      logger.error(`Request deletion error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /users/account/restore
   * Cancel account deletion
   */
  static async cancelAccountDeletion(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await UserService.cancelAccountDeletion(userId);

      res.status(200).json({
        success: true,
        message: result.message
      });

      logger.info(`Account deletion cancelled for user: ${userId}`);
    } catch (error) {
      logger.error(`Cancel deletion error: ${error.message}`);
      next(error);
    }
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * GET /users
   * Admin: List all users
   */
  static async listUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;

      const result = await UserService.listUsers(page, limit, search);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`List users error: ${error.message}`);
      next(error);
    }
  }

  /**
   * GET /users/:userId
   * Admin: Get user details
   */
  static async getUserDetails(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await UserService.adminGetUserDetails(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Get user details error: ${error.message}`);
      next(error);
    }
  }

  /**
   * PUT /users/:userId
   * Admin: Update user
   */
  static async updateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await UserService.adminUpdateUser(userId, req.body);

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info(`User updated by admin: ${userId}`);
    } catch (error) {
      logger.error(`Update user error: ${error.message}`);
      next(error);
    }
  }

  /**
   * PATCH /users/:userId/activate
   * Admin: Activate user
   */
  static async activateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await UserService.adminActivateUser(userId);

      res.status(200).json({
        success: true,
        message: 'User activated',
        data: result
      });

      logger.info(`User activated by admin: ${userId}`);
    } catch (error) {
      logger.error(`Activate user error: ${error.message}`);
      next(error);
    }
  }

  /**
   * PATCH /users/:userId/deactivate
   * Admin: Deactivate user
   */
  static async deactivateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await UserService.adminDeactivateUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deactivated',
        data: result
      });

      logger.info(`User deactivated by admin: ${userId}`);
    } catch (error) {
      logger.error(`Deactivate user error: ${error.message}`);
      next(error);
    }
  }

  /**
   * DELETE /users/:userId
   * Admin: Delete user
   */
  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await UserService.adminDeleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deleted',
        data: result
      });

      logger.info(`User deleted by admin: ${userId}`);
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = UserController;
