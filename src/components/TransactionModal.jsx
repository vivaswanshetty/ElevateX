import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, type, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || Number(amount) <= 0) return;
        onConfirm(Number(amount));
        setAmount('');
    };

    const isDeposit = type === 'deposit';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-white/10"
                        >
                            <div className={`p-6 bg-gradient-to-br ${isDeposit ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'}`}>
                                <div className="flex items-center justify-between text-white mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            {isDeposit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{isDeposit ? 'Deposit Coins' : 'Withdraw Coins'}</h2>
                                            <p className="text-white/80 text-sm">Enter amount to {isDeposit ? 'add' : 'withdraw'}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xl font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            autoFocus
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !amount || Number(amount) <= 0}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                                        ${isDeposit
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isDeposit ? 'Deposit Funds' : 'Withdraw Funds'}
                                        </>
                                    )}
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
