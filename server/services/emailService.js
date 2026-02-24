const nodemailer = require('nodemailer');

// Create reusable transporter
// Create reusable transporter
const createTransporter = async () => {
    // Check if we have real credentials provided in environment variables
    if (process.env.EMAIL_PASSWORD && process.env.EMAIL_USER) {
        // Use production-like or custom SMTP configuration
        return nodemailer.createTransport({
            service: 'gmail', // Simplifies configuration for Gmail
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    } else {
        // Development: Use Ethereal if no real credentials provided
        let user = process.env.EMAIL_USER;
        let pass = process.env.EMAIL_PASSWORD;

        // If no credentials provided, generate test account
        if (!user || !pass) {
            try {
                const testAccount = await nodemailer.createTestAccount();
                user = testAccount.user;
                pass = testAccount.pass;
                console.log('Generated Ethereal credentials:', user);
            } catch (err) {
                console.error('Failed to create test account:', err);
            }
        }

        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: user || 'ethereal.user@ethereal.email', // Fallback
                pass: pass || 'ethereal.password',
            },
        });
    }
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"ElevateX" <${process.env.EMAIL_FROM || 'noreply@elevatex.com'}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.messageId);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending error:', error);
        // Don't fail completely in dev if email fails, just log it
        if (process.env.NODE_ENV !== 'production') {
            return { success: true, messageId: 'dev-mock-id', warning: 'Email failed but suppressed in dev' };
        }
        return { success: false, error: error.message };
    }
};

// Email templates
const emailTemplates = {
    welcome: (name) => ({
        subject: 'Welcome to ElevateX! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">Welcome to ElevateX!</h1>
                <p>Hi ${name},</p>
                <p>Thank you for joining ElevateX! We're excited to have you in our community.</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse and apply for tasks</li>
                    <li>Create your own tasks</li>
                    <li>Earn coins and climb the leaderboard</li>
                    <li>Connect with other talented individuals</li>
                </ul>
                <p>Get started by completing your profile and exploring available tasks!</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Complete Your Profile
                    </a>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `Welcome to ElevateX!\n\nHi ${name},\n\nThank you for joining ElevateX! Get started by completing your profile.`,
    }),

    emailVerification: (name, verificationLink) => ({
        subject: 'Verify Your Email - ElevateX',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">Verify Your Email</h1>
                <p>Hi ${name},</p>
                <p>Thanks for signing up! Please verify your email address to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 12px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    ${verificationLink}
                </p>
                <p style="color: #666; font-size: 12px;">
                    This link will expire in 24 hours.
                </p>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `Verify your email\n\nHi ${name},\n\nPlease verify your email: ${verificationLink}`,
    }),

    passwordReset: (name, resetLink) => ({
        subject: 'Password Reset Request - ElevateX',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">Password Reset</h1>
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 12px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    ${resetLink}
                </p>
                <p style="color: #666; font-size: 12px;">
                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                </p>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `Password Reset\n\nHi ${name},\n\nReset your password here: ${resetLink}\n\nThis link expires in 1 hour.`,
    }),

    contactFormNotification: (senderName, senderEmail, subject, message) => ({
        subject: `New Contact Form Submission: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA;">New Contact Form Submission</h1>
                <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <p style="color: #666; font-size: 12px;">
                    Reply to: ${senderEmail}
                </p>
            </div>
        `,
        text: `New Contact Form\n\nFrom: ${senderName} (${senderEmail})\nSubject: ${subject}\n\nMessage:\n${message}`,
    }),

    taskAssigned: (name, taskTitle, taskId) => ({
        subject: `You've been assigned a task: ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">New Task Assignment! 🎯</h1>
                <p>Hi ${name},</p>
                <p>Congratulations! You've been assigned to complete the task "${taskTitle}".</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        View Task
                    </a>
                </div>
                <p>Good luck! Make sure to submit your work before the deadline.</p>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `New Task Assignment!\n\nHi ${name},\n\nYou've been assigned: ${taskTitle}`,
    }),

    taskApplicationReceived: (creatorName, applicantName, taskTitle) => ({
        subject: `New Application for: ${taskTitle} 🚀`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">New Task Application!</h1>
                <p>Hi ${creatorName},</p>
                <p><strong>${applicantName}</strong> has just applied for your task <strong>"${taskTitle}"</strong>.</p>
                <p>Review their profile and application to decide if they are the right fit.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Review Application
                    </a>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `New Application!\n\nHi ${creatorName},\n\n${applicantName} has applied for your task "${taskTitle}".\n\nLog in to review.`,
    }),

    newTaskAvailable: (userName, taskTitle, reward) => ({
        subject: `New Task Available: ${taskTitle} 💰`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #9333EA; text-align: center;">New Opportunity!</h1>
                <p>Hi ${userName},</p>
                <p>A new task <strong>"${taskTitle}"</strong> has just been posted.</p>
                <p><strong>Reward:</strong> ${reward} Coins</p>
                <p>Check it out and apply if you have the skills!</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore" 
                       style="background: linear-gradient(to right, #9333EA, #EC4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        View Task
                    </a>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
                    © 2025 ElevateX™. All rights reserved.
                </p>
            </div>
        `,
        text: `New Task Available!\n\nHi ${userName},\n\nA new task "${taskTitle}" is available for ${reward} Coins.\n\nCheck it out on ElevateX.`,
    }),
};

module.exports = { sendEmail, emailTemplates };
