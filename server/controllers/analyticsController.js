const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get analytics for task creator
// @route   GET /api/tasks/analytics
// @access  Private
const getTaskAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // All tasks this user created
        const tasks = await Task.find({ createdBy: userId })
            .populate('assignedTo', 'name avatar')
            .sort({ createdAt: -1 });

        // Tasks the user has worked on (as fulfiller)
        const fulfilledTasks = await Task.find({
            assignedTo: userId,
            status: 'Completed'
        }).sort({ updatedAt: -1 });

        // Transactions
        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

        // ─── Aggregate metrics ──────────────────────────────────────────────
        const totalPosted = tasks.length;
        const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
        const totalInProgress = tasks.filter(t => t.status === 'In Progress').length;
        const totalOpen = tasks.filter(t => t.status === 'Open').length;
        const totalCancelled = tasks.filter(t => t.status === 'Cancelled').length;

        const totalApplicants = tasks.reduce((sum, t) => sum + (t.applicants?.length || 0), 0);
        const totalCoinsPosted = tasks.reduce((sum, t) => sum + (t.coins || 0), 0);
        const avgApplicantsPerTask = totalPosted ? (totalApplicants / totalPosted).toFixed(1) : 0;
        const completionRate = totalPosted ? Math.round((totalCompleted / totalPosted) * 100) : 0;

        // ─── Category breakdown ──────────────────────────────────────────────
        const categoryMap = {};
        tasks.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
        });
        const categoryBreakdown = Object.entries(categoryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        // ─── Monthly timeline (last 6 months) ───────────────────────────────
        const now = new Date();
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            const posted = tasks.filter(t => new Date(t.createdAt) >= d && new Date(t.createdAt) < next).length;
            const completed = tasks.filter(t => t.status === 'Completed' && new Date(t.updatedAt) >= d && new Date(t.updatedAt) < next).length;
            monthlyData.push({ label, posted, completed });
        }

        // ─── Income/spending from transactions ───────────────────────────────
        const income = transactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const spending = transactions
            .filter(t => t.type === 'withdraw' || t.type === 'escrow-lock')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        // ─── Tasks fulfilled (as freelancer) ────────────────────────────────
        const totalFulfilled = fulfilledTasks.length;
        const coinsEarned = fulfilledTasks.reduce((sum, t) => sum + (t.coins || 0), 0);

        // ─── User stats ──────────────────────────────────────────────────────
        const user = await User.findById(userId).select('xp coins level tasksCompleted');

        res.json({
            posted: {
                total: totalPosted,
                completed: totalCompleted,
                inProgress: totalInProgress,
                open: totalOpen,
                cancelled: totalCancelled,
                completionRate,
            },
            applicants: {
                total: totalApplicants,
                average: parseFloat(avgApplicantsPerTask),
            },
            coins: {
                totalPosted: totalCoinsPosted,
                income,
                spending,
                coinsEarned,
                balance: user?.coins || 0,
            },
            xp: user?.xp || 0,
            fulfilled: {
                total: totalFulfilled,
                coinsEarned,
            },
            categoryBreakdown,
            monthlyTimeline: monthlyData,
            recentTasks: tasks.slice(0, 5).map(t => ({
                _id: t._id,
                title: t.title,
                status: t.status,
                coins: t.coins,
                applicants: t.applicants?.length || 0,
                createdAt: t.createdAt
            }))
        });
    } catch (error) {
        console.error('getTaskAnalytics error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

module.exports = { getTaskAnalytics };
