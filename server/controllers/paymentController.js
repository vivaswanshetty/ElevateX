const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order (Deposit OR Subscription)
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { type, amount, plan, billingCycle, currency } = req.body; // currency: 'INR' | 'USD'
        const selectedCurrency = currency || 'INR';

        let amountInSmallestUnit = 0; // paise or cents
        let notes = {
            userId: req.user._id.toString(),
            type: type || 'deposit',
            currency: selectedCurrency
        };

        if (type === 'subscription') {
            // Subscription Logic with BALANCED PRICING (Accessible yet Profitable)
            // Pro: ₹699/mo (Standard) | Elite: ₹1,999/mo (Premium)
            const PRICING = {
                INR: {
                    'pro_monthly': 699 * 100,     // ₹699
                    'pro_yearly': 6999 * 100,     // ₹6,999 (2 months free)
                    'elite_monthly': 1999 * 100,  // ₹1,999
                    'elite_yearly': 19999 * 100   // ₹19,999
                },
                USD: {
                    'pro_monthly': 999,      // $9.99
                    'pro_yearly': 9900,      // $99.00
                    'elite_monthly': 2999,   // $29.99
                    'elite_yearly': 29900    // $299.00
                }
            };

            const key = `${plan}_${billingCycle}`;
            amountInSmallestUnit = PRICING[selectedCurrency]?.[key];

            if (!amountInSmallestUnit) {
                return res.status(400).json({ success: false, message: 'Invalid plan, billing cycle, or currency' });
            }

            notes.plan = plan;
            notes.billingCycle = billingCycle;

        } else {
            // Coin Deposit Logic
            if (!amount || amount <= 0) {
                return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
            }

            // Exchange Rates for Coins
            if (selectedCurrency === 'INR') {
                const COIN_RATE_INR = 2; // 1 Coin = ₹2
                amountInSmallestUnit = Math.round(amount * COIN_RATE_INR * 100);
                // Min ₹50
                if (amountInSmallestUnit < 5000) {
                    if (amount < 25) return res.status(400).json({ success: false, message: 'Minimum deposit is 25 coins' });
                }
            } else {
                const COIN_RATE_USD = 0.05; // 1 Coin = $0.05
                amountInSmallestUnit = Math.round(amount * COIN_RATE_USD * 100);
            }

            notes.coinAmount = amount.toString();
        }

        const options = {
            amount: amountInSmallestUnit,
            currency: selectedCurrency,
            receipt: `rcpt_${Date.now().toString().slice(-4)}_${req.user._id.toString().slice(-4)}`,
            notes: notes
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment details missing' });
        }

        // 1. Verify Signature locally
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid Signature' });
        }

        // 2. Check if processed
        const existingTx = await Transaction.findOne({ 'metadata.orderId': razorpay_order_id });
        if (existingTx) {
            return res.status(200).json({ success: true, message: 'Payment already processed' });
        }

        // 3. Fetch Order ID from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const { type, userId, currency } = order.notes;

        if (userId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User mismatch' });
        }

        const user = await User.findById(req.user._id);

        if (type === 'subscription') {
            const { plan, billingCycle } = order.notes;

            const expiry = billingCycle === 'yearly'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            user.subscription = {
                plan: plan,
                startDate: new Date(),
                expiryDate: expiry,
                isActive: true
            };
            await user.save();

            await Transaction.create({
                user: req.user._id,
                type: 'subscription',
                amount: order.amount / 100,
                description: `Subscription Upgrade: ${plan.toUpperCase()} (${billingCycle})`,
                metadata: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    plan,
                    billingCycle,
                    currency: order.currency
                }
            });

            res.status(200).json({
                success: true,
                message: `Successfully upgraded to ${plan} plan!`,
                subscription: user.subscription
            });

        } else {
            const coinAmount = Number(order.notes.coinAmount);

            user.coins += coinAmount;
            user.totalDeposited += coinAmount;
            await user.save();

            await Transaction.create({
                user: req.user._id,
                type: 'deposit',
                amount: order.amount / 100,
                description: `Coin Deposit: ${coinAmount} Coins`,
                metadata: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    coins: coinAmount,
                    currency: order.currency
                }
            });

            res.status(200).json({
                success: true,
                message: 'Coins credited successfully',
                coins: user.coins
            });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};
