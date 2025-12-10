const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { passwordResetRequestValidation, passwordResetValidation, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/password-reset/request
// @desc    Request password reset
// @access  Public
router.post('/request', authLimiter, passwordResetRequestValidation, validate, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Always return success message for security (don't reveal if email exists)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Send email
        const emailData = emailTemplates.passwordReset(user.name, resetUrl);
        await sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
});

// @route   POST /api/password-reset/reset
// @desc    Reset password with token
// @access  Public
router.post('/reset', passwordResetValidation, validate, async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.',
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Send confirmation email
        await sendEmail({
            to: user.email,
            subject: 'Password Changed Successfully - ElevateX',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #9333EA;">Password Changed Successfully</h1>
                    <p>Hi ${user.name},</p>
                    <p>Your password has been changed successfully. You can now log in with your new password.</p>
                    <p>If you didn't make this change, please contact support immediately.</p>
                    <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                        © 2025 ElevateX™. All rights reserved.
                    </p>
                </div>
            `,
            text: `Password Changed\n\nHi ${user.name},\n\nYour password has been changed successfully.`,
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.',
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
});

// @route   GET /api/password-reset/verify/:token
// @desc    Verify reset token is valid
// @access  Public
router.get('/verify/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid.',
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
});

module.exports = router;
