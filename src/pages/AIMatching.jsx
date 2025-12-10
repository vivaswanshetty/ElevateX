import React from 'react';
import { Cpu, Zap, Target, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const AIMatching = () => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="w-20 h-20 mx-auto bg-pink-500/10 rounded-3xl flex items-center justify-center mb-8 border border-pink-500/20">
                    <Cpu className="w-10 h-10 text-pink-500" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    AI-Powered Matching
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                    Leveraging advanced Machine Learning algorithms to connect the right talent with the right opportunities instantly.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-pink-500/50 transition-colors">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Brain className="w-6 h-6 text-pink-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Skill Analysis</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Our AI analyzes user portfolios, GitHub repositories, and past project performance to build a comprehensive skill profile.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-pink-500/50 transition-colors">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart Recommendations</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Get personalized task recommendations that match your expertise and career goals, increasing your chances of success.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-pink-500/50 transition-colors">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Automated Vetting</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            AI-driven code analysis and preliminary tests to verify skills before a user applies, saving time for clients.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIMatching;
