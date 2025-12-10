import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, Users, Target } from 'lucide-react';

const ProjectSummary = () => {
    return (
        <section className="py-16 bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Reduced Particle System */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`project-particle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        background: i % 2 === 0
                            ? 'radial-gradient(circle, #a855f7, #8b5cf6)'
                            : 'radial-gradient(circle, #f59e0b, #fb923c)',
                        boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
                        zIndex: 1,
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                        y: Math.random() * 700,
                        opacity: 0.2
                    }}
                    animate={{
                        y: [null, Math.random() * 700],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 15 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Static Background Blobs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-violet-700/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/20 via-amber-600/20 to-yellow-700/20 blur-3xl rounded-full" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    {/* Left Side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Static Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/40 dark:to-orange-900/40 border-2 border-purple-300 dark:border-purple-500/50 mb-6 shadow-xl backdrop-blur-md">
                            <div
                            >
                                <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                            </div>
                            <span className="text-sm font-black text-purple-700 dark:text-purple-200 tracking-wider">Platform Overview</span>

                        </div>

                        {/* Title */}
                        <h2 className="relative text-5xl md:text-6xl font-black mb-8 leading-snug">
                            <span
                                className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-orange-600 to-pink-600 dark:from-purple-400 dark:via-orange-400 dark:to-pink-400 pb-2"
                                style={{
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Redefining <br />Micro-Gigs
                            </span>

                        </h2>

                        {/* Text Content */}
                        <div className="space-y-6 text-lg leading-relaxed">
                            <p
                                className="text-gray-700 dark:text-gray-300"
                            >
                                <span
                                    className="text-xl font-black bg-gradient-to-r from-purple-600 to-orange-600 dark:from-purple-400 dark:to-orange-400 bg-clip-text text-transparent"
                                    style={{
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    ElevateX
                                </span> is a platform that connects people who need quick help with those who have the skills to deliver.
                            </p>
                            <p
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Users can post <span
                                    className="font-black text-purple-600 dark:text-purple-400"
                                >
                                    micro-tasks
                                </span>, creative requests, instant gigs, or skill trades. Tasks are completed for fun, XP, or micro-payments. The platform is <span className="font-bold text-purple-600 dark:text-purple-400">fast</span>, <span className="font-bold text-orange-600 dark:text-orange-400">social</span>, and <span className="font-bold text-pink-600 dark:text-pink-400">gamified</span>.
                            </p>
                        </div>

                        {/* Feature Pills */}
                        <div
                            className="flex flex-wrap gap-3 mt-8"
                        >
                            {[
                                { icon: Zap, label: "Lightning Fast", color: "from-yellow-500 to-orange-500" },
                                { icon: Users, label: "Social Hub", color: "from-purple-500 to-pink-500" },
                                { icon: Target, label: "Gamified", color: "from-cyan-500 to-blue-500" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${item.color} text-white font-bold shadow-lg cursor-default`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Optimized 3D Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[500px]"
                    >
                        <div className="relative h-full glass rounded-3xl flex items-center justify-center overflow-hidden backdrop-blur-xl border-2 border-white/20 dark:border-white/10 shadow-xl bg-white/30 dark:bg-black/30">

                            {/* Geometric Shapes - Entrance + Float */}
                            <div className="relative z-10 grid grid-cols-2 gap-6 p-8">
                                {/* Shape 1 - Purple Square */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40, y: -40 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <motion.div
                                        className="w-32 h-32 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-2xl backdrop-blur-md border-2 border-purple-400/40 shadow-xl"
                                        animate={{
                                            y: [0, -25, 0],
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>

                                {/* Shape 2 - Orange Circle */}
                                <motion.div
                                    initial={{ opacity: 0, x: 40, y: -40 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                >
                                    <motion.div
                                        className="w-32 h-32 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 rounded-full backdrop-blur-md border-2 border-orange-400/40 shadow-xl"
                                        animate={{
                                            y: [0, 30, 0],
                                            x: [0, 15, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 1.8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>

                                {/* Shape 3 - Pink Circle */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40, y: 40 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                >
                                    <motion.div
                                        className="w-32 h-32 bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-full backdrop-blur-md border-2 border-pink-400/40 shadow-xl"
                                        animate={{
                                            y: [0, -20, 0],
                                            x: [0, -10, 0],
                                            scale: [1, 1.05, 0.95, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>

                                {/* Shape 4 - Cyan Square */}
                                <motion.div
                                    initial={{ opacity: 0, x: 40, y: 40 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                >
                                    <motion.div
                                        className="w-32 h-32 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-2xl backdrop-blur-md border-2 border-cyan-400/40 shadow-xl"
                                        animate={{
                                            y: [0, 25, 0],
                                            rotate: [0, -10, 10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 1.6,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Mega Glow Around Card */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl blur-3xl -z-10"
                            animate={{
                                opacity: [0.3, 0.7, 0.3],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(251, 146, 60, 0.6), rgba(236, 72, 153, 0.6))'
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProjectSummary;
