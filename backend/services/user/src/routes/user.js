const express = require('express');
const UserController = require('../controller/UserController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

/**
 * Middleware to extract user from token OR header (for testing)
 */
const flexAuth = (req, res, next) => {
  try {
    console.log('🔐 flexAuth middleware:', { headers: Object.keys(req.headers), env_secret: process.env.JWT_SECRET ? 'Set' : 'MISSING' });
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      console.log('✓ Using Bearer token');
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
      console.log('✓ Using secret:', secret === process.env.JWT_SECRET ? 'from ENV' : 'default');
      const decoded = jwt.verify(token, secret);
      req.user = { 
        id: decoded.user_id || decoded.userId, 
        email: decoded.email 
      };
      console.log('✓ Token decoded:', req.user);
    } else if (req.headers['x-user-id']) {
      console.log('✓ Using x-user-id header');
      req.user = { id: req.headers['x-user-id'], email: req.headers['x-user-email'] };
      console.log('✓ User set from headers:', req.user);
    } else {
      console.log('❌ No auth method found');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * User endpoints (requires authentication)
 */

// Profile
router.post('/profile', flexAuth, UserController.createProfile);
router.get('/profile', flexAuth, UserController.getProfile);
router.put('/profile', flexAuth, UserController.updateProfile);

// Preferences
router.get('/preferences', flexAuth, UserController.getPreferences);
router.put('/preferences', flexAuth, UserController.updatePreferences);

// Security
router.post('/change-password', flexAuth, UserController.changePassword);

// Account
router.delete('/account', flexAuth, UserController.requestAccountDeletion);
router.post('/account/restore', flexAuth, UserController.cancelAccountDeletion);

/**
 * Admin endpoints
 */

// User management
router.get('/', UserController.listUsers);
router.get('/:userId', UserController.getUserDetails);
router.put('/:userId', UserController.updateUser);
router.patch('/:userId/activate', UserController.activateUser);
router.patch('/:userId/deactivate', UserController.deactivateUser);
router.delete('/:userId', UserController.deleteUser);

module.exports = router;
