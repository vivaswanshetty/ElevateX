const express = require('express');
const { registerUser, authUser, googleLogin, guestLogin } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, registerUser);
router.post('/login', authLimiter, loginValidation, validate, authUser);
router.post('/google', authLimiter, googleLogin);
router.post('/guest', authLimiter, guestLogin);

module.exports = router;
