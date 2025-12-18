const Duel = require('../models/Duel');
const User = require('../models/User');
const { createActivity } = require('./activityController');

// Create a new duel request
exports.createDuel = async (req, res) => {
    try {
        const { opponentId, type, message, target, isShadow } = req.body;
        const challengerId = req.user.id;

        console.log('Create Duel Request:', { body: req.body, challengerId });

        if (!isShadow && challengerId === opponentId) {
            console.log('Self challenge attempted without shadow mode');
            return res.status(400).json({ message: 'You cannot challenge yourself' });
        }

        if (isShadow) {
            // Shadow mode: challenge one self's past performance
            const duel = await Duel.create({
                challenger: challengerId,
                opponent: challengerId, // Self as opponent for shadow duels
                type,
                target,
                message: message || `Chrono-Shadow Challenge: ${type.replace('-', ' ')}`,
                status: 'active', // Shadow duels start active immediately
                isShadow: true,
                startedAt: new Date(),
                shadowData: {
                    bestProgress: target, // In a real app, fetch from historical records
                    recordedAt: new Date()
                }
            });

            const populatedDuel = await Duel.findById(duel._id)
                .populate('challenger', 'name avatar')
                .populate('opponent', 'name avatar');

            return res.status(201).json(populatedDuel);
        }

        const opponent = await User.findById(opponentId);
        if (!opponent) {
            return res.status(404).json({ message: 'Opponent not found' });
        }

        // Check if there is already a pending or active duel between these users
        const existingDuel = await Duel.findOne({
            $or: [
                { challenger: challengerId, opponent: opponentId },
                { challenger: opponentId, opponent: challengerId }
            ],
            status: { $in: ['pending', 'active'] }
        });

        if (existingDuel) {
            console.log('Existing duel found:', existingDuel);
            return res.status(400).json({ message: 'A duel is already in progress or pending with this user' });
        }

        const duel = await Duel.create({
            challenger: challengerId,
            opponent: opponentId,
            type,
            target,
            message,
            status: 'pending'
        });

        // Create activity for opponent
        await createActivity(opponentId, challengerId, 'duel_request', {
            comment: `${req.user.name} challenged you to a ${type.replace('-', ' ')}!`,
            duel: duel._id
        });

        const populatedDuel = await Duel.findById(duel._id)
            .populate('challenger', 'name avatar')
            .populate('opponent', 'name avatar');

        res.status(201).json(populatedDuel);
    } catch (error) {
        console.error('Error creating duel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's duels (active and pending)
exports.getMyDuels = async (req, res) => {
    try {
        const userId = req.user.id;
        const duels = await Duel.find({
            $or: [{ challenger: userId }, { opponent: userId }],
            status: { $in: ['pending', 'active'] }
        })
            .populate('challenger', 'name avatar')
            .populate('opponent', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(duels);
    } catch (error) {
        console.error('Error fetching duels:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get live active duels (public)
exports.getLiveDuels = async (req, res) => {
    try {
        const duels = await Duel.find({ status: 'active' })
            .populate('challenger', 'name avatar')
            .populate('opponent', 'name avatar')
            .sort({ startedAt: -1 })
            .limit(10);

        res.json(duels);
    } catch (error) {
        console.error('Error fetching live duels:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Respond to duel request
exports.respondToDuel = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user.id;

        const duel = await Duel.findById(id);
        if (!duel) {
            return res.status(404).json({ message: 'Duel not found' });
        }

        if (duel.opponent.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (duel.status !== 'pending') {
            return res.status(400).json({ message: 'Duel is not pending' });
        }

        if (action === 'accept') {
            duel.status = 'active';
            duel.startedAt = new Date();
            await duel.save();

            // Notify challenger
            await createActivity(duel.challenger, userId, 'duel_accept', {
                comment: `${req.user.name} accepted your challenge!`,
                duel: duel._id
            });
        } else if (action === 'reject') {
            duel.status = 'rejected';
            await duel.save();
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const updatedDuel = await Duel.findById(id)
            .populate('challenger', 'name avatar')
            .populate('opponent', 'name avatar');

        res.json(updatedDuel);
    } catch (error) {
        console.error('Error responding to duel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update progress (simplified for now)
exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;
        const userId = req.user.id;

        const duel = await Duel.findById(id);
        if (!duel) {
            return res.status(404).json({ message: 'Duel not found' });
        }

        if (duel.status !== 'active') {
            return res.status(400).json({ message: 'Duel is not active' });
        }

        let isWinner = false;

        if (duel.challenger.toString() === userId) {
            duel.challengerProgress = progress;
            if (duel.challengerProgress >= duel.target) {
                duel.status = 'completed';
                duel.winner = userId;
                duel.endedAt = new Date();
                isWinner = true;
            }
        } else if (duel.opponent.toString() === userId) {
            duel.opponentProgress = progress;
            if (duel.opponentProgress >= duel.target) {
                duel.status = 'completed';
                duel.winner = userId;
                duel.endedAt = new Date();
                isWinner = true;
            }
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await duel.save();

        if (isWinner) {
            // Notify loser
            const loserId = duel.challenger.toString() === userId ? duel.opponent : duel.challenger;
            await createActivity(loserId, userId, 'duel_lost', {
                comment: `${req.user.name} won the ${duel.type.replace('-', ' ')}!`,
                duel: duel._id
            });

            // Notify winner (self) - optional, maybe just UI toast
        }

        const updatedDuel = await Duel.findById(id)
            .populate('challenger', 'name avatar')
            .populate('opponent', 'name avatar');

        res.json(updatedDuel);
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
