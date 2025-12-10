import React from 'react';
import { Users, Calendar, Trophy, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CommunityEvents = () => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 border border-green-500/20">
                    <Users className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    Community & Events
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                    Building a vibrant ecosystem where developers, designers, and creators can connect, learn, and grow together.
                </p>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Trophy className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Hackathons</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Monthly global hackathons with massive prize pools, sponsored by top tech companies and protocols.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Workshops & Webinars</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Live sessions from industry experts on the latest technologies, career advice, and freelancing tips.
                        </p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                            <MessageCircle className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mentorship Program</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Connect with senior developers and designers for 1-on-1 mentorship and guidance.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CommunityEvents;
