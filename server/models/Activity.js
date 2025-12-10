const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment', 'mention', 'task_complete', 'task_assign', 'task_apply', 'follow_request', 'follow_accept', 'duel_request', 'duel_accept', 'duel_lost'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    duel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Duel'
    },
    comment: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
activitySchema.index({ recipient: 1, createdAt: -1 });
activitySchema.index({ read: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
