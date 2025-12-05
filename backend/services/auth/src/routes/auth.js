const express = require('express');
const AuthController = require('../controller/AuthController');
const router = express.Router();

/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', AuthController.register);

/**
 * POST /auth/verify-otp
 * Verify email OTP
 */
router.post('/verify-otp', AuthController.verifyOTP);

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', AuthController.login);

/**
 * POST /auth/refresh-token
 * Refresh access token
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * POST /auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', AuthController.logout);

module.exports = router;
