const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, termsAccepted } = req.body;

        // Check if user already exists with this email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if user already exists with this username
        if (username) {
            const usernameExists = await User.findOne({
                username: { $regex: new RegExp(`^${username}$`, 'i') }
            });
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        const user = await User.create({
            name,
            username,
            email,
            password,
            coins: 100, // Starting coins
            termsAccepted: termsAccepted || false,
            termsAcceptedAt: termsAccepted ? new Date() : undefined,
        });

        if (user) {
            // Send welcome email (don't wait for it, run async)
            const emailData = emailTemplates.welcome(user.name);
            sendEmail({
                to: user.email,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
            }).catch(err => console.error('Welcome email failed:', err));

            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                coins: user.coins,
                createdAt: user.createdAt,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body; // 'email' field actually contains email or username

    const loginInput = email.trim();
    // Query either by email (case-insensitive) or username (case-insensitive)
    const user = await User.findOne({
        $or: [
            { email: loginInput.toLowerCase() },
            { username: { $regex: new RegExp(`^${loginInput}$`, 'i') } }
        ]
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            xp: user.xp,
            coins: user.coins,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email/username or password' });
    }
};

module.exports = { registerUser, authUser };
