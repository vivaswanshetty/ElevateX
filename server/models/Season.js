const mongoose = require('mongoose');

const seasonSchema = mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    name: { type: String, required: true }, // e.g. "Season 1: The Rising"
    theme: { type: String, default: '' },   // flavour text / theme name
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },

    // Snapshot of the leaderboard taken when the season ended
    leaderboardSnapshot: [{
        rank: { type: Number },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        avatar: { type: String },
        seasonXP: { type: Number, default: 0 },
        seasonCoins: { type: Number, default: 0 },
        seasonTasksCompleted: { type: Number, default: 0 }
    }],

    // Rewards for top finishers (for future use)
    prizes: [{
        rank: { type: Number },
        bonusCoins: { type: Number, default: 0 },
        title: { type: String }
    }]
}, {
    timestamps: true
});

const Season = mongoose.model('Season', seasonSchema);
module.exports = Season;
