import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ArrowUpRight, ArrowDownLeft, Loader } from 'lucide-react';

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500];

const TransactionModal = ({ isOpen, onClose, type, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Reset amount when modal opens
    useEffect(() => {
        if (isOpen) setAmount('');
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || Number(amount) <= 0) return;
        onConfirm(Number(amount));
    };

    const isDeposit = type === 'deposit';
    const accent = isDeposit ? '#22c55e' : '#ef4444';
    const accentBg = isDeposit ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
    const accentBorder = isDeposit ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)';
    const accentGlow = isDeposit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';

    const isValid = amount && !isNaN(amount) && Number(amount) > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[150]"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[151] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            className="w-full max-w-sm rounded-2xl overflow-hidden"
                            style={{
                                background: '#0a0a0a',
                                border: `1px solid ${accentBorder}`,
                                boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset`,
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 pt-6 pb-5 flex items-start justify-between"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                                        {isDeposit
                                            ? <ArrowDownLeft className="w-5 h-5" style={{ color: accent }} />
                                            : <ArrowUpRight className="w-5 h-5" style={{ color: accent }} />
                                        }
                                    </div>
                                    <div>
                                        <h2 className="font-black text-white text-lg leading-tight">
                                            {isDeposit ? 'Deposit Coins' : 'Withdraw Coins'}
                                        </h2>
                                        <p className="text-xs mt-0.5 font-light"
                                            style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            {isDeposit ? 'Add coins to your wallet' : 'Withdraw coins from your wallet'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
                                    style={{ color: 'rgba(255,255,255,0.40)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                                {/* Amount input */}
                                <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2.5"
                                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                                        Amount (coins)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Coins className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0"
                                            autoFocus
                                            min="1"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-xl font-black text-white placeholder-white/20 focus:outline-none transition-all appearance-none"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${amount && isValid ? accentBorder : 'rgba(255,255,255,0.08)'}`,
                                                boxShadow: amount && isValid ? `0 0 0 3px ${accentGlow}` : 'none',
                                            }}
                                            onFocus={e => {
                                                e.currentTarget.style.border = `1px solid ${accentBorder}`;
                                                e.currentTarget.style.boxShadow = `0 0 0 3px ${accentGlow}`;
                                            }}
                                            onBlur={e => {
                                                if (!isValid) {
                                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Quick-select amounts */}
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5"
                                        style={{ color: 'rgba(255,255,255,0.35)' }}>Quick select</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {QUICK_AMOUNTS.map(q => (
                                            <button
                                                key={q}
                                                type="button"
                                                onClick={() => setAmount(String(q))}
                                                className="py-2 rounded-xl text-sm font-bold transition-all"
                                                style={{
                                                    background: Number(amount) === q ? accentBg : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${Number(amount) === q ? accentBorder : 'rgba(255,255,255,0.07)'}`,
                                                    color: Number(amount) === q ? accent : 'rgba(255,255,255,0.60)',
                                                }}
                                                onMouseEnter={e => {
                                                    if (Number(amount) !== q) {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (Number(amount) !== q) {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                        e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                                                    }
                                                }}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !isValid}
                                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    style={{
                                        background: isValid
                                            ? (isDeposit
                                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                : 'linear-gradient(135deg, #ef4444, #dc2626)')
                                            : 'rgba(255,255,255,0.06)',
                                        boxShadow: isValid ? `0 4px 20px ${accentGlow}` : 'none',
                                    }}
                                >
                                    {loading
                                        ? <Loader className="w-4 h-4 animate-spin" />
                                        : <>
                                            {isDeposit
                                                ? <ArrowDownLeft className="w-4 h-4" />
                                                : <ArrowUpRight className="w-4 h-4" />
                                            }
                                            {isDeposit ? 'Deposit Coins' : 'Withdraw Coins'}
                                        </>
                                    }
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TransactionModal;
