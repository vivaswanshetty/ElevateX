import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Trophy, Users, TrendingUp, Plus, Code, Coffee, Music, Sun, Cloud, Flag, Bookmark, Compass, Rocket, Smile, Cpu, Globe, Layers, MapPin } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = [
        "The skill market for the new gen.",
        "Earn crypto for your skills.",
        "Gamified tasks, real rewards."
    ];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    const stats = [
        { icon: Users, label: "Active Users", value: "100+", color: "from-blue-500 to-cyan-500" },
        { icon: Trophy, label: "Tasks Completed", value: "20+", color: "from-purple-500 to-pink-500" },
        { icon: TrendingUp, label: "Success Rate", value: "98%", color: "from-orange-500 to-red-500" },
    ];

    return (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-300 pt-32 pb-8">
            {/* Layered Background Gradient Orbs - Optimized */}
            <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute bottom-20 -right-20 w-[700px] h-[700px] bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

            {/* Reduced Floating Particles - Optimized */}
            {[...Array(3)].map((_, i) => ( // Reduced from 8 to 3
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 4,
                        height: 4,
                        background: '#f59e0b',
                        opacity: 0.1,
                        zIndex: 100,
                    }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Doodle Pattern Overlay - Reduced Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { Icon: Code, top: '15%', left: '15%' },
                    { Icon: Sparkles, top: '25%', left: '75%' },
                    { Icon: Zap, top: '65%', left: '10%' },
                    { Icon: Rocket, top: '10%', left: '85%' },
                    { Icon: Globe, top: '30%', left: '25%' },
                ].map(({ Icon, top, left }, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-black/5 dark:text-white/10"
                        style={{ top, left }}
                        animate={{
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                        }}
                    >
                        <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
                    </motion.div>
                ))}
            </div>

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20 dark:to-black/20 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-600/40 mb-8 shadow-xl backdrop-blur-sm cursor-pointer"
                    >
                        <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-wider uppercase">The Future of Skill Exchange</span>
                        <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </motion.div>

                    {/* Main Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative mb-8"
                    >
                        <h1
                            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 dark:from-yellow-400 dark:via-yellow-300 dark:to-amber-300 leading-tight pb-2"
                            style={{
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                textShadow: "0 4px 20px rgba(249, 115, 22, 0.2)"
                            }}
                        >
                            ElevateX
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto font-bold"
                    >
                        A playful <span className="text-orange-600 dark:text-orange-400 inline-block">marketplace</span> where skills meet opportunity.
                    </motion.p>

                    {/* Typing Animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 h-10 font-mono"
                    >
                        <span>{text}</span>
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-orange-500 font-bold"
                        >
                            |
                        </motion.span>
                    </motion.div>

                    {/* CTA Buttons - Optimized */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20 relative z-[100]"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/explore')}
                            className="group relative w-full md:w-auto px-10 md:px-14 py-5 md:py-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-black text-lg md:text-xl shadow-xl shadow-orange-500/30 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Explore Tasks
                                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/create')}
                            className="group relative w-full md:w-auto px-10 md:px-14 py-5 md:py-6 bg-white dark:bg-gray-900 border-4 border-orange-400 dark:border-orange-500 text-orange-600 dark:text-orange-400 rounded-full font-black text-lg md:text-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all shadow-xl"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Create Task
                                <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
                            </span>
                        </motion.button>
                    </motion.div>

                    {/* Quick Stats - Optimized */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="relative group bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700"
                            >
                                <div className="relative z-10">
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 shadow-md`}>
                                        <stat.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
                                        {stat.value}
                                    </h3>
                                    <p className="text-base text-gray-600 dark:text-gray-400 font-bold">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Static Abstract Rings - Optimized */}
            <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] border-[3px] border-orange-200 dark:border-orange-900/30 rounded-full opacity-30 pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] border-[2px] border-red-200 dark:border-red-900/30 rounded-full opacity-20 pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] border-[3px] border-yellow-200 dark:border-yellow-900/30 rounded-full opacity-30 pointer-events-none" />
        </section >
    );
};

export default Hero;
