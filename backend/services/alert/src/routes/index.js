const express = require('express');
const AlertController = require('../controller/AlertController');

const router = express.Router();

// Create alert
router.post('/', AlertController.createAlert);

// Get all user alerts
router.get('/', AlertController.getUserAlerts);

// Get alert detail
router.get('/:id', AlertController.getAlertDetail);

// Update alert
router.put('/:id', AlertController.updateAlert);

// Delete alert
router.delete('/:id', AlertController.deleteAlert);

// Get alert history
router.get('/history', AlertController.getAlertHistory);

module.exports = router;
