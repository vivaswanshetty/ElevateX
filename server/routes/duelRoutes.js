const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createDuel,
    getMyDuels,
    getLiveDuels,
    respondToDuel,
    updateProgress
} = require('../controllers/duelController');

router.post('/', protect, createDuel);
router.get('/my', protect, getMyDuels);
router.get('/live', getLiveDuels);
router.put('/:id/respond', protect, respondToDuel);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
