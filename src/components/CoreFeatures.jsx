import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, Database, MessageSquare, Shield, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        category: "Frontend",
        icon: Layout,
        color: "from-blue-500 to-cyan-500",
        glowColor: "rgba(59, 130, 246, 0.4)",
        items: ["Trending home feed", "User dashboard", "Weekly leaderboard", "Task creation page", "Real-time chat"]
    },
    {
        category: "Backend",
        icon: Server,
        color: "from-purple-500 to-pink-500",
        glowColor: "rgba(168, 85, 247, 0.4)",
        items: ["Secure REST API", "JWT authentication", "Role-based access", "Task lifecycle tracking", "Notification system"]
    },
    {
        category: "Database",
        icon: Database,
        color: "from-orange-500 to-red-500",
        glowColor: "rgba(249, 115, 22, 0.4)",
        items: ["Users Schema", "Tasks Schema", "Leaderboard Data", "Chat History", "Optimized Indexing"]
    }
];

const CoreFeatures = () => {
    const navigate = useNavigate();

    return (
        <section className="py-16 bg-transparent transition-colors duration-300 relative overflow-hidden">
            {/* Floating Particles */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`core-features-particle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 3 + 2,
                        height: Math.random() * 3 + 2,
                        background: i % 2 === 0
                            ? 'radial-gradient(circle, #3b82f6, #2563eb)'
                            : 'radial-gradient(circle, #f97316, #ea580c)',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                        zIndex: 5,
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                        y: Math.random() * 600,
                        opacity: 0.2
                    }}
                    animate={{
                        y: [null, Math.random() * 600],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 15 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Background Decorations */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"
            />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800/30 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Powerful Stack</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 pb-2">
                        Core Features
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Built with modern technologies for maximum performance and scalability
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: index * 0.15, duration: 0.6 }
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            whileHover={{
                                scale: 1.1,
                                y: -15,
                                rotateY: 5,
                                rotateX: 5,
                                transition: { duration: 0.2 }
                            }}
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                            onClick={() => navigate(`/tech-stack/${feature.category.toLowerCase()}`)}
                            className="relative group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Animated Gradient Border on Hover */}
                            <div
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `linear-gradient(135deg, transparent, ${feature.glowColor}40, transparent)`
                                }}
                            />

                            {/* Glow Effect on Hover */}
                            <div
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
                                style={{
                                    background: `radial-gradient(circle at center, ${feature.glowColor}, transparent 70%)`
                                }}
                            />

                            <div className="relative z-10">
                                {/* Icon */}
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl transition-all`}
                                >
                                    <feature.icon className="w-7 h-7 text-white" />
                                </motion.div>

                                <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
                                    {feature.category}
                                </h3>

                                <ul className="space-y-3">
                                    {feature.items.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.15 + i * 0.05 }}
                                            className="flex items-center text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.5 }}
                                                className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3 shadow-sm`}
                                            />
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoreFeatures;
