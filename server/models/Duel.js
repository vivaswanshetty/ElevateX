const mongoose = require('mongoose');

const duelSchema = new mongoose.Schema({
    challenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task-sprint', 'habit-streak', 'study-duel'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'rejected', 'cancelled'],
        default: 'pending'
    },
    challengerProgress: {
        type: Number,
        default: 0
    },
    opponentProgress: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    },
    message: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
duelSchema.index({ challenger: 1, opponent: 1 });
duelSchema.index({ status: 1 });

module.exports = mongoose.model('Duel', duelSchema);
