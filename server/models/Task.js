const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    rewardTier: { type: String, required: true },
    coins: { type: Number, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    attachments: [{
        name: String,
        type: String,
        data: String // Storing base64 for now as per frontend implementation
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    applicants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chat: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        from: String, // Keep for quick access without populating
        avatar: String, // User avatar URL
        text: {
            type: String,
            required: true
        },
        at: {
            type: Date,
            default: Date.now
        },
        edited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        reactions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            emoji: String
        }]
    }]
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
