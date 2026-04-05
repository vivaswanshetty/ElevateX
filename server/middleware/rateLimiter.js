const rateLimit = require('express-rate-limit');

// General API rate limiter — applies to all /api/ routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for auth routes (login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Contact form rate limiter
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { success: false, message: 'Too many contact form submissions, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Write-heavy endpoint limiter (creating tasks, posts, transactions)
const writeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    message: { success: false, message: 'Too many write requests, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload limiter — prevent disk exhaustion
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, message: 'Too many uploads, please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset limiter (separate from auth)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, message: 'Too many password reset attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, contactLimiter, writeLimiter, uploadLimiter, passwordResetLimiter };
