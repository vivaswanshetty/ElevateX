import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History,
    CreditCard, TrendingUp, TrendingDown, Zap, Coins,
    ArrowRight, ShieldCheck, Sparkles, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import TransactionModal from '../components/TransactionModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

const TX_LABELS = {
    deposit: 'Coins Deposited',
    withdraw: 'Coins Withdrawn',
    reward: 'Task Reward',
    apply: 'Task Application',
    refund: 'Refund',
    purchase: 'Purchase',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
        </div>
        <div className="text-2xl font-black text-white">{value}</div>
    </motion.div>
);

// ─── Transaction Row ──────────────────────────────────────────────────────────
const TxRow = ({ tx, index }) => {
    const isCredit = ['deposit', 'reward', 'refund'].includes(tx.type);
    const label = TX_LABELS[tx.type] || tx.description || tx.type;

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center gap-4 px-5 py-4 transition-all group"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: isCredit ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${isCredit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}>
                {isCredit
                    ? <ArrowDownLeft className="w-4 h-4" style={{ color: '#22c55e' }} />
                    : <ArrowUpRight className="w-4 h-4" style={{ color: '#ef4444' }} />
                }
            </div>

            {/* Label + date */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm capitalize truncate">{label}</div>
                <div className="text-[11px] mt-0.5 font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {formatDate(tx.createdAt)}
                </div>
            </div>

            {/* Amount */}
            <div className="text-base font-black flex-shrink-0"
                style={{ color: isCredit ? '#22c55e' : 'rgba(255,255,255,0.85)' }}>
                {isCredit ? '+' : '−'}{tx.amount?.toLocaleString()} <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.40)' }}>coins</span>
            </div>
        </motion.div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Wallet = () => {
    const { currentUser, getUserProfile } = useAuth();
    const { transactions, initiateDeposit, withdrawCoins } = useData();
    const [showAuth, setShowAuth] = useState(false);
    const [toast, setToast] = useState(null);
    const [transactionModal, setTransactionModal] = useState({ isOpen: false, type: 'deposit' });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'credit' | 'debit'

    const user = getUserProfile();

    // ── Not logged in ──
    if (!currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
                style={{ background: '#050505' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <WalletIcon className="w-8 h-8" style={{ color: '#ef4444' }} />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">Your Wallet</h2>
                    <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        Login to view your balance and transaction history.
                    </p>
                </div>
                <button
                    onClick={() => setShowAuth(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                    <ArrowRight className="w-4 h-4" /> Login to Continue
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </div>
        );
    }

    const showToast = (type, message, amount) => setToast({ type, message, amount });

    const handleTransaction = async (amount) => {
        setLoading(true);
        try {
            if (transactionModal.type === 'deposit') {
                await initiateDeposit(amount);
            } else {
                await withdrawCoins(amount);
                showToast('withdraw', 'Withdrawal Successful', amount);
            }
            setTransactionModal({ ...transactionModal, isOpen: false });
        } catch (error) {
            showToast('error', error.message || 'Transaction Failed');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type) => setTransactionModal({ isOpen: true, type });

    const myTransactions = Array.isArray(transactions) ? transactions : [];
    const totalIn = myTransactions
        .filter(t => ['deposit', 'reward', 'refund'].includes(t.type))
        .reduce((s, t) => s + (t.amount || 0), 0);
    const totalOut = myTransactions
        .filter(t => !['deposit', 'reward', 'refund'].includes(t.type))
        .reduce((s, t) => s + (t.amount || 0), 0);

    const filteredTx = myTransactions.filter(tx => {
        if (filter === 'credit') return ['deposit', 'reward', 'refund'].includes(tx.type);
        if (filter === 'debit') return !['deposit', 'reward', 'refund'].includes(tx.type);
        return true;
    });

    const planLabel = user.subscription?.plan
        ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)
        : 'Free';

    const depositLimit = user.subscription?.plan === 'elite' ? 'Unlimited'
        : user.subscription?.plan === 'pro' ? '1,000'
            : '200';

    return (
        <div className="min-h-screen pb-28" style={{ background: '#050505' }}>

            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <TransactionModal
                isOpen={transactionModal.isOpen}
                onClose={() => setTransactionModal({ ...transactionModal, isOpen: false })}
                type={transactionModal.type}
                onConfirm={handleTransaction}
                loading={loading}
            />

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-5"
                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Coin Balance
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                        Your Wallet
                    </h1>
                    <p className="text-sm font-light max-w-md mx-auto"
                        style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Manage your coins, track earnings, and fund your applications.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-6">

                    {/* ══ LEFT — Balance + Actions ══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 flex flex-col gap-5"
                    >
                        {/* Balance Card */}
                        <div className="relative rounded-2xl p-7 overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {/* Glow blob */}
                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

                            {/* Plan badge */}
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <CreditCard className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-widest"
                                        style={{ color: 'rgba(255,255,255,0.50)' }}>Total Balance</span>
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                    style={{
                                        background: planLabel === 'Elite' ? 'rgba(245,158,11,0.1)' : planLabel === 'Pro' ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: planLabel === 'Elite' ? '1px solid rgba(245,158,11,0.25)' : planLabel === 'Pro' ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.08)',
                                        color: planLabel === 'Elite' ? '#f59e0b' : planLabel === 'Pro' ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                                    }}>
                                    {planLabel === 'Elite' && <Crown className="w-3 h-3" />}
                                    {planLabel === 'Pro' && <Sparkles className="w-3 h-3" />}
                                    {planLabel}
                                </span>
                            </div>

                            {/* Balance number */}
                            <div className="flex items-baseline gap-2 mb-7 relative z-10">
                                <span className="text-6xl font-black text-white tracking-tight leading-none">
                                    {(user.coins || 0).toLocaleString()}
                                </span>
                                <span className="text-lg font-bold" style={{ color: '#ef4444' }}>coins</span>
                            </div>

                            {/* Deposit limit bar */}
                            <div className="mb-7 relative z-10">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        Deposit limit
                                    </span>
                                    <span className="text-[11px] font-bold text-white">{depositLimit} coins/tx</span>
                                </div>
                                <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-1 rounded-full transition-all"
                                        style={{
                                            width: planLabel === 'Elite' ? '100%' : planLabel === 'Pro' ? '66%' : '20%',
                                            background: planLabel === 'Elite'
                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                : planLabel === 'Pro'
                                                    ? 'linear-gradient(90deg, #a78bfa, #8b5cf6)'
                                                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                        }} />
                                </div>
                                {planLabel === 'Free' && (
                                    <button
                                        onClick={() => { }}
                                        className="text-[11px] font-bold mt-2 flex items-center gap-1 transition-opacity hover:opacity-80"
                                        style={{ color: '#ef4444' }}>
                                        <Sparkles className="w-3 h-3" /> Upgrade for higher limits
                                    </button>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                <button
                                    onClick={() => openModal('deposit')}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}
                                >
                                    <ArrowDownLeft className="w-5 h-5" />
                                    Deposit
                                </button>
                                <button
                                    onClick={() => openModal('withdraw')}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                    Withdraw
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={TrendingUp}
                                label="Total In"
                                value={`+${totalIn.toLocaleString()}`}
                                accent="#22c55e"
                                delay={0.1}
                            />
                            <StatCard
                                icon={TrendingDown}
                                label="Total Out"
                                value={`−${totalOut.toLocaleString()}`}
                                accent="#ef4444"
                                delay={0.15}
                            />
                        </div>

                        {/* XP Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl p-5 flex items-center gap-4"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <Zap className="w-5 h-5" style={{ color: '#a78bfa' }} />
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                                    style={{ color: 'rgba(255,255,255,0.45)' }}>XP Earned</div>
                                <div className="text-xl font-black text-white">{(user.xp || 0).toLocaleString()}</div>
                            </div>
                            <div className="ml-auto">
                                <div className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-right"
                                    style={{ color: 'rgba(255,255,255,0.45)' }}>Level</div>
                                <div className="text-xl font-black text-white text-right">{user.level || 1}</div>
                            </div>
                        </motion.div>

                        {/* Security note */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(34,197,94,0.7)' }} />
                            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                All transactions are secured and verified.
                            </span>
                        </div>
                    </motion.div>

                    {/* ══ RIGHT — Transaction History ══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="lg:col-span-8"
                    >
                        <div className="rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

                            {/* Header */}
                            <div className="px-6 py-5 flex items-center justify-between"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <History className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Transaction History</h3>
                                        <p className="text-[11px] font-light mt-0.5"
                                            style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            {myTransactions.length} total transactions
                                        </p>
                                    </div>
                                </div>

                                {/* Filter pills */}
                                <div className="flex p-1 rounded-xl gap-0.5"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'credit', label: 'In' },
                                        { key: 'debit', label: 'Out' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setFilter(f.key)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                            style={{
                                                background: filter === f.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                color: filter === f.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transaction list */}
                            {filteredTx.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Coins className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.25)' }} />
                                    </div>
                                    <h4 className="font-bold text-white text-base mb-2">No transactions yet</h4>
                                    <p className="text-sm font-light max-w-xs"
                                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        Deposit coins to start applying for tasks and earning rewards.
                                    </p>
                                    <button
                                        onClick={() => openModal('deposit')}
                                        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                    >
                                        <ArrowDownLeft className="w-4 h-4" /> Deposit Coins
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {filteredTx.map((tx, i) => (
                                        <TxRow key={tx._id || tx.id || i} tx={tx} index={i} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Wallet;
