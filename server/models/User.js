const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    socials: {
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    work: [{
        id: { type: Number },
        role: { type: String },
        company: { type: String },
        duration: { type: String },
        desc: { type: String }
    }],
    education: [{
        id: { type: Number },
        degree: { type: String },
        school: { type: String },
        year: { type: String }
    }],
    // Social following
    isPrivate: { type: Boolean, default: false }, // Public by default - users can opt-in to private
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    // Password reset
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    // Terms acceptance
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return token;
};

userSchema.pre('save', async function () {
    // Generate unique avatar if not provided
    if (!this.avatar || this.avatar === '') {
        this.avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(this.email)}`;
    }

    // Hash password if it's modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
