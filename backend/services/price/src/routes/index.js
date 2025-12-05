const express = require('express');

const router = express.Router();

// Price routes
router.get('/current', (req, res) => {
  res.json({ message: 'Price - Get Current', service: 'price-service' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Price - Get History' });
});

module.exports = router;
