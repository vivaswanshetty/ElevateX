import React, { useState } from 'react';
import { Search, Filter, Code, Palette, Megaphone, PenTool, Database, Video, Music, Briefcase, Coffee, LayoutGrid, Sparkles, TrendingUp, ArrowRight, Clock, Award, Crown, Lock, Rocket, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "Development", "Design", "Marketing", "Writing", "Data Science", "Video & Animation", "Music & Audio", "Business", "Lifestyle"];

const getCategoryIcon = (category) => {
    switch (category) {
        case "Development": return <Code className="w-5 h-5" />;
        case "Design": return <Palette className="w-5 h-5" />;
        case "Marketing": return <Megaphone className="w-5 h-5" />;
        case "Writing": return <PenTool className="w-5 h-5" />;
        case "Data Science": return <Database className="w-5 h-5" />;
        case "Video & Animation": return <Video className="w-5 h-5" />;
        case "Music & Audio": return <Music className="w-5 h-5" />;
        case "Business": return <Briefcase className="w-5 h-5" />;
        case "Lifestyle": return <Coffee className="w-5 h-5" />;
        default: return <LayoutGrid className="w-5 h-5" />;
    }
};

const ExploreTasks = () => {
    const { tasks } = useData();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);

    const activeTasks = tasks.filter(task =>
        task.status !== 'Completed' && task.status !== 'completed'
    );

    const filteredTasks = activeTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isPremiumUser = currentUser?.subscription?.plan === 'pro' || currentUser?.subscription?.plan === 'elite';

    // Premium Tasks (High Reward > 500)
    const premiumTasks = activeTasks.filter(t => t.coins >= 500);
    // Beginner Tasks (Low Reward < 500)
    const beginnerTasks = activeTasks.filter(t => t.coins < 500);

    const getTrendingTasks = () => {
        return [...activeTasks]
            .sort((a, b) => {
                const scoreA = (a.coins || 0) * 1.5 + (new Date(a.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
                const scoreB = (b.coins || 0) * 1.5 + (new Date(b.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
                return scoreB - scoreA;
            })
            .slice(0, 5);
    };

    const trendingTasks = getTrendingTasks();
    const featuredTask = trendingTasks[featuredIndex % trendingTasks.length];

    React.useEffect(() => {
        if (trendingTasks.length > 1) {
            const interval = setInterval(() => setFeaturedIndex(prev => (prev + 1) % trendingTasks.length), 8000);
            return () => clearInterval(interval);
        }
    }, [trendingTasks.length]);

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            <SEO
                title="Explore Tasks"
                description="Browse hundreds of freelance opportunities. Filter by category, difficulty, or reward."
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
            >
                <div>
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3 text-white">
                        Explore Tasks <span className="text-xs font-bold bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-wider animate-pulse">Live Market</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl text-lg">
                        Find the perfect gig matching your skills. Earn <span className="text-yellow-400 font-bold">Coins</span>, gain <span className="text-purple-400 font-bold">XP</span>, and level up.
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium text-gray-400 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-white">{activeTasks.length}</span> Active
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-white">{activeTasks.filter(t => new Date(t.createdAt) > new Date(Date.now() - 86400000)).length}</span> New
                    </div>
                </div>
            </motion.div>

            {/* FEATURED BANNER */}
            {featuredTask && selectedCategory === 'All' && !searchQuery && (
                <motion.div
                    key={featuredTask._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => setSelectedTaskId(featuredTask._id)}
                    className="mb-16 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 cursor-pointer shadow-2xl group"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/30 transition-colors duration-500" />

                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-yellow-400" /> Featured
                                </span>
                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                                    {featuredTask.category}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                {featuredTask.title}
                            </h2>
                            <p className="text-gray-400 text-lg line-clamp-2 mb-8">{featuredTask.description}</p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                                    <span className="text-2xl font-black text-yellow-400">{featuredTask.coins}</span>
                                    <span className="text-xs font-bold text-yellow-200 uppercase tracking-widest">Coins Reward</span>
                                </div>
                            </div>
                        </div>

                        <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-2">
                            View Details <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* --- PREMIUM VAULT --- */}
            {premiumTasks.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
                            <Crown className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                Premium Vault
                                {!isPremiumUser && (
                                    <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-xs text-gray-400 flex items-center gap-1 font-normal">
                                        <Lock className="w-3 h-3" /> Pro
                                    </span>
                                )}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Exclusive high-value opportunities. Requires subscription.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {premiumTasks.slice(0, 3).map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                onClick={() => setSelectedTaskId(task._id)}
                                className="group relative cursor-pointer"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-yellow-500 via-orange-500 to-transparent opacity-30 group-hover:opacity-100 rounded-[22px] blur transition duration-500" />
                                <div className="relative h-full bg-[#0a0a0a] rounded-[20px] p-6 border border-white/5 flex flex-col justify-between overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">
                                                PREMIUM
                                            </span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Crown className="w-4 h-4 fill-current" />
                                                <span className="font-black text-lg">{task.coins}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                                            {task.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isPremiumUser ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-xs text-gray-500 font-medium">
                                                {isPremiumUser ? 'Unlocked' : 'Locked'}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-lg group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                            View Task
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- BEGINNER ZONE --- */}
            {beginnerTasks.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                Beginner Zone
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Perfect for your first gig. Quick approval & easy entry.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {beginnerTasks.slice(0, 4).map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedTaskId(task._id)}
                                className="group relative cursor-pointer"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-50 rounded-[20px] blur transition duration-500" />
                                <div className="relative h-full bg-[#0a0a0a] rounded-[18px] p-5 border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                                                Entry Level
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                                            {task.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-green-400 font-bold">
                                            <Zap className="w-3.5 h-3.5 fill-current" />
                                            <span>{task.coins}</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-500 group-hover:text-white transition-colors">
                                            Apply Now &rarr;
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-xl py-6 mb-8 border-y border-white/5">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-purple-500/50 transition-all outline-none"
                        />
                    </div>

                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="flex gap-2">
                            {CATEGORIES.map((category) => {
                                const isSelected = selectedCategory === category;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${isSelected
                                                ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                                : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {isSelected && getCategoryIcon(category)}
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ALL TASKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                key={task._id}
                                onClick={() => setSelectedTaskId(task._id)}
                            >
                                <TaskCard task={task} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center">
                            <Filter className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl font-medium">No tasks found</p>
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

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
