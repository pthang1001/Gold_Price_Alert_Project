const express = require('express');
const PriceController = require('../controller/PriceController');

const router = express.Router();

// Get current gold price
router.get('/current', PriceController.getCurrentPrice);

// Get price history
router.get('/history', PriceController.getPriceHistory);

// Get price statistics
router.get('/statistics', PriceController.getPriceStatistics);

// Refresh price (for testing)
router.post('/refresh', PriceController.refreshPrice);

module.exports = router;
