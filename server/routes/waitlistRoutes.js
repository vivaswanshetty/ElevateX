const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

// @desc    Join waitlist
// @route   POST /api/waitlist
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { email, source } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const existing = await Waitlist.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You are already on the waitlist!' });
        }

        await Waitlist.create({
            email,
            source: source || 'mobile_app'
        });

        res.status(201).json({
            success: true,
            message: 'You have been added to the waitlist!'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
