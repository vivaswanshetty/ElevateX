import React, { useState } from 'react';
import { Smartphone, Bell, Wifi, Layers, Send, CheckCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Toast from '../components/Toast';

const MobileApp = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await api.post('/waitlist', { email, source: 'mobile_app_page' });
            setSubmitted(true);
            setEmail('');
            setToast({ type: 'success', message: 'You have been added to the waitlist!' });
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20 overflow-hidden relative">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-6">
                        <Smartphone className="w-4 h-4" /> Coming Soon
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white leading-tight">
                        Your Entire Workflow.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">In Your Pocket.</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
                        Manage tasks, track progress, join duels, and handle payments on the go. The full power of ElevateX, optimized for mobile.
                    </p>

                    <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl max-w-md">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Get Early Access</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                            Join the waitlist to be dealing first to know when we launch the beta.
                        </p>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-3 font-bold"
                                >
                                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                                    <span>You're on the list! We'll be in touch.</span>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="relative"
                                >
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Join Waitlist <Send className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative hidden lg:block"
                >
                    {/* Abstract Phone Mockup */}
                    <div className="relative w-[320px] h-[640px] mx-auto bg-gray-900 border-[12px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden z-20 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-xl z-30" />

                        {/* Screen Content */}
                        <div className="w-full h-full bg-white dark:bg-[#050505] p-4 pt-12 text-slate-900 dark:text-white overflow-hidden flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                                <Bell className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Card 1 */}
                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                                <div className="h-2 w-20 bg-gray-300 dark:bg-white/20 rounded mb-3" />
                                <div className="h-16 w-full bg-blue-500/10 rounded-xl mb-3" />
                                <div className="flex justify-between">
                                    <div className="h-2 w-8 bg-gray-300 dark:bg-white/20 rounded" />
                                    <div className="h-2 w-8 bg-gray-300 dark:bg-white/20 rounded" />
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 flex-1">
                                <div className="h-2 w-32 bg-gray-300 dark:bg-white/20 rounded mb-4" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-24 bg-purple-500/10 rounded-xl" />
                                    <div className="h-24 bg-pink-500/10 rounded-xl" />
                                </div>
                            </div>

                            {/* Bottom Nav */}
                            <div className="mt-auto bg-gray-100 dark:bg-white/5 p-3 rounded-2xl flex justify-between px-6">
                                <div className="w-6 h-6 bg-blue-500 rounded-full" />
                                <div className="w-6 h-6 bg-gray-300 dark:bg-white/20 rounded-full" />
                                <div className="w-6 h-6 bg-gray-300 dark:bg-white/20 rounded-full" />
                                <div className="w-6 h-6 bg-gray-300 dark:bg-white/20 rounded-full" />
                            </div>
                        </div>
                    </div>
                    {/* Shadow/Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-blue-500/20 blur-[60px] -z-10" />
                </motion.div>
            </div>

            <div className="max-w-6xl mx-auto mt-20 grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Bell className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Instant Alerts</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Never miss a job opportunity. Get real-time push notifications for urgent tasks.
                    </p>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Layers className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Native Speed</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Built with React Native for 60fps animations and instant load times.
                    </p>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-cyan-500/50 transition-colors">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Wifi className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Offline Mode</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Draft proposals and manage tasks even when you lose connection.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileApp;
