const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', authLimiter, loginValidation, validate, authUser);

module.exports = router;
