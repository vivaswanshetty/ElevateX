import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ProjectSummary from '../components/ProjectSummary';
import StatsSection from '../components/StatsSection';
import { useData } from '../context/DataContext';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Search, Zap } from 'lucide-react';

// Lazy load below-the-fold components
const CoreFeatures = React.lazy(() => import('../components/CoreFeatures'));
const Gamification = React.lazy(() => import('../components/Gamification'));
const FutureScope = React.lazy(() => import('../components/FutureScope'));
const Testimonials = React.lazy(() => import('../components/Testimonials'));
const HowItWorks = React.lazy(() => import('../components/HowItWorks'));


const Home = () => {
    const { tasks, loading } = useData();
    const navigate = useNavigate();
    const recentTasks = tasks
        .filter(task => task.status !== 'Completed' && task.status !== 'completed')
        .slice(0, 3);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const TaskSkeleton = () => (
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-xl h-[280px] flex flex-col gap-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-white/10 rounded-md" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
            </div>
            <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded-md" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/10 rounded-md" />
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-white/10 rounded-md" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="h-8 w-24 bg-gray-200 dark:bg-white/10 rounded-lg" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-lg" />
            </div>
        </div>
    );

    return (
        <>
            <div className="pt-16 relative overflow-hidden" style={{ willChange: 'transform' }}>
                {/* Floating Particles Throughout Home Page - Optimized */}
                {[...Array(3)].map((_, i) => ( // Reduced from 8 to 3
                    <motion.div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: 3,
                            height: 3,
                            background: '#fbbf24',
                            boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
                            zIndex: 1,
                            willChange: 'transform',
                            transform: 'translate3d(0, 0, 0)'
                        }}
                        initial={{
                            x: Math.random() * 1200,
                            y: Math.random() * 2000,
                            opacity: 0,
                        }}
                        animate={{
                            y: [Math.random() * 2000, Math.random() * 2000],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}

                <Hero />
                <StatsSection />
                <ProjectSummary />

                {/* Live Tasks Section */}
                <section className="py-16 px-6 relative overflow-hidden bg-transparent">
                    {/* Subtle Floating Particles - Optimized */}
                    {[...Array(2)].map((_, i) => ( // Reduced from 6 to 2
                        <motion.div
                            key={`live-tasks-particle-${i}`}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 4,
                                height: 4,
                                background: '#f59e0b',
                                boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
                                zIndex: 1,
                            }}
                            initial={{
                                x: Math.random() * 1200,
                                y: Math.random() * 400,
                                opacity: 0.2,
                            }}
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}

                    {/* Background Gradient Blobs - Static for performance */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-yellow-400/10 to-red-600/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/10 to-rose-600/10 blur-3xl rounded-full" />

                    <div className="container mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
                        >
                            <div className="max-w-2xl">
                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-500/40 mb-4"
                                >
                                    <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300">Featured Opportunities</span>
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 leading-tight pb-2"
                                >
                                    Live Tasks
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="text-lg text-gray-700 dark:text-gray-300"
                                >
                                    Explore the latest opportunities and start <span className="font-bold text-orange-600 dark:text-orange-400">earning rewards</span> today.
                                </motion.p>
                            </div>

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    to="/explore"
                                    className="hidden md:inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 transition-all hover:scale-105"
                                >
                                    <span>View All Tasks</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Task Cards Grid */}
                        <div className="grid md:grid-cols-3 gap-8 min-h-[300px]">
                            {loading ? (
                                <>
                                    <TaskSkeleton />
                                    <TaskSkeleton />
                                    <TaskSkeleton />
                                </>
                            ) : recentTasks.length > 0 ? (
                                recentTasks.map((task, index) => (
                                    <motion.div
                                        key={task._id}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.15,
                                        }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="cursor-pointer"
                                    >
                                        <div
                                            className="relative"
                                            onClick={() => setSelectedTaskId(task._id)}
                                        >
                                            {/* Trending Badge */}
                                            {index === 0 && (
                                                <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                    🔥 TRENDING
                                                </div>
                                            )}

                                            {/* Card */}
                                            <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                                                <TaskCard task={{ ...task, description: task.description, price: task.coins + ' Coins', rating: 5.0, xp: 100 }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-10">
                                    No live tasks available at the moment.
                                </div>
                            )}
                        </div>

                        {/* Mobile CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="mt-12 text-center md:hidden"
                        >
                            <Link
                                to="/explore"
                                className="inline-flex items-center justify-center w-full gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-full font-bold text-base shadow-lg shadow-orange-500/30"
                            >
                                <span>View All Tasks</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                <Suspense fallback={<div className="py-20 text-center">Loading content...</div>}>
                    <HowItWorks />
                    <CoreFeatures />
                    <Testimonials />
                    <Gamification />
                    <FutureScope />
                </Suspense>

                {/* Final CTA Section - ENHANCED */}
                <section className="py-20 px-6 relative overflow-hidden bg-transparent" style={{ willChange: 'transform' }}>
                    {/* Floating Particles - Optimized */}
                    {[...Array(4)].map((_, i) => ( // Reduced from 8 to 4
                        <motion.div
                            key={`cta-particle-${i}`}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 3,
                                height: 3,
                                background: '#fbbf24',
                                opacity: 0.3,
                                zIndex: 1,
                                willChange: 'transform',
                            }}
                            animate={{
                                y: [100, -100],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}

                    {/* Optimized Background Blobs */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />

                    {/* Floating Particles Effect - Optimized */}
                    {[...Array(4)].map((_, i) => ( // Reduced from 12 to 4
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
                            style={{
                                willChange: 'transform',
                            }}
                            animate={{
                                y: [-50, 50],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}

                    {/* Radial Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/30 dark:to-black/30" />

                    <div className="container mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, type: "spring", stiffness: 100 }}
                            viewport={{ once: true }}
                            className="text-center max-w-5xl mx-auto"
                        >
                            {/* Animated Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, type: "spring", stiffness: 200, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-300 dark:border-orange-600/40 mb-8 shadow-2xl backdrop-blur-sm"
                            >
                                <Zap className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-black text-orange-700 dark:text-orange-300 tracking-wider uppercase">Transform Your Future</span>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    ✨
                                </motion.div>
                            </motion.div>

                            {/* Main Heading with Staggered Animation */}
                            <motion.h2
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, type: "spring", stiffness: 120, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="relative mb-10"
                            >
                                <motion.div
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-orange-600 via-red-600 to-pink-600 dark:from-yellow-400 dark:via-orange-400 dark:via-red-400 dark:to-pink-400 leading-tight bg-[length:200%_auto] drop-shadow-2xl pb-2"
                                    style={{
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Ready to Elevate
                                </motion.div>
                                <motion.div
                                    animate={{
                                        backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                                    className="text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 via-blue-600 to-cyan-600 dark:from-pink-400 dark:via-purple-400 dark:via-blue-400 dark:to-cyan-400 leading-tight bg-[length:200%_auto] drop-shadow-2xl"
                                    style={{
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Your Skills?
                                </motion.div>

                                {/* Pulsing Glow Effect Behind Text */}
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-500/30 to-pink-500/30 -z-10"
                                />
                            </motion.h2>

                            {/* Description with Reveal Animation */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="text-xl md:text-3xl text-gray-700 dark:text-gray-300 mb-14 max-w-4xl mx-auto leading-relaxed font-medium"
                            >
                                Join <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                                    className="font-black text-orange-600 dark:text-orange-400"
                                >
                                    thousands
                                </motion.span> of users earning rewards, building skills, and making meaningful connections in our vibrant community.
                            </motion.p>

                            {/* Enhanced CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                            >
                                {/* Primary Button with Shine Effect */}
                                <motion.button
                                    whileHover={{
                                        scale: 1.1,
                                        y: -5,
                                        boxShadow: "0 30px 60px rgba(245, 158, 11, 0.6)"
                                    }}
                                    whileTap={{ scale: 0.95, y: 0 }}
                                    onClick={() => navigate('/create')}
                                    className="group relative w-full sm:w-auto px-8 sm:px-14 py-5 sm:py-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-black text-lg sm:text-xl shadow-2xl shadow-orange-500/50 transition-all overflow-hidden"
                                >
                                    {/* Shine effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{ x: ["-200%", "200%"] }}
                                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                                    />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        Post Your First Task
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </motion.div>
                                    </span>
                                    {/* Animated Border Glow */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        animate={{
                                            boxShadow: [
                                                "0 0 20px rgba(245, 158, 11, 0.5)",
                                                "0 0 40px rgba(245, 158, 11, 0.8)",
                                                "0 0 20px rgba(245, 158, 11, 0.5)"
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </motion.button>

                                {/* Secondary Button with 3D Effect */}
                                <motion.button
                                    whileHover={{
                                        scale: 1.1,
                                        y: -5,
                                        rotateY: 5,
                                        rotateX: 5
                                    }}
                                    whileTap={{ scale: 0.95, y: 0 }}
                                    onClick={() => navigate('/explore')}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="group relative w-full sm:w-auto px-8 sm:px-14 py-5 sm:py-6 bg-white dark:bg-gray-900 border-4 border-orange-400 dark:border-orange-500 text-orange-600 dark:text-orange-400 rounded-full font-black text-lg sm:text-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950 dark:hover:to-red-950 transition-all shadow-2xl backdrop-blur-sm overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        Browse Opportunities
                                        <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </span>
                                    {/* Gradient overlay on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/20 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                </motion.button>
                            </motion.div>

                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                                viewport={{ once: true }}
                                className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
                            >
                                {[
                                    { icon: "🚀", text: "10K+ Active Users" },
                                    { icon: "⭐", text: "50K+ Tasks Completed" },
                                    { icon: "💎", text: "98% Success Rate" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1 + i * 0.1, type: "spring", stiffness: 200 }}
                                        whileHover={{ scale: 1.1, y: -3 }}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="font-bold">{item.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {
                selectedTaskId && (
                    <TaskDetailModal
                        taskId={selectedTaskId}
                        onClose={() => setSelectedTaskId(null)}
                    />
                )
            }
        </>
    );
};

export default Home;
