const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRelics, craftRelic, transmuteEssence } = require('../controllers/alchemyController');

// All routes protected except getting relics (could be public, but let's keep it consistent)
router.get('/relics', protect, getRelics);

router.post('/craft', protect, craftRelic);

router.post('/transmute', protect, transmuteEssence);

module.exports = router;
