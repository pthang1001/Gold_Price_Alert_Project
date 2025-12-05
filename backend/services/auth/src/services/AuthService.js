const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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
    // TODO: Call Email Service to send OTP
    console.log(`📧 OTP ${otpCode} sent to ${email} for ${type}`);
    return true;
  }

  /**
   * Register user (Sign Up)
   */
  static async register(email, password, firstName, lastName, db) {
    const User = db.models.User;
    const OtpCode = db.models.OtpCode;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already registered');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (inactive until email verified)
    const user = await User.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      status: 'inactive'
    });

    // Generate and save OTP
    const otp = this.generateOTP();
    await OtpCode.create({
      user_id: user.id,
      email,
      code: otp,
      type: 'email_verification',
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    });

    // Send OTP to email
    await this.sendOTP(email, otp, 'email_verification');

    return {
      message: 'Registration successful. OTP sent to email.',
      user_id: user.id,
      email: user.email
    };
  }

  /**
   * Verify OTP and activate user
   */
  static async verifyOTP(userId, otpCode) {
    const User = db.models.User;
    const OtpCode = db.models.OtpCode;

    // Find OTP
    const otp = await OtpCode.findOne({
      where: {
        user_id: userId,
        code: otpCode,
        type: 'email_verification'
      }
    });

    if (!otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > otp.expires_at) {
      throw new Error('OTP expired');
    }

    if (otp.attempts >= otp.max_attempts) {
      throw new Error('OTP attempts exceeded');
    }

    // Mark OTP as verified
    await otp.update({
      verified_at: new Date(),
      attempts: otp.attempts + 1
    });

    // Activate user
    const user = await User.update(
      { email_verified: true, status: 'active' },
      { where: { id: userId }, returning: true }
    );

    return {
      message: 'Email verified successfully',
      user: user[1][0]
    };
  }

  /**
   * Login user
   */
  static async login(email, password, rememberMe = false) {
    const User = db.models.User;
    const Session = db.models.Session;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check user status
    if (user.status === 'suspended') {
      throw new Error('Account suspended');
    }

    if (user.status === 'inactive') {
      throw new Error('Account not activated. Please verify your email.');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: uuidv4() },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await Session.create({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: expiresAt
    });

    // Update last login
    await user.update({ last_login: new Date() });

    return {
      message: 'Login successful',
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
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken) {
    const Session = db.models.Session;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      // Find session
      const session = await Session.findOne({
        where: { refresh_token: refreshToken }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      if (new Date() > session.expires_at) {
        throw new Error('Refresh token expired');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: session.user_id, email: session.user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return {
        accessToken,
        refreshToken // Return same refresh token
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email) {
    const User = db.models.User;
    const OtpCode = db.models.OtpCode;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, password reset link will be sent' };
    }

    // Generate OTP
    const otp = this.generateOTP();
    await OtpCode.create({
      user_id: user.id,
      email,
      code: otp,
      type: 'password_reset',
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 min
    });

    // Send OTP to email
    await this.sendOTP(email, otp, 'password_reset');

    return { message: 'Password reset OTP sent to email' };
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(userId, otpCode, newPassword) {
    const User = db.models.User;
    const OtpCode = db.models.OtpCode;

    // Validate password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Verify OTP
    const otp = await OtpCode.findOne({
      where: {
        user_id: userId,
        code: otpCode,
        type: 'password_reset'
      }
    });

    if (!otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > otp.expires_at) {
      throw new Error('OTP expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(
      { password_hash: passwordHash },
      { where: { id: userId } }
    );

    // Mark OTP as verified
    await otp.update({ verified_at: new Date() });

    return { message: 'Password reset successful' };
  }

  /**
   * Logout user
   */
  static async logout(refreshToken) {
    const Session = db.models.Session;

    await Session.destroy({
      where: { refresh_token: refreshToken }
    });

    return { message: 'Logout successful' };
  }
}

module.exports = AuthService;
