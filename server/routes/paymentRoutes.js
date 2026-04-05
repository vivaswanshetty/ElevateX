const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/rateLimiter');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// All payment routes should be protected and rate-limited
router.post('/create-order', protect, writeLimiter, createOrder);
router.post('/verify-payment', protect, writeLimiter, verifyPayment);

module.exports = router;
