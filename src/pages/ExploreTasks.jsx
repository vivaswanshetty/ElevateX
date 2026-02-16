import React, { useState } from 'react';
import { Search, Filter, Code, Palette, Megaphone, PenTool, Database, Video, Music, Briefcase, Coffee, LayoutGrid, Sparkles, TrendingUp, ArrowRight, Clock, Award } from 'lucide-react';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "Development", "Design", "Marketing", "Writing", "Data Science", "Video & Animation", "Music & Audio", "Business", "Lifestyle"];

const getCategoryIcon = (category) => {
    switch (category) {
        case "Development": return <Code className="w-6 h-6" />;
        case "Design": return <Palette className="w-6 h-6" />;
        case "Marketing": return <Megaphone className="w-6 h-6" />;
        case "Writing": return <PenTool className="w-6 h-6" />;
        case "Data Science": return <Database className="w-6 h-6" />;
        case "Video & Animation": return <Video className="w-6 h-6" />;
        case "Music & Audio": return <Music className="w-6 h-6" />;
        case "Business": return <Briefcase className="w-6 h-6" />;
        case "Lifestyle": return <Coffee className="w-6 h-6" />;
        default: return <LayoutGrid className="w-6 h-6" />;
    }
};

const ExploreTasks = () => {
    const { tasks } = useData();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);

    // Get active tasks only
    const activeTasks = tasks.filter(task =>
        task.status !== 'Completed' && task.status !== 'completed'
    );

    const filteredTasks = activeTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get trending/featured tasks based on multiple criteria
    const getTrendingTasks = () => {
        return [...activeTasks]
            .sort((a, b) => {
                // Calculate score based on coins, recency, and difficulty
                const scoreA = (a.coins || 0) * 1.5 +
                    (new Date(a.createdAt || Date.now()) > new Date(Date.now() - 86400000) ? 50 : 0) +
                    (a.rewardTier === 'High' ? 30 : a.rewardTier === 'Medium' ? 15 : 0);
                const scoreB = (b.coins || 0) * 1.5 +
                    (new Date(b.createdAt || Date.now()) > new Date(Date.now() - 86400000) ? 50 : 0) +
                    (b.rewardTier === 'High' ? 30 : b.rewardTier === 'Medium' ? 15 : 0);
                return scoreB - scoreA;
            })
            .slice(0, 5); // Get top 5 trending tasks
    };

    const trendingTasks = getTrendingTasks();
    const featuredTask = trendingTasks[featuredIndex % trendingTasks.length];

    // Rotate featured task every 8 seconds
    React.useEffect(() => {
        if (trendingTasks.length > 1) {
            const interval = setInterval(() => {
                setFeaturedIndex(prev => (prev + 1) % trendingTasks.length);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [trendingTasks.length]);

    // Calculate statistics
    const totalCoins = activeTasks.reduce((sum, task) => sum + task.coins, 0);
    const avgCoins = activeTasks.length > 0 ? Math.round(totalCoins / activeTasks.length) : 0;

    // Calculate tasks posted in last 24 hours
    const recentTasksCount = activeTasks.filter(task => {
        const taskDate = new Date(task.createdAt || Date.now());
        const oneDayAgo = new Date(Date.now() - 86400000);
        return taskDate > oneDayAgo;
    }).length;

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <SEO
                title="Explore Tasks"
                description="Browse hundreds of freelance opportunities. Filter by category, difficulty, or reward. Start earning crypto today on ElevateX."
            />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
            >
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-bold mb-4 flex items-center gap-3"
                    >
                        Explore Tasks <span className="text-sm font-normal bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">Live Market</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-gray-400 max-w-xl"
                    >
                        Find the perfect gig that matches your skills. Earn XP, get paid, and level up your profile.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-4 flex-wrap"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </motion.div>
                        <span className="font-semibold">{activeTasks.length}</span>
                        <span>active</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{recentTasksCount}</span>
                        <span>today</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{avgCoins}</span>
                        <span>avg coins</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Featured Task Banner - Live Rotating */}
            {featuredTask && selectedCategory === 'All' && !searchQuery && (
                <motion.div
                    key={featuredTask._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.5)",
                        transition: { duration: 0.3 }
                    }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    onClick={() => setSelectedTaskId(featuredTask._id)}
                    className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 md:p-12 cursor-pointer shadow-2xl hover:shadow-indigo-500/50"
                >
                    <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"
                    />
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                    >
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                    </motion.div>
                                    Trending Now
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-sm text-xs font-medium"
                                >
                                    <motion.div
                                        className="w-2 h-2 bg-red-400 rounded-full"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    Live
                                </motion.div>
                                {trendingTasks.length > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.8 }}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium"
                                    >
                                        <TrendingUp className="w-3 h-3" />
                                        {featuredIndex + 1} of {trendingTasks.length}
                                    </motion.div>
                                )}
                            </div>
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="text-3xl font-bold mb-4"
                            >
                                {featuredTask.title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="text-indigo-100 mb-6 line-clamp-2"
                            >
                                {featuredTask.desc}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                                className="flex items-center gap-6"
                            >
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <motion.span
                                        className="text-2xl font-bold"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {featuredTask.coins}
                                    </motion.span>
                                    <span className="text-sm opacity-80">Coins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm opacity-80">Category:</span>
                                    <span className="font-medium capitalize bg-white/10 px-3 py-1 rounded-full">{featuredTask.category || 'General'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm opacity-80">Difficulty:</span>
                                    <span className={`font-medium capitalize px-3 py-1 rounded-full ${featuredTask.rewardTier === 'High' ? 'bg-red-500/20 text-red-200' :
                                        featuredTask.rewardTier === 'Medium' ? 'bg-yellow-500/20 text-yellow-200' :
                                            'bg-green-500/20 text-green-200'
                                        }`}>{featuredTask.rewardTier || 'Medium'}</span>
                                </div>
                            </motion.div>
                        </div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskId(featuredTask._id);
                            }}
                            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-xl"
                        >
                            View Details <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>

                    {/* Navigation Dots for Trending Tasks */}
                    {trendingTasks.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                            {trendingTasks.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFeaturedIndex(index);
                                    }}
                                    className={`transition-all ${index === featuredIndex % trendingTasks.length
                                        ? 'w-8 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                        } rounded-full`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label={`View featured task ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* --- BEGINNER / STARTER SECTION --- */}
            {selectedCategory === 'All' && !searchQuery && activeTasks.some(t => t.coins < 500) && (
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white">Beginner Zone 🚀</h2>
                            <p className="text-gray-500 text-sm">Perfect for starting your journey. Low barrier, quick XP.</p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activeTasks
                            .filter(t => t.coins < 500)
                            .slice(0, 4) // Show top 4 beginner tasks
                            .map((task, index) => (
                                <motion.div
                                    key={task._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => setSelectedTaskId(task._id)}
                                    className="cursor-pointer"
                                >
                                    <div className="relative group">
                                        {/* Custom Card styling for Beginner tasks */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl opacity-20 group-hover:opacity-60 blur transition duration-300"></div>
                                        <div className="relative bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-white/10 h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                                                        Beginner Friendly
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg dark:text-white mb-2 line-clamp-1">{task.title}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{task.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                                        <img src="https://cdn-icons-png.flaticon.com/512/138/138292.png" alt="coin" className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold dark:text-white">{task.coins}</span>
                                                </div>
                                                <button className="text-xs font-bold text-green-500 group-hover:underline flex items-center gap-1">
                                                    Apply <span className="text-[10px] text-gray-400 font-normal no-underline">(-5c)</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            )}
            {/* ---------------------------------- */}

            {/* Filters & Search */}
            <div className="flex flex-col gap-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative group"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-black dark:text-white outline-none input-glow-red"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                    {CATEGORIES.map((category, index) => {
                        const isSelected = selectedCategory === category;
                        return (
                            <motion.button
                                key={category}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory(category)}
                                className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 group overflow-hidden ${isSelected
                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/50 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-white/20' : 'bg-white/5 group-hover:bg-red-500/20'}`}>
                                    {getCategoryIcon(category)}
                                </div>
                                <span className="font-medium text-sm">{category}</span>
                                {isSelected && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                key={task._id}
                                onClick={() => setSelectedTaskId(task._id)}
                            >
                                <TaskCard task={{ ...task, description: task.description, price: task.coins + ' Coins', rating: 5.0, xp: 100 }} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-20"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-black dark:text-white">No tasks found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                </motion.div>
            )}

            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

export default ExploreTasks;
