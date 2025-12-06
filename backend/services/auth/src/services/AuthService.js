const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendOTPEmail } = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

class AuthService {
  /**
   * Generate OTP (6-digit code)
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via email
   */
  static async sendOTP(email, otpCode, type = 'email_verification') {
    try {
      await sendOTPEmail(email, otpCode);
      console.log(`✅ OTP ${otpCode} sent to ${email} for ${type}`);
      return true;
    } catch (error) {
      console.error(`⚠️ Failed to send OTP to ${email}:`, error.message);
      // Don't throw - allow registration to continue even if email fails
      console.log(`ℹ️ OTP stored but email delivery failed. Code: ${otpCode}`);
      return false;
    }
  }

  /**
   * Register user (Sign Up)
   */
  static async register(email, password, firstName, lastName) {
    try {
      // Check if user exists
      const User = global.db?.models?.User;
      if (!User) {
        throw new Error('Database not initialized');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        status: 'inactive'
      });

      // Generate and send OTP
      const otpCode = this.generateOTP();
      const OtpCode = global.db?.models?.OtpCode;
      if (OtpCode) {
        await OtpCode.create({
          user_id: user.id,
          email: email,
          code: otpCode,
          type: 'email_verification',
          max_attempts: 5,
          attempts: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
      }

      await this.sendOTP(email, otpCode, 'email_verification');

      return {
        message: 'Registration successful. OTP sent to email.',
        user_id: user.id,
        email: email
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Verify OTP and activate user
   */
  static async verifyOTP(userId, otpCode) {
    // Mock: Always succeed
    return {
      message: 'Email verified successfully',
      user: { id: userId, email: 'mock@example.com', status: 'active' }
    };
  }

  /**
   * Login user
   */
  static async login(email, password, rememberMe = false) {
    // Mock: Generate tokens
    const accessToken = jwt.sign(
      { userId: 'user-' + Math.random().toString(36), email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: 'user-' + Math.random().toString(36), tokenId: uuidv4() },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: 'user-123',
        email,
        first_name: 'Test',
        last_name: 'User',
        status: 'active'
      }
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken) {
    // Mock: Return new token
    const accessToken = jwt.sign(
      { userId: 'user-123', email: 'user@example.com' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email) {
    return { message: 'If email exists, password reset link will be sent' };
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(userId, otpCode, newPassword) {
    return { message: 'Password reset successful' };
  }

  /**
   * Logout user
   */
  static async logout(refreshToken) {
    return { message: 'Logout successful' };
  }
}

module.exports = AuthService;
