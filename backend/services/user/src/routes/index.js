const express = require('express');

const router = express.Router();

// User routes
router.get('/profile', (req, res) => {
  res.json({ message: 'User - Get Profile', service: 'user-service' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'User - Update Profile' });
});

module.exports = router;
