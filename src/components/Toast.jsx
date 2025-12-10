import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, Coins, ArrowUpRight, ArrowDownLeft, X, Sparkles, Trash2 } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast && toast.duration !== Infinity) {
            const timer = setTimeout(() => {
                onClose();
            }, toast.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-6 h-6" />;
            case 'error':
                return <XCircle className="w-6 h-6" />;
            case 'warning':
                return <AlertCircle className="w-6 h-6" />;
            case 'deposit':
                return <ArrowDownLeft className="w-6 h-6" />;
            case 'withdraw':
                return <ArrowUpRight className="w-6 h-6" />;
            case 'cleared':
                return <Trash2 className="w-6 h-6" />;
            case 'info':
            default:
                return <Info className="w-6 h-6" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
            case 'deposit':
                return 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white';
            case 'withdraw':
                return 'bg-gradient-to-br from-orange-600 via-red-600 to-rose-600 text-white';
            case 'cleared':
                return 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-white/10 shadow-2xl shadow-black/50';
            case 'info':
            default:
                return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
        }
    };

    const isCoinTransaction = toast.type === 'deposit' || toast.type === 'withdraw';

    return (
        <AnimatePresence>
            {toast && (
                <div className="fixed top-4 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="pointer-events-auto"
                    >
                        <div className={`${getStyles()} rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-md`}>
                            {/* Animated background effects */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                            </div>

                            <div className="relative z-10 p-4">
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-2"
                                    >
                                        {getIcon()}
                                    </motion.div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {toast.title && (
                                            <motion.h4
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="font-bold text-lg mb-1"
                                            >
                                                {toast.title}
                                            </motion.h4>
                                        )}
                                        {toast.message && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-sm opacity-90"
                                            >
                                                {toast.message}
                                            </motion.p>
                                        )}

                                        {/* Coin amount display for coin transactions */}
                                        {isCoinTransaction && toast.amount && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.25, type: "spring" }}
                                                className="mt-2 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 w-fit"
                                            >
                                                <Coins className="w-5 h-5" />
                                                <span className="font-black text-xl">
                                                    {toast.type === 'deposit' ? '+' : '-'}{toast.amount}
                                                </span>
                                                <span className="text-sm font-medium opacity-80">coins</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Close button */}
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={onClose}
                                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                {/* Progress bar */}
                                {toast.duration && toast.duration !== Infinity && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-white/40"
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: (toast.duration || 3000) / 1000, ease: 'linear' }}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
