const { body, validationResult } = require('express-validator');

// Validation middleware
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

// Registration validation rules
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
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Login validation rules
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// Task creation validation
const taskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

    body('description')
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

// Contact form validation
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

// Password reset request validation
const passwordResetRequestValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
];

// Password reset validation
const passwordResetValidation = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('token')
        .notEmpty().withMessage('Reset token is required'),
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    taskValidation,
    contactValidation,
    passwordResetRequestValidation,
    passwordResetValidation,
};
