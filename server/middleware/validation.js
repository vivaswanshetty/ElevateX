const { body, query, param, validationResult } = require('express-validator');

// Validation middleware — returns 400 with structured errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ── Auth ──────────────────────────────────────────────

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Tasks ─────────────────────────────────────────────

const taskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

    body('desc')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),

    body('category')
        .notEmpty().withMessage('Category is required'),

    body('coins')
        .notEmpty().withMessage('Coin reward is required')
        .isInt({ min: 1, max: 10000 }).withMessage('Coins must be between 1 and 10000'),

    body('deadline')
        .notEmpty().withMessage('Deadline is required')
        .isISO8601().withMessage('Invalid date format'),
];

// ── Contact ───────────────────────────────────────────

const contactValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required')
        .isLength({ min: 5, max: 100 }).withMessage('Subject must be between 5 and 100 characters'),

    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
];

// ── Password reset ────────────────────────────────────

const passwordResetRequestValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
];

const passwordResetValidation = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('token')
        .notEmpty().withMessage('Reset token is required'),
];

// ── Transactions ──────────────────────────────────────

const transactionValidation = [
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 1, max: 100000 }).withMessage('Amount must be between 1 and 100,000')
        .toFloat(),
];

// ── Profile update ────────────────────────────────────

const profileUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Bio must be under 300 characters'),

    // Block direct coin/xp manipulation from client
    body('coins').not().exists().withMessage('Cannot modify coins directly'),
    body('xp').not().exists().withMessage('Cannot modify XP directly'),
];

// ── Posts ─────────────────────────────────────────────

const postValidation = [
    body('content')
        .trim()
        .notEmpty().withMessage('Post content is required')
        .isLength({ min: 1, max: 2000 }).withMessage('Post content must be under 2000 characters'),
];

const commentValidation = [
    body('text')
        .trim()
        .notEmpty().withMessage('Comment text is required')
        .isLength({ min: 1, max: 500 }).withMessage('Comment must be under 500 characters'),
];

// ── Messages ──────────────────────────────────────────

const messageValidation = [
    body('receiverId')
        .notEmpty().withMessage('Receiver is required')
        .isMongoId().withMessage('Invalid receiver ID'),

    body('text')
        .optional()
        .isLength({ max: 5000 }).withMessage('Message must be under 5000 characters'),
];

// ── Search ────────────────────────────────────────────

const searchValidation = [
    query('q')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query too long')
        .customSanitizer((val) => val ? val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : val),
];

// ── Mongo ID param ────────────────────────────────────

const mongoIdParam = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

// ── Waitlist ──────────────────────────────────────────

const waitlistValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('source')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Source must be under 50 characters'),
];

// ── Change password ───────────────────────────────────

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    taskValidation,
    contactValidation,
    passwordResetRequestValidation,
    passwordResetValidation,
    transactionValidation,
    profileUpdateValidation,
    postValidation,
    commentValidation,
    messageValidation,
    searchValidation,
    mongoIdParam,
    waitlistValidation,
    changePasswordValidation,
};
