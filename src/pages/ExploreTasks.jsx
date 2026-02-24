import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Code, Palette, Megaphone, PenTool, Database, Video, Music,
    Briefcase, Coffee, LayoutGrid, Sparkles, ArrowRight, Clock,
    Crown, Lock, Rocket, Zap, SlidersHorizontal, X,
    ChevronDown, Globe, Cpu, Layers, Coins
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import TaskDetailModal from '../components/TaskDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    { label: 'All', icon: LayoutGrid },
    { label: 'Development', icon: Code },
    { label: 'Design', icon: Palette },
    { label: 'Marketing', icon: Megaphone },
    { label: 'Writing', icon: PenTool },
    { label: 'Data Science', icon: Database },
    { label: 'Video & Animation', icon: Video },
    { label: 'Music & Audio', icon: Music },
    { label: 'Business', icon: Briefcase },
    { label: 'Lifestyle', icon: Coffee },
];

const SORT_OPTIONS = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'reward_high', label: 'Highest Pay' },
    { value: 'reward_low', label: 'Lowest Pay' },
];

const getDiff = (coins) => {
    if (coins >= 500) return { label: 'Premium', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)' };
    if (coins >= 200) return { label: 'Intermediate', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' };
    return { label: 'Beginner', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' };
};

const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskCard = ({ task, onClick, index }) => {
    const diff = getDiff(task.coins);
    const isNew = new Date(task.createdAt) > new Date(Date.now() - 86400000);
    const isPremium = task.coins >= 500;
    return (
        <motion.div
            layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(index * 0.05, 0.4) }}
            whileHover={{ y: -4 }} onClick={() => onClick(task._id)}
            className="group relative cursor-pointer h-full"
        >
            {isPremium && (
                <div className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 rounded-[22px] blur transition duration-500"
                    style={{ background: 'linear-gradient(135deg,rgba(234,179,8,0.4),rgba(249,115,22,0.2))' }} />
            )}
            <div className="relative h-full flex flex-col rounded-[20px] overflow-hidden transition-all"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isPremium ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.07)'}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = isPremium ? 'rgba(234,179,8,0.5)' : 'rgba(239,68,68,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isPremium ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.07)'}
            >
                <div className="h-0.5 w-full" style={{ background: isPremium ? 'linear-gradient(90deg,#eab308,#f97316)' : 'linear-gradient(90deg,#3b82f6,#ef4444)' }} />
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                                style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}>{diff.label}</span>
                            {isNew && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> New</span>}
                        </div>
                        {isPremium && <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#eab308' }} fill="#eab308" />}
                    </div>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{task.category}</p>
                    <h3 className="font-bold text-white mb-2 line-clamp-2 leading-snug text-sm group-hover:opacity-80 transition-opacity">{task.title}</h3>
                    <p className="text-xs line-clamp-2 leading-relaxed flex-1 mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{task.description}</p>
                    <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 font-black text-base" style={{ color: isPremium ? '#eab308' : '#3b82f6' }}>
                                <Coins className="w-4 h-4" />{task.coins}
                            </div>
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>coins</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{timeAgo(task.createdAt)}</span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                style={{ background: isPremium ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)', color: isPremium ? '#eab308' : 'rgba(255,255,255,0.5)', border: `1px solid ${isPremium ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.08)'}` }}
                                onMouseEnter={e => { e.currentTarget.style.background = isPremium ? '#eab308' : '#ef4444'; e.currentTarget.style.color = isPremium ? '#000' : '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isPremium ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = isPremium ? '#eab308' : 'rgba(255,255,255,0.5)'; }}
                            >Apply →</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturedBanner = ({ task, onClick }) => {
    if (!task) return null;
    return (
        <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.005 }} onClick={() => onClick(task._id)}
            className="mb-14 relative overflow-hidden rounded-[2rem] cursor-pointer group"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0a0a0f,#0f0c29 50%,#1a0a1a)' }} />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(239,68,68,0.12)' }} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[Code, Sparkles, Zap, Globe, Cpu, Layers].map((Icon, i) => (
                    <motion.div key={i} className="absolute" style={{ top: `${10 + i * 15}%`, right: `${5 + i * 8}%`, color: 'rgba(255,255,255,0.06)' }}
                        animate={{ opacity: [0.06, 0.18, 0.06], rotate: [0, 10, -10, 0] }} transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}>
                        <Icon className="w-12 h-12 md:w-20 md:h-20" strokeWidth={1} />
                    </motion.div>
                ))}
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                            <Sparkles className="w-3 h-3 text-yellow-400" /> Featured</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>{task.category}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight text-white">{task.title}</h2>
                    <p className="text-base line-clamp-2 mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>{task.description}</p>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)' }}>
                            <Coins className="w-5 h-5 text-yellow-400" />
                            <span className="text-2xl font-black text-yellow-400">{task.coins}</span>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(234,179,8,0.7)' }}>Coins</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Clock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.65)' }} />
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{timeAgo(task.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <button className="flex-shrink-0 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.40)', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.40)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                    View Details <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

const SectionHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle, badge }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl" style={{ background: iconBg }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div>
            <h2 className="text-xl font-black text-white flex items-center gap-3">
                {title}
                {badge && <span className="px-2 py-0.5 rounded-md text-xs flex items-center gap-1 font-normal"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}>{badge}</span>}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{subtitle}</p>
        </div>
    </div>
);

