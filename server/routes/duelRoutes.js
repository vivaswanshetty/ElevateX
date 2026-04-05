const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/rateLimiter');
const {
    createDuel,
    getMyDuels,
    getLiveDuels,
    respondToDuel,
    updateProgress
} = require('../controllers/duelController');

router.post('/', protect, writeLimiter, createDuel);
router.get('/my', protect, getMyDuels);
router.get('/live', getLiveDuels);
router.put('/:id/respond', protect, writeLimiter, respondToDuel);
router.put('/:id/progress', protect, writeLimiter, updateProgress);

module.exports = router;
