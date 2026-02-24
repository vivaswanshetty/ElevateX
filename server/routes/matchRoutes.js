const express = require('express');
const router = express.Router();
const { getMatches, getPeerMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMatches);
router.get('/peers', protect, getPeerMatches);

module.exports = router;
