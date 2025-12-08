const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { sendOTPEmail } = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';

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

      // Create user profile in User Service
      try {
        console.log('[Auth] Creating user profile in User Service...');
        const userServiceUrl = `${USER_SERVICE_URL}/users/profile`;
        const token = jwt.sign(
          { user_id: user.id, userId: user.id, email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRY }
        );

        await axios.post(userServiceUrl, {
          first_name: firstName,
          last_name: lastName,
          email: email
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('[Auth] ✅ User profile created in User Service');
      } catch (error) {
        console.error('[Auth] ⚠️ Failed to create user profile in User Service:', error.message);
        // Don't throw - allow registration to continue even if profile creation fails
      }

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
    try {
      const User = global.db?.models?.User;
      const OtpCode = global.db?.models?.OtpCode;

      if (!User || !OtpCode) {
        throw new Error('Database not initialized');
      }

      console.log(`[OTP Verify] Received: userId=${userId}, otpCode=${otpCode}`);

      // Find the OTP record
      const otpRecord = await OtpCode.findOne({
        where: { user_id: userId, code: otpCode, type: 'email_verification' }
      });

      console.log(`[OTP Verify] Database search - Found: ${otpRecord ? 'YES' : 'NO'}`);
      
      if (!otpRecord) {
        // Log all OTP records for this user to debug
        const allRecords = await OtpCode.findAll({
          where: { user_id: userId }
        });
        console.log(`[OTP Verify] All OTP records for user ${userId}:`, allRecords.map(r => ({ code: r.code, type: r.type, expires_at: r.expires_at })));
        throw new Error('Invalid OTP code');
      }

      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= otpRecord.max_attempts) {
        throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
      }

      // Find the user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Mark email as verified and activate account
      await user.update({
        email_verified: true,
        status: 'active'
      });

      // Delete the OTP record after successful verification
      await otpRecord.destroy();

      console.log(`✅ Email verified for user: ${user.email}`);

      // Generate tokens for immediate login
      const accessToken = jwt.sign(
        { user_id: user.id, userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      const refreshTokenRecord = global.db?.models?.RefreshToken;
      let refreshToken;
      if (refreshTokenRecord) {
        const tokenRecord = await refreshTokenRecord.create({
          user_id: user.id,
          token: uuidv4(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        refreshToken = jwt.sign(
          { user_id: user.id, tokenId: tokenRecord.id },
          REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
      } else {
        refreshToken = jwt.sign(
          { user_id: user.id, tokenId: uuidv4() },
          REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
      }

      return {
        message: 'Email verified successfully',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status
        }
      };
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  /**
   * Login user
   */
  static async login(email, password, rememberMe = false) {
    try {
      // Find user by email
      const User = global.db?.models?.User;
      if (!User) {
        throw new Error('Database not initialized');
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if email is verified and account is active
      if (user.status !== 'active') {
        throw new Error('Account is not active. Please verify your email first.');
      }

      // Generate access token with real user ID
      const accessToken = jwt.sign(
        { user_id: user.id, userId: user.id, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      // Generate refresh token
      const refreshTokenRecord = global.db?.models?.RefreshToken;
      let refreshToken;
      if (refreshTokenRecord) {
        const tokenRecord = await refreshTokenRecord.create({
          user_id: user.id,
          token: uuidv4(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        refreshToken = jwt.sign(
          { user_id: user.id, tokenId: tokenRecord.id },
          REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
      } else {
        refreshToken = jwt.sign(
          { user_id: user.id, tokenId: uuidv4() },
          REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
      }

      // Update last login
      await user.update({ last_login: new Date() });

      return {
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name || 'User',
          last_name: user.last_name || '',
          status: user.status
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshTokenJWT) {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshTokenJWT, REFRESH_TOKEN_SECRET);
      const userId = decoded.user_id;

      // Find user
      const User = global.db?.models?.User;
      if (!User) {
        throw new Error('Database not initialized');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { user_id: user.id, userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: refreshTokenJWT
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email) {
    try {
      const User = global.db?.models?.User;
      const OtpCode = global.db?.models?.OtpCode;

      if (!User || !OtpCode) {
        throw new Error('Database not initialized');
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return { message: 'If email exists, password reset OTP will be sent' };
      }

      // Generate and send OTP
      const otpCode = this.generateOTP();
      await OtpCode.create({
        user_id: user.id,
        email: email,
        code: otpCode,
        type: 'password_reset',
        max_attempts: 5,
        attempts: 0,
        expires_at: new Date(Date.now() + 15 * 60 * 1000)
      });

      await this.sendOTP(email, otpCode, 'password_reset');
      return { message: 'If email exists, password reset OTP will be sent' };
    } catch (error) {
      return { message: 'If email exists, password reset OTP will be sent' };
    }
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(userId, otpCode, newPassword) {
    try {
      const User = global.db?.models?.User;
      const OtpCode = global.db?.models?.OtpCode;

      if (!User || !OtpCode) {
        throw new Error('Database not initialized');
      }

      const otpRecord = await OtpCode.findOne({
        where: { user_id: userId, code: otpCode, type: 'password_reset' }
      });

      if (!otpRecord) {
        throw new Error('Invalid OTP code');
      }

      if (new Date() > new Date(otpRecord.expires_at)) {
        throw new Error('OTP has expired');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password_hash: hashedPassword });
      await otpRecord.destroy();

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshTokenJWT) {
    try {
      const RefreshToken = global.db?.models?.RefreshToken;
      if (!RefreshToken) {
        return { message: 'Logout successful' };
      }

      const decoded = jwt.verify(refreshTokenJWT, REFRESH_TOKEN_SECRET);
      const tokenId = decoded.tokenId;

      if (tokenId) {
        await RefreshToken.destroy({ where: { id: tokenId } });
      }

      return { message: 'Logout successful' };
    } catch (error) {
      return { message: 'Logout successful' };
    }
  }
}

module.exports = AuthService;
