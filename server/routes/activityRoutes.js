const express = require('express');
const {
    getActivities,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllActivities
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getActivities);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:activityId/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead); // Fixed path to match frontend call
router.delete('/clear-all', protect, clearAllActivities);

module.exports = router;
