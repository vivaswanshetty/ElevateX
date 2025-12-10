import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Cpu, Users, Smartphone, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const futureFeatures = [
    {
        icon: CreditCard,
        title: "Secure Payments",
        desc: "Razorpay / Stripe Integration",
        link: "/future/payments",
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        glowColor: "16, 185, 129",
        accentColor: "from-emerald-400 to-teal-400"
    },
    {
        icon: Cpu,
        title: "AI Matching",
        desc: "Smart Skill Recommendations",
        link: "/future/ai-matching",
        gradient: "from-blue-500 via-cyan-500 to-sky-500",
        glowColor: "6, 182, 212",
        accentColor: "from-blue-400 to-cyan-400"
    },
    {
        icon: Users,
        title: "Community",
        desc: "Skill Challenges & Events",
        link: "/future/community",
        gradient: "from-purple-500 via-violet-500 to-indigo-500",
        glowColor: "139, 92, 246",
        accentColor: "from-purple-400 to-indigo-400"
    },
    {
        icon: Smartphone,
        title: "Mobile App",
        desc: "React Native Integration",
        link: "/future/mobile-app",
        gradient: "from-pink-500 via-rose-500 to-red-500",
        glowColor: "236, 72, 153",
        accentColor: "from-pink-400 to-rose-400"
    }
];

const FutureScope = () => {
    return (
        <section className="py-16 bg-transparent transition-colors duration-300 relative overflow-hidden">
            {/* Reduced Particle System */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`future-scope-particle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        background: i % 2 === 0
                            ? 'radial-gradient(circle, #10b981, #14b8a6)'
                            : 'radial-gradient(circle, #3b82f6, #06b6d4)',
                        boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                        zIndex: 1,
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

            {/* Static Background Blobs */}
            <div className="absolute top-10 right-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-700/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-rose-700/20 blur-3xl rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/20 via-teal-600/20 to-cyan-700/20 blur-3xl rounded-full opacity-30" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Epic Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    {/* Static Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 border-2 border-cyan-300 dark:border-cyan-500/50 mb-6 shadow-xl backdrop-blur-md">
                        <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
                        <span className="text-sm font-black text-cyan-700 dark:text-cyan-200 tracking-wider">Coming Soon</span>
                        <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                    </div>

                    {/* Static Title */}
                    <h2 className="relative text-5xl md:text-7xl font-black mb-5">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-400 dark:via-purple-400 dark:to-pink-400 leading-snug pb-2">
                            Future Scope
                        </span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
                    >
                        Explore the <span className="font-black text-cyan-600 dark:text-cyan-400">cutting-edge features</span> we're building for the future of productivity.
                    </motion.p>
                </motion.div>

                {/* Insane Feature Cards Grid */}
                <div className="grid md:grid-cols-4 gap-8">
                    {futureFeatures.map((feature, index) => (
                        <Link to={feature.link} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 80, rotateY: -30 }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                    rotateY: 0,
                                    transition: {
                                        duration: 0.8,
                                        delay: index * 0.15,
                                        type: "spring",
                                        stiffness: 100
                                    }
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
                                className="text-center group cursor-pointer h-full relative"
                            >
                                {/* Card Container */}
                                <div className="relative h-full p-8 rounded-3xl glass backdrop-blur-2xl border-2 border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
                                    {/* Static Background Gradient */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{
                                            background: `linear-gradient(135deg, transparent, rgba(${feature.glowColor}, 0.15), transparent)`
                                        }}
                                    />

                                    {/* Holographic Shimmer */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(6,182,212,0.2) 25%, rgba(139,92,246,0.2) 50%, rgba(236,72,153,0.2) 75%, rgba(255,255,255,0) 100%)'
                                        }}
                                        animate={{
                                            backgroundPosition: ['0% 0%', '200% 200%']
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />

                                    {/* Neon Border Pulse */}
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                        animate={{
                                            boxShadow: [
                                                `0 0 20px rgba(${feature.glowColor}, 0.5), inset 0 0 20px rgba(${feature.glowColor}, 0.2)`,
                                                `0 0 50px rgba(${feature.glowColor}, 0.9), inset 0 0 50px rgba(${feature.glowColor}, 0.4)`,
                                                `0 0 20px rgba(${feature.glowColor}, 0.5), inset 0 0 20px rgba(${feature.glowColor}, 0.2)`
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />

                                    {/* Floating Particles Inside Card */}
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
                                            initial={{
                                                x: Math.random() * 200,
                                                y: Math.random() * 200,
                                                opacity: 0
                                            }}
                                            animate={{
                                                y: [null, Math.random() * 200, Math.random() * 200],
                                                x: [null, Math.random() * 200],
                                                opacity: [0, Math.random() * 0.8 + 0.4, 0],
                                                scale: [0.5, Math.random() * 1 + 1.5, 0.5]
                                            }}
                                            transition={{
                                                duration: Math.random() * 4 + 6,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}

                                    {/* Icon Container with Extreme Effects */}
                                    <div className="relative z-10 mb-6">
                                        <motion.div
                                            className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            {/* Rotating Ring */}
                                            <motion.div
                                                className="absolute inset-0 rounded-3xl border-4 border-transparent border-t-white/50"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Icon */}
                                            <motion.div
                                                className="text-white relative z-10"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, -10, 10, 0]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                <feature.icon className="w-10 h-10" />
                                            </motion.div>

                                            {/* Pulsing Glow */}
                                            <motion.div
                                                className="absolute inset-0 rounded-3xl"
                                                animate={{
                                                    boxShadow: [
                                                        `0 0 20px rgba(${feature.glowColor}, 0.6)`,
                                                        `0 0 40px rgba(${feature.glowColor}, 1)`,
                                                        `0 0 20px rgba(${feature.glowColor}, 0.6)`
                                                    ]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>

                                        {/* Orbiting Particles */}
                                        {[0, 120, 240].map((angle, i) => (
                                            <motion.div
                                                key={i}
                                                className={`absolute w-2 h-2 bg-gradient-to-r ${feature.accentColor} rounded-full opacity-0 group-hover:opacity-100`}
                                                style={{
                                                    top: '50%',
                                                    left: '50%',
                                                }}
                                                animate={{
                                                    x: [0, Math.cos((angle * Math.PI) / 180) * 50],
                                                    y: [0, Math.sin((angle * Math.PI) / 180) * 50],
                                                    rotate: [0, 360]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                    delay: i * 0.2
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Title with Gradient */}
                                    <motion.h3
                                        className="text-2xl font-black mb-3 relative z-10"
                                        animate={{
                                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:drop-shadow-lg bg-[length:200%_auto] pb-1`}
                                            style={{
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent"
                                            }}
                                        >
                                            {feature.title}
                                        </span>
                                    </motion.h3>

                                    {/* Description */}
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors relative z-10">
                                        {feature.desc}
                                    </p>

                                    {/* Bottom Accent Line */}
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FutureScope;
