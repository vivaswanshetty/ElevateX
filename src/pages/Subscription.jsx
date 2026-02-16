import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Crown, Star, Shield, ArrowRight, Loader2, Lock, IndianRupee } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PaymentModal = ({ isOpen, onClose, plan, billingCycle, currency }) => {
    const [step, setStep] = useState('summary'); // 'summary', 'processing', 'success', 'failed'
    const [error, setError] = useState('');
    const { currentUser, updateUser } = useAuth();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirm = async () => {
        setStep('processing');
        setError('');

        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your connection.');
            }

            const { data: orderData } = await api.post('/payments/create-order', {
                type: 'subscription',
                plan: plan.id,
                billingCycle,
                currency,
                amount: plan.priceRaw
            });

            if (!orderData.success) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ElevateX",
                description: `${plan.name} Plan Subscription`,
                image: "https://your-logo-url.com/logo.png",
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            setStep('success');
                            if (updateUser) {
                                updateUser(currentUser.name, {
                                    subscription: verifyRes.data.subscription
                                });
                            }
                        } else {
                            throw new Error(verifyRes.data.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        console.error(err);
                        setStep('failed');
                        setError(err.message || 'Verification Failed');
                    }
                },
                prefill: {
                    name: currentUser?.name || "",
                    email: currentUser?.email || "",
                    contact: currentUser?.phone || ""
                },
                theme: {
                    color: "#7c3aed"
                },
                modal: {
                    ondismiss: () => setStep('summary')
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setStep('failed');
                setError(response.error.description);
            });
            rzp1.open();

        } catch (err) {
            console.error(err);
            setStep('failed');
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#0f0f0f]/95 w-full max-w-lg rounded-[32px] shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl"
            >
                {step === 'summary' && (
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Checkout</h3>
                                <p className="text-gray-400 text-sm">Secure payment via Razorpay</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 mb-8 border border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg transform rotate-3`}>
                                        <plan.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{plan.name} Plan</h4>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                            Billed {billingCycle}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white tracking-tight">{plan.priceDisplay}</div>
                                    <div className="text-xs text-gray-500">Total ({currency})</div>
                                </div>
                            </div>
                        </div>

                        <ul className="mb-8 space-y-3">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Instant activation</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{plan.coinBonus} credited immediately</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <Shield className="w-4 h-4 text-purple-500" />
                                <span>Secure transaction via Razorpay</span>
                            </li>
                        </ul>

                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            <Lock className="w-4 h-4 group-hover:text-purple-200 transition-colors" />
                            <span>Pay {plan.priceDisplay}</span>
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">Processing...</h3>
                        <p className="text-gray-400">Please complete the payment.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
                        >
                            <Check className="w-10 h-10 text-white" strokeWidth={3} />
                        </motion.div>
                        <h3 className="text-2xl font-black text-white mb-4">You are now {plan.name}!</h3>
                        <p className="text-gray-400 mb-8">{plan.coinBonus} have been added to your wallet.</p>
                        <button onClick={onClose} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
                            Let's Go!
                        </button>
                    </div>
                )}

                {step === 'failed' && (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                            <X className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Failed</h3>
                        <p className="text-gray-400 mb-6 max-w-xs mx-auto text-sm">{error}</p>
                        <button onClick={() => setStep('summary')} className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl">Try Again</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const Subscription = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
    const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const userPlan = currentUser?.subscription?.plan || 'free';

    const handleSubscribe = (plan) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (plan.id === userPlan) return;

        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    // REVISED PRICING: Accessible & Profitable
    const getPrice = (planId) => {
        if (planId === 'free') return '0';

        if (currency === 'INR') {
            if (planId === 'pro') return billingCycle === 'monthly' ? '699' : '6,999';
            if (planId === 'elite') return billingCycle === 'monthly' ? '1,999' : '19,999';
        } else {
            if (planId === 'pro') return billingCycle === 'monthly' ? '9.99' : '99';
            if (planId === 'elite') return billingCycle === 'monthly' ? '29.99' : '299';
        }
        return '0';
    };

    const plans = [
        {
            id: 'free',
            name: "Starter",
            priceDisplay: currency === 'INR' ? '₹0' : '$0',
            priceRaw: 0,
            period: "/forever",
            description: "Essential tools to start your journey.",
            icon: Star,
            color: "from-blue-400 to-cyan-400",
            shadowColor: "shadow-blue-500/20",
            features: [
                { text: "50 Daily Coins", info: "Earn coins by logging in" },
                { text: "Access to Basic Tasks", info: "Tasks under 500 Coins reward" },
                { text: "Community Support" },
                { text: "Standard Profile" }
            ],
            notIncluded: [
                "Premium High-Value Tasks",
                "Monthly Coin Bonus",
                "Verified Badge",
                "0% Service Fee"
            ],
            cta: userPlan === 'free' ? "Current Plan" : "Downgrade",
            ctaStyle: "secondary"
        },
        {
            id: 'pro',
            name: "Pro",
            priceDisplay: currency === 'INR' ? `₹${getPrice('pro')}` : `$${getPrice('pro')}`,
            priceRaw: currency === 'INR' ? (billingCycle === 'monthly' ? 699 : 6999) : (billingCycle === 'monthly' ? 9.99 : 99),
            period: billingCycle === 'monthly' ? "/month" : "/year",
            description: "For serious freelancers ready to scale.",
            icon: Zap,
            color: "from-purple-500 to-pink-500",
            shadowColor: "shadow-purple-500/40",
            popular: true,
            coinBonus: "500 Coins/mo",
            features: [
                { text: "500 Monthly Coins", highlight: true, info: "Worth ₹1000 in value!" },
                { text: "Unlimited Task Applications" },
                { text: "Verified Pro Badge" },
                { text: "Access to Premium Tasks", info: "Exclusive high-reward tasks (>500 Coins)" },
                { text: "Priority Support" }
            ],
            notIncluded: ["0% Service Fee", "Dedicated Account Manager"],
            cta: userPlan === 'pro' ? "Current Plan" : "Upgrade to Pro",
            ctaStyle: "primary"
        },
        {
            id: 'elite',
            name: "Elite",
            priceDisplay: currency === 'INR' ? `₹${getPrice('elite')}` : `$${getPrice('elite')}`,
            priceRaw: currency === 'INR' ? (billingCycle === 'monthly' ? 1999 : 19999) : (billingCycle === 'monthly' ? 29.99 : 299),
            period: billingCycle === 'monthly' ? "/month" : "/year",
            description: "Maximum power for agencies and top tier.",
            icon: Crown,
            color: "from-yellow-400 to-orange-500",
            shadowColor: "shadow-orange-500/40",
            coinBonus: "2500 Coins/mo",
            features: [
                { text: "2500 Monthly Coins", highlight: true, info: "Worth ₹5000 - Pays for itself!" },
                { text: "0% Service Fee on Earnings" },
                { text: "Dedicated Account Manager" },
                { text: "Early Access to Features" },
                { text: "Custom Profile Theme" }
            ],
            notIncluded: [],
            cta: userPlan === 'elite' ? "Current Plan" : "Get Elite Status",
            ctaStyle: "elite"
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-purple-500/30">
            <AnimatePresence>
                {showPaymentModal && selectedPlan && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        plan={selectedPlan}
                        billingCycle={billingCycle}
                        currency={currency}
                    />
                )}
            </AnimatePresence>

            {/* Enhanced Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-20 pb-0">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold tracking-wider uppercase backdrop-blur-md shadow-inner shadow-purple-500/10"
                    >
                        Premium Access
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Power</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                        Unlock the full potential of your career with massive coin bonuses and exclusive features.
                    </p>

                    {/* CONTROLS */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 bg-white/5 backdrop-blur-xl p-3 px-8 rounded-2xl border border-white/10 w-fit mx-auto shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="w-14 h-7 bg-gray-800 rounded-full relative px-1 transition-colors hover:bg-gray-700 shadow-inner"
                            >
                                <motion.div
                                    className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg mt-1"
                                    layout
                                    animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
                                Yearly <span className="text-green-400 text-[10px] ml-1 font-bold bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-wide border border-green-500/20">Save 17%</span>
                            </span>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-white/10" />

                        <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
                            <button
                                onClick={() => setCurrency('INR')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'bg-transparent text-gray-500 hover:text-white'}`}
                            >
                                <IndianRupee className="w-3 h-3" /> INR
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-transparent text-gray-500 hover:text-white'}`}
                            >
                                <DollarSign className="w-3 h-3" /> USD
                            </button>
                        </div>
                    </div>

                </motion.div>

                {/* Plans Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {plans.map((plan) => (
                        <motion.button
                            key={plan.name}
                            variants={itemVariants}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={`relative w-full text-left rounded-3xl p-1 group ${plan.popular ? 'md:-mt-8 md:mb-8 z-10' : ''}`}
                            onClick={() => plan.ctaStyle !== 'secondary' && handleSubscribe(plan)}
                        >
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${plan.popular ? 'from-purple-500 via-pink-500 to-purple-900' : 'from-gray-800 to-gray-900'} opacity-100 transition-all duration-500 group-hover:opacity-100 group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]`} />

                            <div className="relative h-full bg-[#0a0a0a] rounded-[22px] p-8 flex flex-col overflow-hidden transition-colors group-hover:bg-[#0f0f0f]">
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-600 to-pink-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl tracking-widest uppercase">
                                        Best Value
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg ${plan.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <plan.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 h-10 leading-snug">{plan.description}</p>

                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-5xl font-black text-white tracking-tighter">{plan.priceDisplay}</span>
                                    <span className="text-gray-500 font-bold mb-1.5 text-xs uppercase tracking-wide opacity-60">{plan.period}</span>
                                </div>

                                <div className="w-full h-px bg-gray-800/50 mb-6 group-hover:bg-gray-700/50 transition-colors" />

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 group/item">
                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-medium leading-tight ${feature.highlight ? 'text-white font-bold' : 'text-gray-300'}`}>
                                                    {feature.text}
                                                </span>
                                                {feature.info && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{feature.info}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                    {plan.notIncluded.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 opacity-40">
                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                                <X className="w-3 h-3 text-gray-500" />
                                            </div>
                                            <span className="text-gray-500 text-sm leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div
                                    className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all border text-center ${userPlan === plan.id
                                        ? 'bg-gray-800/50 border-gray-700/50 text-gray-500 cursor-default'
                                        : plan.ctaStyle === 'primary'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 group-hover:scale-[1.02]'
                                            : plan.ctaStyle === 'elite'
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 border-transparent text-black shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 group-hover:scale-[1.02]'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div
                    className="mt-24 text-center pb-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-gray-500 mb-4 font-medium">Have questions?</p>
                    <Link to="/contact" className="text-white font-semibold hover:text-purple-400 transition-colors inline-flex items-center gap-2 group bg-white/5 px-6 py-2 rounded-full hover:bg-white/10 border border-white/5">
                        Contact Support
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Subscription;
