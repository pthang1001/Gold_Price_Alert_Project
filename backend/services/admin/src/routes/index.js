const express = require('express');

const router = express.Router();

// Admin routes
router.get('/config', (req, res) => {
  res.json({ message: 'Admin - Get Config', service: 'admin-service' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Admin - List Users' });
});

module.exports = router;
