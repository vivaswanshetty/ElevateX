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
            const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const usernameExists = await User.findOne({
                username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') }
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
    let user;

    if (loginInput.includes('@')) {
        // It's an email, normalize it using validator to match registration format
        const validator = require('validator');
        const normalizedEmail = validator.normalizeEmail(loginInput) || loginInput.toLowerCase();
        user = await User.findOne({ email: normalizedEmail });
    } else {
        // It's a username, escape regex special characters and query case-insensitively
        const escapedUsername = loginInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        user = await User.findOne({
            username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') }
        });
    }

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

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID Token is required' });
        }

        // Verify the token by calling Google's API
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!googleResponse.ok) {
            return res.status(400).json({ success: false, message: 'Invalid Google ID Token' });
        }

        const payload = await googleResponse.json();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account does not provide email' });
        }

        // Find user by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            // Generate a random unique username
            let baseUsername = email.split('@')[0];
            baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '');
            let username = baseUsername;
            let count = 0;
            while (await User.findOne({ username })) {
                count++;
                username = `${baseUsername}${count}`;
            }

            user = await User.create({
                name: name || 'Google User',
                username,
                email,
                googleId,
                avatar: picture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(email)}`,
                coins: 100, // Starting coins
                termsAccepted: true,
                termsAcceptedAt: new Date(),
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            xp: user.xp,
            coins: user.coins,
            isGuest: user.isGuest,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Server error during Google login' });
    }
};

// @desc    Guest login
// @route   POST /api/auth/guest
// @access  Public
const guestLogin = async (req, res) => {
    try {
        // Generate a random guest ID
        const crypto = require('crypto');
        const randomId = crypto.randomBytes(4).toString('hex');
        const email = `guest_${randomId}@elevatex.guest`;
        const username = `guest_${randomId}`;
        const name = `Guest Developer`;

        // Create guest user
        const user = await User.create({
            name,
            username,
            email,
            isGuest: true,
            coins: 100, // Starting coins
            termsAccepted: true,
            termsAcceptedAt: new Date(),
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            xp: user.xp,
            coins: user.coins,
            isGuest: user.isGuest,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ success: false, message: 'Server error during Guest login' });
    }
};

module.exports = { registerUser, authUser, googleLogin, guestLogin };
