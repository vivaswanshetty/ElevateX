const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const aiConversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat Session'
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

// Ensure fast index lookup by user ID
aiConversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
