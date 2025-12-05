const express = require('express');

const router = express.Router();

// Alert routes
router.get('/', (req, res) => {
  res.json({ message: 'Alert - List All', service: 'alert-service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Alert - Create' });
});

module.exports = router;
