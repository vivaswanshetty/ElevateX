const express = require('express');
const { getTransactions, deposit, withdraw } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTransactions);
router.route('/deposit').post(protect, deposit);
router.route('/withdraw').post(protect, withdraw);

module.exports = router;
