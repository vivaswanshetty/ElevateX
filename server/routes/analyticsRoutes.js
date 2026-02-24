const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTaskAnalytics } = require('../controllers/analyticsController');

router.get('/tasks', protect, getTaskAnalytics);

module.exports = router;
