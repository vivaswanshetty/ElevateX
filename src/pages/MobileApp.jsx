import React from 'react';
import { Smartphone, Bell, Wifi, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileApp = () => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
                    <Smartphone className="w-10 h-10 text-blue-500" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    ElevateX Mobile
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                    Work from anywhere, anytime. The full power of ElevateX in your pocket, coming to iOS and Android.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Bell className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Instant Notifications</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Never miss a job opportunity or message. Get real-time push notifications for new tasks, applications, and payments.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Layers className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Native Experience</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            A buttery smooth, native mobile experience built with React Native for maximum performance and responsiveness.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Wifi className="w-6 h-6 text-cyan-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Offline Mode</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Draft proposals, view saved tasks, and manage your profile even without an internet connection.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MobileApp;
