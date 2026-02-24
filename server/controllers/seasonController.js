const Season = require('../models/Season');
const User = require('../models/User');

// @desc    Get all seasons (for season history listing)
// @route   GET /api/seasons
// @access  Public
const getSeasons = async (req, res) => {
    try {
        const seasons = await Season.find({}).select('-leaderboardSnapshot').sort({ number: -1 });
        res.json(seasons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch seasons' });
    }
};

// @desc    Get active season + its live leaderboard (from user seasonXP)
// @route   GET /api/seasons/current
// @access  Public
const getCurrentSeason = async (req, res) => {
    try {
        const now = new Date();

        // Find an active season
        let season = await Season.findOne({ isActive: true });

        // Fallback: find a season where now is between start and end
        if (!season) {
            season = await Season.findOne({ startDate: { $lte: now }, endDate: { $gte: now } });
        }

        if (!season) {
            return res.json({ season: null, leaderboard: [] });
        }

        // Live leaderboard from current season XP on users
        const users = await User.find({ seasonXP: { $gt: 0 } })
            .select('name avatar seasonXP seasonCoins seasonTasksCompleted level')
            .sort({ seasonXP: -1 })
            .limit(50);

        res.json({ season, leaderboard: users });
    } catch (error) {
        console.error('getCurrentSeason error:', error);
        res.status(500).json({ message: 'Failed to fetch current season' });
    }
};

// @desc    Get a specific past season with its snapshot
// @route   GET /api/seasons/:id
// @access  Public
const getSeasonById = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id)
            .populate('leaderboardSnapshot.userId', 'name avatar');
        if (!season) return res.status(404).json({ message: 'Season not found' });
        res.json(season);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch season' });
    }
};

// @desc    Create a new season (admin only)
// @route   POST /api/seasons
// @access  Private (admin)
const createSeason = async (req, res) => {
    try {
        const { number, name, theme, startDate, endDate, prizes } = req.body;

        // Deactivate any existing active season
        await Season.updateMany({ isActive: true }, { isActive: false });

        const season = await Season.create({
            number,
            name,
            theme,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            prizes: prizes || [],
            isActive: true
        });

        // Reset all users' season stats
        await User.updateMany({}, { seasonXP: 0, seasonCoins: 0, seasonTasksCompleted: 0 });

        res.status(201).json(season);
    } catch (error) {
        console.error('createSeason error:', error);
        res.status(500).json({ message: 'Failed to create season', error: error.message });
    }
};

// @desc    End the active season — snapshot leaderboard, distribute prizes, reset season XP
// @route   POST /api/seasons/:id/end
// @access  Private (admin)
const endSeason = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);
        if (!season) return res.status(404).json({ message: 'Season not found' });
        if (!season.isActive) return res.status(400).json({ message: 'Season is not active' });

        // Build snapshot from live user seasonXP
        const topUsers = await User.find({ seasonXP: { $gt: 0 } })
            .select('name avatar seasonXP seasonCoins seasonTasksCompleted')
            .sort({ seasonXP: -1 })
            .limit(100);

        season.leaderboardSnapshot = topUsers.map((u, idx) => ({
            rank: idx + 1,
            userId: u._id,
            name: u.name,
            avatar: u.avatar,
            seasonXP: u.seasonXP,
            seasonCoins: u.seasonCoins,
            seasonTasksCompleted: u.seasonTasksCompleted
        }));

        // Distribute prizes to top finishers
        if (season.prizes && season.prizes.length > 0) {
            for (const prize of season.prizes) {
                const winner = season.leaderboardSnapshot.find(s => s.rank === prize.rank);
                if (winner && prize.bonusCoins > 0) {
                    await User.findByIdAndUpdate(winner.userId, {
                        $inc: { coins: prize.bonusCoins }
                    });
                }
            }
        }

        // Mark season as ended
        season.isActive = false;
        season.endDate = new Date();
        await season.save();

        // Reset all users' season stats
        await User.updateMany({}, { seasonXP: 0, seasonCoins: 0, seasonTasksCompleted: 0 });

        res.json({ message: 'Season ended successfully', season });
    } catch (error) {
        console.error('endSeason error:', error);
        res.status(500).json({ message: 'Failed to end season', error: error.message });
    }
};

module.exports = { getSeasons, getCurrentSeason, getSeasonById, createSeason, endSeason };
