const User = require('../models/User');

const RELICS = [
    {
        id: 'focus-lens',
        name: 'Luminous Focus Lens',
        tier: 'Epic',
        bonus: '+5% XP from Focus tasks',
        recipe: { focus: 5, creativity: 1, discipline: 2 },
        color: 'from-blue-400 to-cyan-500'
    },
    {
        id: 'creative-spark',
        name: 'Eternal Creative Spark',
        tier: 'Legendary',
        bonus: '+10% Coins from Projects',
        recipe: { focus: 2, creativity: 8, discipline: 0 },
        color: 'from-amber-400 to-orange-500'
    },
    {
        id: 'iron-will',
        name: 'Vessel of Iron Will',
        tier: 'Rare',
        bonus: '-10% Duel cooldown',
        recipe: { focus: 3, creativity: 0, discipline: 5 },
        color: 'from-slate-400 to-zinc-600'
    },
    {
        id: 'void-mirror',
        name: 'Echoing Void Mirror',
        tier: 'Epic',
        bonus: '+15% XP for Night sessions',
        recipe: { focus: 4, creativity: 4, discipline: 4 },
        color: 'from-indigo-600 to-purple-900'
    },
    {
        id: 'synergy-prism',
        name: 'Prism of Synergy',
        tier: 'Rare',
        bonus: '+2 XP to Duel teammates',
        recipe: { focus: 1, creativity: 3, discipline: 2 },
        color: 'from-pink-400 to-rose-600'
    }
];

// @desc    Get all available relics
// @route   GET /api/alchemy/relics
// @access  Public
const getRelics = (req, res) => {
    res.json(RELICS);
};

// @desc    Craft a relic
// @route   POST /api/alchemy/craft
// @access  Private
const craftRelic = async (req, res) => {
    try {
        const { relicId } = req.body;
        const user = await User.findById(req.user._id);

        const relic = RELICS.find(r => r.id === relicId);
        if (!relic) {
            return res.status(404).json({ message: 'Relic recipe not found' });
        }

        // Check already crafted? (Allow multiples? Usually unique in games like this)
        // Let's assume unique for now to avoid stacking bonuses logic complexity
        const alreadyHas = user.relics.find(r => r.id === relicId);
        if (alreadyHas) {
            return res.status(400).json({ message: 'You already possess this Relic' });
        }

        // Check Essence Cost
        const { focus, creativity, discipline } = relic.recipe;
        if (
            (user.essences.focus || 0) < focus ||
            (user.essences.creativity || 0) < creativity ||
            (user.essences.discipline || 0) < discipline
        ) {
            return res.status(400).json({ message: 'Insufficient Essences' });
        }

        // Deduct Essences
        user.essences.focus = (user.essences.focus || 0) - focus;
        user.essences.creativity = (user.essences.creativity || 0) - creativity;
        user.essences.discipline = (user.essences.discipline || 0) - discipline;

        // Add Relic
        user.relics.push({
            id: relic.id,
            name: relic.name,
            tier: relic.tier,
            bonus: relic.bonus,
            craftedAt: Date.now()
        });

        await user.save();

        res.json({
            message: `Crafted ${relic.name} successfully!`,
            essences: user.essences,
            relics: user.relics,
            newRelic: user.relics[user.relics.length - 1]
        });

    } catch (error) {
        console.error('Crafting error:', error);
        res.status(500).json({ message: 'Failed to craft relic' });
    }
};

// @desc    Transmute Essences (3:1 conversion)
// @route   POST /api/alchemy/transmute
// @access  Private
const transmuteEssence = async (req, res) => {
    try {
        const { from, to } = req.body;
        const validTypes = ['focus', 'creativity', 'discipline'];

        if (!validTypes.includes(from) || !validTypes.includes(to) || from === to) {
            return res.status(400).json({ message: 'Invalid transmutation types' });
        }

        const user = await User.findById(req.user._id);

        if ((user.essences[from] || 0) < 3) {
            return res.status(400).json({ message: `Not enough ${from} essence (Need 3)` });
        }

        // Perform Transmutation
        user.essences[from] -= 3;
        user.essences[to] = (user.essences[to] || 0) + 1;

        await user.save();

        res.json({
            message: `Transmuted 3 ${from} into 1 ${to}`,
            essences: user.essences
        });

    } catch (error) {
        console.error('Transmutation error:', error);
        res.status(500).json({ message: 'Transmutation failed' });
    }
};

module.exports = {
    getRelics,
    craftRelic,
    transmuteEssence
};
