import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, X, Zap, Crown, Star, Shield, ArrowRight, Loader2, Lock,
    IndianRupee, DollarSign, Sparkles, Coins, ChevronDown, Gift,
    Rocket, BadgeCheck, Headphones, TrendingUp, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const HR = () => (
    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
);

// ─── Payment Modal ────────────────────────────────────────────────────────────
const PaymentModal = ({ isOpen, onClose, plan, billingCycle, currency }) => {
    const [step, setStep] = useState('summary');
    const [error, setError] = useState('');
    const { currentUser, updateUser } = useAuth();

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handleConfirm = async () => {
        setStep('processing'); setError('');
        try {
            if (!await loadRazorpay()) throw new Error('Razorpay SDK failed to load.');
            const { data } = await api.post('/payments/create-order', {
                type: 'subscription', plan: plan.id, billingCycle, currency, amount: plan.priceRaw
            });
            if (!data.success) throw new Error(data.message || 'Failed to create order');
            const rzp = new window.Razorpay({
                key: data.keyId, amount: data.amount, currency: data.currency,
                name: 'ElevateX', description: `${plan.name} Plan`, order_id: data.orderId,
                handler: async (r) => {
                    try {
                        const v = await api.post('/payments/verify-payment', {
                            razorpay_order_id: r.razorpay_order_id,
                            razorpay_payment_id: r.razorpay_payment_id,
                            razorpay_signature: r.razorpay_signature,
                            type: 'subscription',
                            plan: plan.id,
                            billingCycle,
                        });
                        if (v.data.success) {
                            setStep('success');
                            if (updateUser) updateUser(currentUser.name, { subscription: v.data.subscription });
                        } else throw new Error(v.data.message);
                    } catch (e) { setStep('failed'); setError(e.message); }
                },
                prefill: { name: currentUser?.name || '', email: currentUser?.email || '' },
                theme: { color: '#ef4444' },
                modal: { ondismiss: () => setStep('summary') }
            });
            rzp.on('payment.failed', r => { setStep('failed'); setError(r.error.description); });
            rzp.open();
        } catch (e) { setStep('failed'); setError(e.response?.data?.message || e.message); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0" onClick={onClose}
                style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
                }}
            >
                {/* Top accent line */}
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />

                {/* Summary */}
                {step === 'summary' && (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white">Confirm Plan</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Secure checkout via Razorpay
                                </p>
                            </div>
                            <button onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
                                style={{ color: 'rgba(255,255,255,0.40)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Plan summary row */}
                        <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-black text-white text-lg">{plan.name} Plan</p>
                                    <p className="text-xs mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                        Billed {billingCycle} · {currency}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">{plan.priceDisplay}</p>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.period}</p>
                                </div>
                            </div>
                        </div>

                        {/* Perks */}
                        <ul className="space-y-3 mb-8">
                            {[
                                { icon: Zap, text: 'Instant activation after payment' },
                                { icon: Gift, text: `${plan.coinBonus} credited immediately` },
                                { icon: Shield, text: 'Secure · 256-bit SSL encrypted' },
                            ].map(({ icon: Icon, text }, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                        <Icon className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 24px rgba(239,68,68,0.25)' }}>
                            <Lock className="w-4 h-4" /> Pay {plan.priceDisplay} Securely
                        </motion.button>
                        <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Cancel anytime · No hidden fees
                        </p>
                    </div>
                )}

                {/* Processing */}
                {step === 'processing' && (
                    <div className="p-16 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef4444' }} />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">Processing</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Complete the payment in the Razorpay window.</p>
                    </div>
                )}

                {/* Success */}
                {step === 'success' && (
                    <div className="p-12 flex flex-col items-center text-center">
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}>
                            <Check className="w-8 h-8" style={{ color: '#22c55e' }} strokeWidth={2.5} />
                        </motion.div>
                        <h3 className="text-2xl font-black text-white mb-1">You're {plan.name} now</h3>
                        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.50)' }}>{plan.coinBonus} added to your wallet.</p>
                        <p className="text-xs mb-8" style={{ color: '#22c55e' }}>Subscription active 🎉</p>
                        <button onClick={onClose}
                            className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            Start Exploring →
                        </button>
                    </div>
                )}

                {/* Failed */}
                {step === 'failed' && (
                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                            <X className="w-8 h-8" style={{ color: '#ef4444' }} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Payment Failed</h3>
                        <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{error || 'Something went wrong.'}</p>
                        <button onClick={() => setStep('summary')}
                            className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            Try Again
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
        >
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 text-left group"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-semibold text-sm pr-8 transition-colors"
                    style={{ color: open ? '#fff' : 'rgba(255,255,255,0.70)' }}>
                    {q}
                </span>
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronRight className="w-4 h-4" style={{ color: open ? '#ef4444' : 'rgba(255,255,255,0.30)' }} />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        <p className="pt-3 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Subscription = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [currency, setCurrency] = useState('INR');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const userPlan = currentUser?.subscription?.plan || 'free';

    const handleSubscribe = (plan) => {
        if (!currentUser) { navigate('/login'); return; }
        if (plan.id === userPlan || plan.id === 'free') return;
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const getPrice = (id) => {
        if (id === 'free') return { display: currency === 'INR' ? '₹0' : '$0', raw: 0, period: '/forever' };
        if (currency === 'INR') {
            if (id === 'pro') return { display: billingCycle === 'monthly' ? '₹299' : '₹3,399', raw: billingCycle === 'monthly' ? 299 : 3399, period: billingCycle === 'monthly' ? '/mo' : '/yr' };
            if (id === 'elite') return { display: billingCycle === 'monthly' ? '₹999' : '₹8,599', raw: billingCycle === 'monthly' ? 999 : 8599, period: billingCycle === 'monthly' ? '/mo' : '/yr' };
        } else {
            if (id === 'pro') return { display: billingCycle === 'monthly' ? '$4.99' : '$21.99', raw: billingCycle === 'monthly' ? 4.99 : 21.99, period: billingCycle === 'monthly' ? '/mo' : '/yr' };
            if (id === 'elite') return { display: billingCycle === 'monthly' ? '$14.99' : '$137.99', raw: billingCycle === 'monthly' ? 14.99 : 137.99, period: billingCycle === 'monthly' ? '/mo' : '/yr' };
        }
        return { display: '—', raw: 0, period: '' };
    };

    const plans = [
        {
            id: 'free', name: 'Starter', tagline: 'Get started for free.',
            icon: Star,
            coinBonus: '0 Coins',
            features: ['50 Daily Login Coins', 'Basic Task Access', 'Community Support', 'Standard Profile'],
            notIncluded: ['Monthly Coin Bonus', 'Premium Tasks', 'Verified Badge', '0% Service Fee'],
        },
        {
            id: 'pro', name: 'Pro', tagline: 'For serious freelancers.',
            icon: Zap, popular: true,
            coinBonus: '500 Coins/mo',
            features: ['500 Monthly Coins', 'Unlimited Applications', 'Verified Pro Badge', 'Premium Tasks', 'Priority Support'],
            notIncluded: ['0% Service Fee', 'Dedicated Manager'],
        },
        {
            id: 'elite', name: 'Elite', tagline: 'Maximum power.',
            icon: Crown,
            coinBonus: '2,500 Coins/mo',
            features: ['2,500 Monthly Coins', '0% Service Fee', 'Dedicated Manager', 'Early Feature Access', 'Custom Profile Theme'],
            notIncluded: [],
        },
    ].map(p => {
        const price = getPrice(p.id);
        return { ...p, priceDisplay: price.display, priceRaw: price.raw, period: price.period };
    });

    const COMPARE = [
        { label: 'Daily Login Coins', free: '50', pro: '50', elite: '50' },
        { label: 'Monthly Bonus Coins', free: '—', pro: '500', elite: '2,500' },
        { label: 'Task Applications', free: 'Limited', pro: 'Unlimited', elite: 'Unlimited' },
        { label: 'Premium Tasks', free: false, pro: true, elite: true },
        { label: 'Verified Badge', free: false, pro: true, elite: true },
        { label: 'Service Fee', free: '5%', pro: '2%', elite: '0%' },
        { label: 'Account Manager', free: false, pro: false, elite: true },
        { label: 'Custom Profile Theme', free: false, pro: false, elite: true },
    ];

    const FAQS = [
        { q: 'Can I cancel my subscription anytime?', a: 'Yes. Cancel anytime from your account settings. Benefits remain active until the end of your billing period.' },
        { q: 'What happens to my coins if I downgrade?', a: 'Your existing coins are never taken away. Only future monthly bonuses will reflect your new plan.' },
        { q: 'Is there a free trial?', a: 'The Starter plan is free forever with no credit card required. Pro and Elite plans can be refunded within 24 hours of purchase.' },
        { q: 'How are coins credited?', a: 'Monthly bonus coins are credited instantly upon subscription activation and on each renewal date.' },
        { q: 'What payment methods are accepted?', a: 'All major credit/debit cards, UPI, net banking, and wallets via Razorpay.' },
    ];

    return (
        <div className="min-h-screen text-white" style={{ background: '#050505' }}>
            <AnimatePresence>
                {showPaymentModal && selectedPlan && (
                    <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}
                        plan={selectedPlan} billingCycle={billingCycle} currency={currency} />
                )}
            </AnimatePresence>

            {/* Subtle radial glow */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-32">

                {/* ── Hero ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
                        <Sparkles className="w-3 h-3" /> Plans & Pricing
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-5 leading-none">
                        Invest in your<br />
                        <span style={{ color: '#ef4444' }}>growth.</span>
                    </h1>
                    <p className="text-lg max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Unlock coin bonuses, premium tasks, and exclusive features. Start free, upgrade when ready.
                    </p>
                </motion.div>

                {/* ── Controls ── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-4 mb-16 flex-wrap">
                    {/* Billing toggle */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <button onClick={() => setBillingCycle('monthly')}
                            className="text-sm font-bold transition-colors px-2 py-1 rounded-lg"
                            style={{ color: billingCycle === 'monthly' ? '#fff' : 'rgba(255,255,255,0.35)', background: billingCycle === 'monthly' ? 'rgba(255,255,255,0.07)' : 'transparent' }}>
                            Monthly
                        </button>
                        <button onClick={() => setBillingCycle('yearly')}
                            className="text-sm font-bold transition-colors px-2 py-1 rounded-lg flex items-center gap-2"
                            style={{ color: billingCycle === 'yearly' ? '#fff' : 'rgba(255,255,255,0.35)', background: billingCycle === 'yearly' ? 'rgba(255,255,255,0.07)' : 'transparent' }}>
                            Yearly
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.20)' }}>
                                −17%
                            </span>
                        </button>
                    </div>

                    {/* Currency toggle */}
                    <div className="flex items-center p-1 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {[{ id: 'INR', Icon: IndianRupee }, { id: 'USD', Icon: DollarSign }].map(({ id, Icon }) => (
                            <button key={id} onClick={() => setCurrency(id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                                style={{
                                    background: currency === id ? 'rgba(239,68,68,0.12)' : 'transparent',
                                    color: currency === id ? '#ef4444' : 'rgba(255,255,255,0.35)',
                                    border: currency === id ? '1px solid rgba(239,68,68,0.20)' : '1px solid transparent',
                                }}>
                                <Icon className="w-3 h-3" /> {id}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Plan Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-24">
                    {plans.map((plan, idx) => {
                        const isActive = userPlan === plan.id;
                        const isPro = plan.popular;
                        return (
                            <motion.div key={plan.id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + idx * 0.08 }}
                                className={`relative flex flex-col rounded-2xl overflow-hidden ${isPro ? 'md:-mt-4 md:mb-4' : ''}`}
                                style={{
                                    background: isPro ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                                    border: isPro ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.07)',
                                    boxShadow: isPro ? '0 0 60px rgba(239,68,68,0.08)' : 'none',
                                }}
                            >
                                {/* Popular label */}
                                {isPro && (
                                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                                        <div className="px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-b-lg"
                                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}>
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className={`p-7 flex flex-col flex-1 ${isPro ? 'pt-10' : ''}`}>
                                    {/* Plan name */}
                                    <div className="mb-6">
                                        <p className="text-xs font-black tracking-widest uppercase mb-1"
                                            style={{ color: isPro ? '#ef4444' : 'rgba(255,255,255,0.35)' }}>
                                            {plan.name}
                                        </p>
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>{plan.tagline}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-5xl font-black tracking-tighter text-white leading-none">
                                                {plan.priceDisplay}
                                            </span>
                                            {plan.period && (
                                                <span className="text-sm mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                    {plan.period}
                                                </span>
                                            )}
                                        </div>
                                        {plan.coinBonus !== '0 Coins' && (
                                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
                                                <Coins className="w-3 h-3" style={{ color: '#fbbf24' }} />
                                                {plan.coinBonus}
                                            </div>
                                        )}
                                    </div>

                                    <HR />

                                    {/* Features */}
                                    <ul className="space-y-3 my-6 flex-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm"
                                                style={{ color: 'rgba(255,255,255,0.75)' }}>
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(34,197,94,0.12)' }}>
                                                    <Check className="w-2.5 h-2.5" style={{ color: '#22c55e' }} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                        {plan.notIncluded.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm"
                                                style={{ color: 'rgba(255,255,255,0.22)' }}>
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                    <X className="w-2.5 h-2.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <motion.button
                                        whileHover={!isActive && plan.id !== 'free' ? { scale: 1.02 } : {}}
                                        whileTap={!isActive && plan.id !== 'free' ? { scale: 0.98 } : {}}
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={isActive || plan.id === 'free'}
                                        className="w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                        style={
                                            isActive
                                                ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', cursor: 'default' }
                                                : plan.id === 'free'
                                                    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', cursor: 'default' }
                                                    : isPro
                                                        ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 4px 20px rgba(239,68,68,0.25)' }
                                                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }
                                        }
                                    >
                                        {isActive
                                            ? <><BadgeCheck className="w-4 h-4" /> Current Plan</>
                                            : plan.id === 'free'
                                                ? 'Free Forever'
                                                : <>{plan.id === 'elite' ? 'Get Elite' : 'Upgrade to Pro'} <ArrowRight className="w-4 h-4" /></>
                                        }
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Comparison Table ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="mb-24">
                    <h2 className="text-2xl font-black text-white mb-1">Compare plans</h2>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.40)' }}>Everything you need to make the right choice.</p>

                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                        {/* Header */}
                        <div className="grid grid-cols-4" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="p-4 text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Feature</div>
                            {plans.map(p => (
                                <div key={p.id} className="p-4 text-center">
                                    <span className="text-xs font-black uppercase tracking-widest"
                                        style={{ color: p.popular ? '#ef4444' : 'rgba(255,255,255,0.50)' }}>
                                        {p.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Rows */}
                        {COMPARE.map((row, i) => (
                            <div key={i} className="grid grid-cols-4"
                                style={{ borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div className="p-4 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>{row.label}</div>
                                {[row.free, row.pro, row.elite].map((val, j) => (
                                    <div key={j} className="p-4 flex items-center justify-center"
                                        style={{ background: j === 1 ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                                        {typeof val === 'boolean'
                                            ? val
                                                ? <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                : <div className="w-4 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
                                            : <span className="text-sm font-bold text-white">{val}</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Trust strip ── */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-8 mb-24">
                    {[
                        { icon: Shield, text: 'Razorpay Secured' },
                        { icon: Zap, text: 'Cancel Anytime' },
                        { icon: Sparkles, text: 'Instant Activation' },
                        { icon: BadgeCheck, text: '10,000+ Users' },
                    ].map(({ icon: Icon, text }, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                            {text}
                        </div>
                    ))}
                </motion.div>

                {/* ── FAQ ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="max-w-2xl mx-auto mb-24">
                    <h2 className="text-2xl font-black text-white mb-1">FAQ</h2>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.40)' }}>Common questions, answered.</p>
                    {FAQS.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)}
                </motion.div>

                {/* ── Footer CTA ── */}
                <div className="text-center">
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Still have questions?</p>
                    <Link to="/contact"
                        className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                        Contact Support <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
