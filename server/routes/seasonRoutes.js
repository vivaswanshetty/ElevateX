const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSeasons,
    getCurrentSeason,
    getSeasonById,
    createSeason,
    endSeason
} = require('../controllers/seasonController');

router.get('/', getSeasons);
router.get('/current', getCurrentSeason);
router.get('/:id', getSeasonById);
router.post('/', protect, createSeason);         // admin only in future; guarded for now by auth
router.post('/:id/end', protect, endSeason);

module.exports = router;
