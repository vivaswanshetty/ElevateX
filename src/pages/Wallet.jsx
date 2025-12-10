import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, CreditCard, TrendingUp, DollarSign, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import TransactionModal from '../components/TransactionModal';

const Wallet = () => {
    const { currentUser, getUserProfile } = useAuth();
    const { transactions, depositCoins, withdrawCoins } = useData();
    const [showAuth, setShowAuth] = useState(false);
    const [toast, setToast] = useState(null);
    const [transactionModal, setTransactionModal] = useState({ isOpen: false, type: 'deposit' });
    const [loading, setLoading] = useState(false);

    const user = getUserProfile();

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Please login to view your wallet</h2>
                <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold transition-transform hover:scale-105">
                    Login
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </div>
        );
    }

    const showToast = (type, message, amount) => {
        setToast({ type, message, amount });
    };

    const handleTransaction = async (amount) => {
        setLoading(true);
        try {
            if (transactionModal.type === 'deposit') {
                await depositCoins(amount);
                showToast('deposit', 'Deposit Successful', amount);
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

    const openModal = (type) => {
        setTransactionModal({ isOpen: true, type });
    };

    const myTransactions = Array.isArray(transactions) ? transactions : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-20">
            <AnimatePresence>
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        amount={toast.amount}
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

            {/* Banner Section */}
            <div className="h-64 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 -mt-32 relative z-10">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column - Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Main Balance Card */}
                        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <WalletIcon className="w-32 h-32 text-red-500 transform rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
                                        <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm uppercase">Total Balance</span>
                                </div>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {user.coins?.toLocaleString() || 0}
                                    </span>
                                    <span className="text-xl font-bold text-red-500">XP</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => openModal('deposit')}
                                        className="flex flex-col items-center justify-center p-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg group/btn"
                                    >
                                        <div className="p-2 bg-white/10 dark:bg-black/10 rounded-full mb-2 group-hover/btn:bg-white/20 dark:group-hover/btn:bg-black/20 transition-colors">
                                            <ArrowDownLeft className="w-5 h-5" />
                                        </div>
                                        Deposit
                                    </button>
                                    <button
                                        onClick={() => openModal('withdraw')}
                                        className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <div className="p-2 bg-gray-200 dark:bg-white/10 rounded-full mb-2">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#111] p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Income</span>
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    +{myTransactions.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#111] p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                                        <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Spent</span>
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    -{myTransactions.filter(t => t.type === 'withdraw').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Transaction History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8"
                    >
                        <div className="bg-white dark:bg-[#111] rounded-3xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden min-h-[600px]">
                            <div className="p-8 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl">
                                        <History className="w-6 h-6 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Your recent financial activity</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {myTransactions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <History className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No transactions yet</h4>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                            Start by depositing some funds to your wallet to see your transaction history here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myTransactions.map((tx) => (
                                            <div
                                                key={tx._id || tx.id}
                                                className="group flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'deposit'
                                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                                        : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg capitalize mb-1">
                                                            {tx.description || tx.type}
                                                        </h4>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`text-xl font-bold ${tx.type === 'deposit'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
