const express = require('express');

const router = express.Router();

// Notification routes
router.get('/', (req, res) => {
  res.json({ message: 'Notification - List All', service: 'notification-service' });
});

router.put('/:id/read', (req, res) => {
  res.json({ message: 'Notification - Mark Read' });
});

module.exports = router;
