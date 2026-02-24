const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// All payment routes should be protected
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;
