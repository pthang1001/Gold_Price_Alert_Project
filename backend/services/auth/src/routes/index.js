const express = require('express');

const router = express.Router();

// Auth routes
router.post('/login', (req, res) => {
  res.json({ message: 'Auth - Login', service: 'auth-service' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Auth - Register', service: 'auth-service' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Auth - Logout' });
});

module.exports = router;
