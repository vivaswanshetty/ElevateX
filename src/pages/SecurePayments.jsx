import React from 'react';
import { CreditCard, Shield, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const SecurePayments = () => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20">
                    <CreditCard className="w-10 h-10 text-indigo-500" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    Secure Global Payments
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                    We are building a robust financial infrastructure to support freelancers and clients worldwide,
                    combining traditional fiat gateways with the power of blockchain.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Globe className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Fiat Integration</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Seamless integration with <strong>Stripe</strong> and <strong>Razorpay</strong> to allow direct bank transfers,
                            credit card payments, and local currency support in over 135 countries.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart Escrow</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Funds are held in a secure <strong>Smart Contract Escrow</strong> until the task is completed and approved.
                            This ensures safety for both the client and the freelancer.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Crypto Payments</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Support for <strong>USDC, ETH, and SOL</strong> payments for instant, low-fee cross-border transactions.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                            <CreditCard className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Automated Invoicing</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Automatically generate tax-compliant invoices for every transaction, simplifying accounting for freelancers.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SecurePayments;