const ExploreTasks = () => {
    const { tasks } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [sortBy, setSortBy] = useState('trending');
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [minCoins, setMinCoins] = useState('');
    const [maxCoins, setMaxCoins] = useState('');

    const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'Completed' && t.status !== 'completed'), [tasks]);
    const isPremiumUser = currentUser?.subscription?.plan === 'pro' || currentUser?.subscription?.plan === 'elite';

    const trendingTasks = useMemo(() => [...activeTasks].sort((a, b) => {
        const sA = (a.coins || 0) * 1.5 + (new Date(a.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
        const sB = (b.coins || 0) * 1.5 + (new Date(b.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
        return sB - sA;
    }).slice(0, 5), [activeTasks]);

    React.useEffect(() => {
        if (trendingTasks.length > 1) {
            const interval = setInterval(() => setFeaturedIndex(p => (p + 1) % trendingTasks.length), 8000);
            return () => clearInterval(interval);
        }
    }, [trendingTasks.length]);

    const featuredTask = trendingTasks[featuredIndex % Math.max(trendingTasks.length, 1)];
    const premiumTasks = useMemo(() => activeTasks.filter(t => t.coins >= 500), [activeTasks]);
    const beginnerTasks = useMemo(() => activeTasks.filter(t => t.coins < 200), [activeTasks]);
    const newTasks = useMemo(() => activeTasks.filter(t => new Date(t.createdAt) > new Date(Date.now() - 86400000)), [activeTasks]);

    const filteredTasks = useMemo(() => {
        let list = [...activeTasks];
        if (searchQuery) list = list.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()));
        if (selectedCategory !== 'All') list = list.filter(t => t.category === selectedCategory);
        if (minCoins) list = list.filter(t => (t.coins || 0) >= parseInt(minCoins));
        if (maxCoins) list = list.filter(t => (t.coins || 0) <= parseInt(maxCoins));
        switch (sortBy) {
            case 'newest': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            case 'reward_high': list.sort((a, b) => (b.coins || 0) - (a.coins || 0)); break;
            case 'reward_low': list.sort((a, b) => (a.coins || 0) - (b.coins || 0)); break;
            default: list.sort((a, b) => {
                const sA = (a.coins || 0) * 1.5 + (new Date(a.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
                const sB = (b.coins || 0) * 1.5 + (new Date(b.createdAt) > new Date(Date.now() - 86400000) ? 50 : 0);
                return sB - sA;
            });
        }
        return list;
    }, [activeTasks, searchQuery, selectedCategory, sortBy, minCoins, maxCoins]);

    const isFiltering = searchQuery || selectedCategory !== 'All' || minCoins || maxCoins;
    const inputBase = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none', borderRadius: '12px' };

    return (
        <div className="pt-24 min-h-screen pb-20" style={{ background: '#050505' }}>
            <SEO title="Explore Tasks" description="Browse hundreds of freelance opportunities. Filter by category, difficulty, or reward." />
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-3"
                            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Market
                        </div>
                        <h1 className="text-5xl font-black text-white mb-3">Explore <span style={{ color: '#ef4444' }}>Tasks</span></h1>
                        <p className="text-lg max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            Find the perfect gig. Earn <span style={{ color: '#eab308', fontWeight: 700 }}>Coins</span>, gain <span style={{ color: '#8b5cf6', fontWeight: 700 }}>XP</span>, and level up.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {[{ val: activeTasks.length, label: 'Active', color: '#fff' }, { val: newTasks.length, label: 'New Today', color: '#10b981' }, { val: premiumTasks.length, label: 'Premium', color: '#eab308' }].map((s, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />}
                                <div className="text-center">
                                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
                                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>

                {featuredTask && !isFiltering && <FeaturedBanner task={featuredTask} onClick={setSelectedTaskId} />}

                {/* Premium Vault */}
                {premiumTasks.length > 0 && !isFiltering && (
                    <div className="mb-16">
                        <SectionHeader icon={Crown} iconColor="#eab308" iconBg="rgba(234,179,8,0.1)" title="Premium Vault"
                            subtitle="Exclusive high-value opportunities for top performers"
                            badge={!isPremiumUser ? <><Lock className="w-3 h-3" /> Pro Required</> : null} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {premiumTasks.slice(0, 3).map((task, i) => <TaskCard key={task._id} task={task} onClick={setSelectedTaskId} index={i} />)}
                        </div>
                        {!isPremiumUser && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mt-4 flex items-center justify-between rounded-2xl px-6 py-4"
                                style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)' }}>
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5" style={{ color: '#eab308' }} />
                                    <div>
                                        <p className="font-bold text-white text-sm">Unlock Premium Tasks</p>
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Upgrade to Pro to apply for high-value tasks</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/subscription')}
                                    className="px-4 py-2 text-sm font-bold rounded-xl flex-shrink-0 transition-all hover:scale-105"
                                    style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,179,8,0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(234,179,8,0.15)'}>
                                    Upgrade Now
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Beginner Zone */}
                {beginnerTasks.length > 0 && !isFiltering && (
                    <div className="mb-16">
                        <SectionHeader icon={Rocket} iconColor="#10b981" iconBg="rgba(16,185,129,0.1)" title="Beginner Zone" subtitle="Perfect for your first gig. Quick approval & easy entry." />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {beginnerTasks.slice(0, 4).map((task, i) => <TaskCard key={task._id} task={task} onClick={setSelectedTaskId} index={i} />)}
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="sticky top-20 z-40 py-5 mb-8"
                    style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                                <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full text-sm" style={{ ...inputBase, padding: '12px 40px 12px 44px' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.6)' }}><X className="w-4 h-4" /></button>}
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                        className="appearance-none pl-4 pr-9 py-3 text-sm font-medium cursor-pointer" style={inputBase}>
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.6)' }} />
                                </div>
                                <button onClick={() => setShowFilters(f => !f)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: showFilters || minCoins || maxCoins ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showFilters || minCoins || maxCoins ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`, color: showFilters || minCoins || maxCoins ? '#ef4444' : 'rgba(255,255,255,0.65)' }}>
                                    <SlidersHorizontal className="w-4 h-4" /> Filters
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {[{ label: 'Min Coins', val: minCoins, set: setMinCoins, ph: '0' }, { label: 'Max Coins', val: maxCoins, set: setMaxCoins, ph: '∞' }].map(f => (
                                            <div key={f.label} className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{f.label}:</span>
                                                <input type="number" placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} className="w-20 bg-transparent text-sm outline-none text-white" />
                                            </div>
                                        ))}
                                        {(minCoins || maxCoins) && (
                                            <button onClick={() => { setMinCoins(''); setMaxCoins(''); }}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                                                <X className="w-3.5 h-3.5" /> Clear
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="overflow-x-auto pb-1 hide-scrollbar">
                            <div className="flex gap-2">
                                {CATEGORIES.map(({ label, icon: Icon }) => {
                                    const sel = selectedCategory === label;
                                    return (
                                        <button key={label} onClick={() => setSelectedCategory(label)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0"
                                            style={{ background: sel ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`, color: sel ? '#ef4444' : 'rgba(255,255,255,0.65)' }}
                                            onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; } }}
                                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}>
                                            <Icon className="w-4 h-4" />{label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black text-white">{isFiltering ? 'Search Results' : 'All Tasks'}</h2>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>{filteredTasks.length}</span>
                    </div>
                    {isFiltering && (
                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMinCoins(''); setMaxCoins(''); }}
                            className="text-xs font-bold flex items-center gap-1 transition-colors"
                            style={{ color: 'rgba(255,255,255,0.65)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>
                            <X className="w-3.5 h-3.5" /> Clear all filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
                            <TaskCard key={task._id} task={task} onClick={setSelectedTaskId} index={i} />
                        )) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <Filter className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.5)' }} />
                                </div>
                                <p className="text-xl font-black text-white mb-2">No tasks found</p>
                                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>Try adjusting your filters or search query</p>
                                <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMinCoins(''); setMaxCoins(''); }}
                                    className="px-5 py-2.5 font-bold rounded-xl hover:scale-105 transition-all text-sm text-white"
                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {currentUser && !isFiltering && (
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="mt-16 relative overflow-hidden rounded-[2rem] p-10 text-center"
                        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 blur-[80px] pointer-events-none" style={{ background: 'rgba(239,68,68,0.06)' }} />
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Rocket className="w-8 h-8" style={{ color: '#ef4444' }} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2">Have a task to outsource?</h3>
                            <p className="mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>Post your task and get it done by talented freelancers in the ElevateX community.</p>
                            <button onClick={() => navigate('/create')}
                                className="px-8 py-4 font-black rounded-xl hover:scale-105 active:scale-95 transition-all text-white"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                                Post a Task →
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
            {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
        </div>
    );
};

export default ExploreTasks;
