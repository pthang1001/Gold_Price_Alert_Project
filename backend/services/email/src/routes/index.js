const express = require('express');

const router = express.Router();

// Email routes
router.post('/send', (req, res) => {
  res.json({ message: 'Email - Send', service: 'email-service' });
});

router.get('/queue', (req, res) => {
  res.json({ message: 'Email - Get Queue' });
});

module.exports = router;
