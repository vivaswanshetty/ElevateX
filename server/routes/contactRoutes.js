const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates } = require('../services/emailService');
const { contactValidation, validate } = require('../middleware/validation');
const { contactLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/contact
// @desc    Send contact form message
// @access  Public
router.post('/', contactLimiter, contactValidation, validate, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Send email to support
        const emailData = emailTemplates.contactFormNotification(name, email, subject, message);
        const result = await sendEmail({
            to: process.env.SUPPORT_EMAIL || 'support@elevatex.com',
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });

        if (result.success) {
            // Send confirmation email to user
            await sendEmail({
                to: email,
                subject: 'We received your message - ElevateX',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #9333EA;">Thank you for contacting us!</h1>
                        <p>Hi ${name},</p>
                        <p>We've received your message and will get back to you within 24 hours.</p>
                        <p><strong>Your message:</strong></p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                            <p>${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                            © 2025 ElevateX™. All rights reserved.
                        </p>
                    </div>
                `,
                text: `Thank you for contacting us!\n\nWe've received your message and will respond within 24 hours.`,
            });

            res.status(200).json({
                success: true,
                message: 'Message sent successfully! We\'ll get back to you soon.',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.',
            });
        }
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
});

module.exports = router;
