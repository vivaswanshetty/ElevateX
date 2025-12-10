const Transaction = require('../models/Transaction');

const User = require('../models/User');

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('task', 'title');
    res.json(transactions);
};

// @desc    Deposit coins
// @route   POST /api/transactions/deposit
// @access  Private
const deposit = async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    user.coins += Number(amount);
    await user.save();

    await Transaction.create({
        user: req.user._id,
        type: 'deposit',
        amount,
        description: 'Deposit'
    });

    res.json({ coins: user.coins });
};

// @desc    Withdraw coins
// @route   POST /api/transactions/withdraw
// @access  Private
const withdraw = async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    if (user.coins < Number(amount)) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }
    user.coins -= Number(amount);
    await user.save();

    await Transaction.create({
        user: req.user._id,
        type: 'withdraw',
        amount,
        description: 'Withdraw'
    });

    res.json({ coins: user.coins });
};

module.exports = { getTransactions, deposit, withdraw };
