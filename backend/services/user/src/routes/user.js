const express = require('express');
const UserController = require('../controller/UserController');
const router = express.Router();

/**
 * User endpoints (requires authentication)
 */

// Profile
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Preferences
router.get('/preferences', UserController.getPreferences);
router.put('/preferences', UserController.updatePreferences);

// Security
router.post('/change-password', UserController.changePassword);

// Account
router.delete('/account', UserController.requestAccountDeletion);
router.post('/account/restore', UserController.cancelAccountDeletion);

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
