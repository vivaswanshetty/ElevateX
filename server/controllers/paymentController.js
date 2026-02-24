const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Coin bonuses granted immediately on subscription activation
const PLAN_COIN_BONUS = {
    pro: 500,
    elite: 2500,
};

// @desc    Create Razorpay Order (coins deposit OR subscription)
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { amount, type, plan, billingCycle, currency: reqCurrency } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // Razorpay requires amount in smallest currency unit
        // INR → paise (×100), USD → cents (×100)
        const currency = reqCurrency === 'USD' ? 'USD' : 'INR';
        const amountInSmallestUnit = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInSmallestUnit,
            currency,
            receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`,
            payment_capture: 1,
            notes: {
                type: type || 'deposit',
                plan: plan || '',
                billingCycle: billingCycle || '',
                userId: req.user._id.toString(),
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
    }
};

// @desc    Verify Razorpay Payment & fulfil order
// @route   POST /api/payments/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            type,
            plan,
            billingCycle,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        // Verify signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // ── Payment verified ──
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (type === 'subscription' && plan) {
            // ── Subscription purchase ──
            const coinBonus = PLAN_COIN_BONUS[plan] || 0;

            // Upgrade plan
            const now = new Date();
            const expiry = new Date(now);
            if (billingCycle === 'yearly') {
                expiry.setFullYear(expiry.getFullYear() + 1);
            } else {
                expiry.setMonth(expiry.getMonth() + 1);
            }

            user.subscription = {
                plan,
                startDate: now,
                expiryDate: expiry,
                isActive: true,
            };

            // Credit coin bonus
            if (coinBonus > 0) {
                user.coins = (user.coins || 0) + coinBonus;
            }

            await user.save();

            // Record transaction
            await Transaction.create({
                user: req.user._id,
                type: 'deposit',
                amount: coinBonus,
                description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Activation Bonus`,
            });

            return res.json({
                success: true,
                message: `${plan} subscription activated!`,
                subscription: user.subscription,
                newBalance: user.coins,
                coinBonus,
            });

        } else {
            // ── Coin deposit ──
            const coinsToAdd = Number(amount);
            user.coins = (user.coins || 0) + coinsToAdd;
            user.totalDeposited = (user.totalDeposited || 0) + coinsToAdd;
            await user.save();

            await Transaction.create({
                user: req.user._id,
                type: 'deposit',
                amount: coinsToAdd,
                description: `Coin Purchase via Razorpay (Ref: ${razorpay_payment_id})`,
            });

            return res.json({
                success: true,
                message: 'Coins added successfully',
                newBalance: user.coins,
            });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
};

module.exports = { createOrder, verifyPayment };
