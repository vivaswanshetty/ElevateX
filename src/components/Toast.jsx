import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, AlertCircle, Info,
    Coins, ArrowUpRight, ArrowDownLeft, X,
    Trash2, Sparkles, Bell
} from 'lucide-react';

// ─── Config per type ──────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    success: {
        icon: CheckCircle,
        accent: '#22c55e',
        bg: 'rgba(34,197,94,0.08)',
        border: 'rgba(34,197,94,0.18)',
        label: 'Success',
    },
    error: {
        icon: XCircle,
        accent: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.18)',
        label: 'Error',
    },
    warning: {
        icon: AlertCircle,
        accent: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.18)',
        label: 'Warning',
    },
    deposit: {
        icon: ArrowDownLeft,
        accent: '#22c55e',
        bg: 'rgba(34,197,94,0.08)',
        border: 'rgba(34,197,94,0.18)',
        label: 'Deposit',
    },
    withdraw: {
        icon: ArrowUpRight,
        accent: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.18)',
        label: 'Withdraw',
    },
    cleared: {
        icon: Trash2,
        accent: 'rgba(255,255,255,0.6)',
        bg: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.10)',
        label: 'Deleted',
    },
    info: {
        icon: Info,
        accent: '#60a5fa',
        bg: 'rgba(96,165,250,0.08)',
        border: 'rgba(96,165,250,0.18)',
        label: 'Info',
    },
    notification: {
        icon: Bell,
        accent: '#a78bfa',
        bg: 'rgba(167,139,250,0.08)',
        border: 'rgba(167,139,250,0.18)',
        label: 'Notification',
    },
};

const DEFAULT_CONFIG = TYPE_CONFIG.info;

// ─── Component ────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    const duration = toast?.duration ?? 3500;

    useEffect(() => {
        if (!toast || duration === Infinity) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [toast, duration, onClose]);

    if (!toast) return null;

    const cfg = TYPE_CONFIG[toast.type] || DEFAULT_CONFIG;
    const Icon = cfg.icon;
    const isCoinTx = toast.type === 'deposit' || toast.type === 'withdraw';

    return (
        <AnimatePresence>
            {toast && (
                <div className="fixed top-5 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -24, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className="pointer-events-auto"
                    >
                        <div
                            className="relative flex items-start gap-3.5 px-4 py-3.5 rounded-2xl min-w-[300px] max-w-sm overflow-hidden"
                            style={{
                                background: `rgba(8,8,8,0.92)`,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${cfg.border}`,
                                boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset`,
                            }}
                        >
                            {/* Left accent bar */}
                            <div
                                className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                                style={{ background: cfg.accent }}
                            />

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
                                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
                                style={{ background: cfg.bg }}
                            >
                                <Icon className="w-4 h-4" style={{ color: cfg.accent }} />
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-1">
                                {/* Title (type label or custom title) */}
                                <motion.p
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 }}
                                    className="font-bold text-sm leading-tight text-white"
                                >
                                    {toast.title || cfg.label}
                                </motion.p>

                                {/* Message */}
                                {toast.message && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.12 }}
                                        className="text-xs mt-0.5 leading-relaxed"
                                        style={{ color: 'rgba(255,255,255,0.60)' }}
                                    >
                                        {toast.message}
                                    </motion.p>
                                )}

                                {/* Coin amount badge */}
                                {isCoinTx && toast.amount && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.18, type: 'spring' }}
                                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                    >
                                        <Coins className="w-3.5 h-3.5" style={{ color: cfg.accent }} />
                                        <span className="font-black text-sm" style={{ color: cfg.accent }}>
                                            {toast.type === 'deposit' ? '+' : '−'}{toast.amount}
                                        </span>
                                        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                            coins
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Close button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={onClose}
                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors mt-0.5"
                                style={{ color: 'rgba(255,255,255,0.40)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
                                }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </motion.button>

                            {/* Progress bar */}
                            {duration !== Infinity && (
                                <motion.div
                                    className="absolute bottom-0 left-0 h-[2px] rounded-full"
                                    style={{ background: cfg.accent, opacity: 0.5 }}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: duration / 1000, ease: 'linear' }}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
