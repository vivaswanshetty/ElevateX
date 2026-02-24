const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get AI matched tasks for the current user
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Build User Profile Vector (Text String)
        // Combine bio, work history, and education into a single searchable string
        let userProfileText = `${user.bio || ''} ${user.name} `;

        if (user.work && user.work.length > 0) {
            userProfileText += user.work.map(w => `${w.role} ${w.company} ${w.desc}`).join(' ');
        }

        if (user.education && user.education.length > 0) {
            userProfileText += user.education.map(e => `${e.degree} ${e.school}`).join(' ');
        }

        // Clean and tokenize user text
        // - Lowercase
        // - Remove common stop words (optional, but good for noise reduction)
        // - Split by non-word characters
        const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'for', 'with', 'as', 'was', 'at', 'by', 'an', 'be', 'this', 'which', 'or', 'from']);

        const userTokens = new Set(
            userProfileText.toLowerCase()
                .split(/[\W_]+/) // Split by non-word chars
                .filter(token => token.length > 2 && !stopWords.has(token)) // Filter short words and stop words
        );

        // 2. Fetch All Open Tasks
        // We only want to match tasks that are 'Open' and NOT created by the user themselves
        const tasks = await Task.find({
            status: 'Open',
            createdBy: { $ne: user._id } // Don't match own tasks
        }).populate('createdBy', 'name avatar');

        // 3. Score Each Task
        const scoredTasks = tasks.map(task => {
            let score = 0;
            const reasons = []; // To explain why it matched

            // Text matching against Title and Description
            const taskText = `${task.title} ${task.description} ${task.category} ${task.subcategory}`;
            const taskTokens = taskText.toLowerCase().split(/[\W_]+/);

            let tokenMatches = 0;
            taskTokens.forEach(token => {
                if (userTokens.has(token)) {
                    tokenMatches++;
                }
            });

            // Normalize token match score (prevent long descriptions from dominating too much)
            // But for simple logic, raw count is okay, maybe capped.
            score += tokenMatches * 1;
            if (tokenMatches > 0) reasons.push(`Keyword overlap (${tokenMatches})`);

            // Category Boost
            // If the user's profile explicitly mentions the Category or Subcategory
            if (userProfileText.toLowerCase().includes(task.category.toLowerCase())) {
                score += 10;
                reasons.push(`Matches category: ${task.category}`);
            }
            if (userProfileText.toLowerCase().includes(task.subcategory.toLowerCase())) {
                score += 5;
                reasons.push(`Matches skill: ${task.subcategory}`);
            }

            // Experience Level / Reward Tier Logic (Optional)
            // e.g. if user has high XP, maybe boost higher reward tiers?
            // For now, let's keep it simple.

            return {
                ...task.toObject(),
                matchScore: score,
                matchReasons: reasons
            };
        });

        // 4. Filter and Sort
        // Filter out zero-score matches? Maybe keep them but low.
        // Let's return tasks with score > 0, sorted by score descending.
        const matches = scoredTasks
            .filter(t => t.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10); // Return top 10 matches

        res.json(matches);

    } catch (error) {
        console.error('AI Matching Error:', error);
        res.status(500).json({ message: 'Server Error during matching' });
    }
};

// @desc    Get AI matched peers for the current user
// @route   GET /api/matches/peers
// @access  Private
const getPeerMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Build Current User Profile Vector
        let userProfileText = `${user.bio || ''} ${user.name} `;
        if (user.work && user.work.length > 0) {
            userProfileText += user.work.map(w => `${w.role} ${w.company} ${w.desc}`).join(' ');
        }
        if (user.education && user.education.length > 0) {
            userProfileText += user.education.map(e => `${e.degree} ${e.school}`).join(' ');
        }

        const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'for', 'with', 'as', 'was', 'at', 'by', 'an', 'be', 'this', 'which', 'or', 'from']);
        const userTokens = new Set(
            userProfileText.toLowerCase()
                .split(/[\W_]+/)
                .filter(token => token.length > 2 && !stopWords.has(token))
        );

        // 2. Fetch Potential Peers
        // Exclude self and already followed users
        const alreadyFollowing = user.following.map(id => id.toString());
        alreadyFollowing.push(user._id.toString()); // Exclude self

        const candidates = await User.find({
            _id: { $nin: alreadyFollowing }
        }).select('name bio avatar work education xp coins isPrivate'); // Select fields needed for display & matching

        // 3. Score Each Candidate
        const scoredPeers = candidates.map(peer => {
            let score = 0;
            const reasons = [];

            // Text Match
            let peerProfileText = `${peer.bio || ''} ${peer.name} `;
            if (peer.work) peerProfileText += peer.work.map(w => `${w.role} ${w.company}`).join(' ');
            if (peer.education) peerProfileText += peer.education.map(e => `${e.degree} ${e.school}`).join(' ');

            const peerTokens = peerProfileText.toLowerCase().split(/[\W_]+/);
            let tokenMatches = 0;
            peerTokens.forEach(token => {
                if (userTokens.has(token)) tokenMatches++;
            });

            if (tokenMatches > 0) {
                score += tokenMatches * 1;
                reasons.push(`Shared interests (${tokenMatches})`);
            }

            // XP/Level Compatibility (optional bonus for similar level)
            const levelDiff = Math.abs((user.xp || 0) - (peer.xp || 0));
            if (levelDiff < 500) {
                score += 5; // Slight boost for similar experience level
                reasons.push('Similar XP Level');
            }

            return {
                ...peer.toObject(),
                matchScore: score,
                matchReasons: reasons
            };
        });

        // 4. Sort and Return
        const matches = scoredPeers
            .filter(p => p.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        res.json(matches);

    } catch (error) {
        console.error('Peer Matching Error:', error);
        res.status(500).json({ message: 'Server Error during peer matching' });
    }
};

module.exports = { getMatches, getPeerMatches };
