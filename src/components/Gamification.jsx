import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, Award, Trophy, Target } from 'lucide-react';

const Gamification = () => {
    return (
        <section className="py-16 bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Reduced Particle System */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={`gamification-particle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        background: i % 2 === 0
                            ? 'radial-gradient(circle, #a855f7, #8b5cf6)'
                            : 'radial-gradient(circle, #ec4899, #f43f5e)',
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)',
                        zIndex: 1,
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                        y: Math.random() * 900,
                        opacity: 0.2
                    }}
                    animate={{
                        y: [null, Math.random() * 900],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 15 + 20, // Slower
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Simplified Background Blobs - Static/Slow */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-violet-700/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-pink-600/20 via-rose-600/20 to-red-600/20 blur-3xl rounded-full" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-16">

                    {/* Left Side - Content */}
                    <motion.div
                        className="md:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Static Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300 dark:border-purple-500/50 mb-6 shadow-xl backdrop-blur-md">
                            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                            <span className="text-sm font-black text-purple-700 dark:text-purple-200 tracking-wider">Gamification System</span>
                        </div>

                        {/* Title */}
                        <h2 className="relative text-5xl md:text-7xl font-black mb-8">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 pb-2">
                                Level Up Your Skills
                            </span>
                        </h2>

                        <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 font-medium">
                            Every interaction on ElevateX earns you <span className="font-black text-purple-600 dark:text-purple-400">XP</span>. Climb the ranks, unlock badges, and gain visibility.
                        </p>

                        {/* Simplified XP Cards */}
                        <div className="space-y-5">
                            {[
                                { label: "Complete a task", xp: "+100 XP", icon: Zap, color: "from-yellow-500 to-orange-500" },
                                { label: "5-star rating", xp: "+50 XP", icon: Star, color: "from-purple-500 to-pink-500" },
                                { label: "Daily streak", xp: "+20 XP", icon: TrendingUp, color: "from-green-500 to-emerald-500" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.02,
                                        y: -2,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="relative group"
                                >
                                    <div className="flex items-center justify-between p-5 glass rounded-2xl backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg overflow-hidden bg-white/50 dark:bg-black/20">
                                        <span className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-bold text-lg relative z-10">
                                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                                                <item.icon className="w-5 h-5 text-white" />
                                            </div>
                                            {item.label}
                                        </span>
                                        <span className={`font-black text-2xl bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                            {item.xp}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Optimized Profile Card */}
                    <motion.div
                        className="md:w-1/2 w-full"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md mx-auto"
                        >
                            {/* Static Glow Aura */}
                            <div className="absolute inset-0 rounded-3xl blur-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

                            <div className="relative aspect-[4/3] glass rounded-3xl p-8 flex flex-col justify-between border-2 border-white/30 dark:border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-black/40">

                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="text-3xl font-black text-black dark:text-white mb-1">
                                            Alex Dev
                                        </h3>
                                        <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                            Level 12 Master
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                                        A
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                                        <span>Progress to Level 13</span>
                                        <span className="text-purple-600 dark:text-purple-400">3,450 / 5,000 XP</span>
                                    </div>
                                    <div className="relative h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 relative"
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: "70%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            viewport={{ once: true }}
                                        />
                                    </div>
                                </div>

                                {/* Badge Grid */}
                                <div className="grid grid-cols-3 gap-3 mt-4 relative z-10">
                                    {[
                                        { color: "from-yellow-400 to-orange-500", icon: "🏆" },
                                        { color: "from-purple-400 to-pink-500", icon: "⭐" },
                                        { color: "from-cyan-400 to-blue-500", icon: "💎" }
                                    ].map((badge, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            className="aspect-square bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 rounded-2xl flex items-center justify-center border-2 border-black/10 dark:border-white/10 cursor-pointer shadow-sm"
                                        >
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-md`}>
                                                {badge.icon}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Gamification;
