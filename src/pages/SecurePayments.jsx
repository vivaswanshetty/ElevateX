import React from 'react';
import { CreditCard, Shield, Globe, Lock, Coins, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SecurePayments = () => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 border border-green-500/20">
                    <Shield className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    Secure Global Financial Infrastructure
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                    ElevateX combines the speed of digital tokens with the reliability of traditional banking.
                    Our hybrid "Coin System" ensures instant, zero-fee micro-transactions for tasks.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-xl group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            Razorpay Integration <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Live</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Seamlessly deposit funds using UPI, Cards, and Netbanking via our secure Razorpay integration.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Instant Deposits
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 text-green-500" /> UPI & Card Support
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-yellow-500/50 transition-all shadow-lg hover:shadow-xl group">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Coins className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            Tokenized Escrow <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Live</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Funds are locked as "Coins" when a task is posted and automatically released to the freelancer upon satisfactory completion.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Zero Fee Transfers
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Automated Release
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-colors opacity-75">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            Crypto Payments <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Q4 2026</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Support for <strong>USDC, ETH, and SOL</strong> payments for instant, low-fee cross-border transactions involving smart contracts.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-orange-500/50 transition-colors opacity-75">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                            <CreditCard className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            Global Payouts <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Q3 2026</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Direct local bank withdrawals in over 135 countries with automated tax compliance and invoicing.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SecurePayments;
