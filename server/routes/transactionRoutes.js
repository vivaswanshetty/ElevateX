const express = require('express');
const { getTransactions, deposit, withdraw } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { transactionValidation, validate } = require('../middleware/validation');
const { writeLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.route('/').get(protect, getTransactions);
router.route('/deposit').post(protect, writeLimiter, transactionValidation, validate, deposit);
router.route('/withdraw').post(protect, writeLimiter, transactionValidation, validate, withdraw);

module.exports = router;
