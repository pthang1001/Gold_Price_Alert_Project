const AuthService = require('../services/AuthService');
const logger = require('../middleware/logger');

class AuthController {
  /**
   * POST /auth/register
   * Register new user with email and password
   */
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await AuthService.register(email, password, firstName, lastName);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user_id: result.user_id,
          email: result.email
        }
      });

      logger.info(`User registered: ${email}`);
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/verify-otp
   * Verify OTP and activate user account
   */
  static async verifyOTP(req, res, next) {
    try {
      const { user_id, otp_code } = req.body;

      if (!user_id || !otp_code) {
        return res.status(400).json({
          success: false,
          message: 'user_id and otp_code are required'
        });
      }

      const result = await AuthService.verifyOTP(user_id, otp_code);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        }
      });

      logger.info(`OTP verified for user: ${user_id}`);
    } catch (error) {
      logger.error(`OTP verification error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login user with email and password
   */
  static async login(req, res, next) {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password, rememberMe);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        }
      });

      logger.info(`User logged in: ${email}`);
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/refresh-token
   * Refresh access token using refresh token
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/forgot-password
   * Request password reset OTP
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message
      });

      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password with OTP
   */
  static async resetPassword(req, res, next) {
    try {
      const { user_id, otp_code, new_password } = req.body;

      if (!user_id || !otp_code || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'user_id, otp_code, and new_password are required'
        });
      }

      const result = await AuthService.resetPassword(user_id, otp_code, new_password);

      res.status(200).json({
        success: true,
        message: result.message
      });

      logger.info(`Password reset for user: ${user_id}`);
    } catch (error) {
      logger.error(`Password reset error: ${error.message}`);
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Logout user
   */
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await AuthService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: result.message
      });

      logger.info('User logged out');
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = AuthController;
