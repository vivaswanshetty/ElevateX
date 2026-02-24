import React, { useState, useEffect } from 'react';
import { Users, Calendar, Trophy, MessageCircle, UserPlus, Star, MapPin, Search, ArrowUpRight, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';

const CommunityEvents = () => {
    const { currentUser } = useAuth();
    const [peers, setPeers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('connect');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchPeers();
        }
    }, [currentUser]);

    const fetchPeers = async () => {
        try {
            // Mock data fallback if API fails or is empty for demo purposes, 
            // but ideally we keep the API call.
            // For now, let's assume the API works as before.
            const res = await api.get('/matches/peers');
            setPeers(res.data);
        } catch (error) {
            console.error('Error fetching peers:', error);
            // Fallback mock data for visualization if API fails (optional, but good for stability)
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId, userName) => {
        try {
            await api.put(`/users/${userId}/follow`);
            setToast({
                type: 'success',
                message: `You are now following ${userName}`
            });
            setPeers(prev => prev.filter(p => p._id !== userId));
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to follow user'
            });
        }
    };

    const UPCOMING_EVENTS = [
        {
            id: 1,
            title: "Global Productivity Hackathon",
            date: "Mar 15, 2026",
            participants: 1420,
            icon: Trophy,
            accent: "#f59e0b", // Amber
            desc: "48-hour challenge to build the best productivity tool using ElevateX API."
        },
        {
            id: 2,
            title: "Focus Masterclass with James Clear",
            date: "Mar 20, 2026",
            participants: 850,
            icon: Calendar,
            accent: "#3b82f6", // Blue
            desc: "Exclusive webinar on building atomic habits that stick."
        },
        {
            id: 3,
            title: "Design Systems Workshop",
            date: "Mar 25, 2026",
            participants: 320,
            icon: Users,
            accent: "#8b5cf6", // Violet
            desc: "Learn how to scale your UI components effectively."
        }
    ];

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen flex flex-col items-center justify-center bg-[#050505] px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center mb-6 shadow-2xl shadow-red-600/20">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Join the Community</h2>
                <p className="text-white/40 mb-8 max-w-md">Login to connect with peers, join exclusive events, and grow your network.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Hub</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl">
                        Connect with like-minded creators, join exclusive events, and grow your network.
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-6 mb-10 border-b border-white/10">
                    {['connect', 'events'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {tab === 'connect' ? 'Find Peers' : 'Events & Hackathons'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'connect' ? (
                        <motion.div
                            key="connect"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Search & Filter Bar */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Search peers by name or skill..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                                    />
                                </div>
                                <button className="px-6 py-4 bg-[#0d0d0d] border border-white/10 rounded-2xl text-white font-bold flex items-center gap-2 hover:bg-white/5 transition-all">
                                    <Filter className="w-5 h-5 text-white/50" />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-32">
                                    <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-white/40">Finding your tribe...</p>
                                </div>
                            ) : peers.filter(p =>
                                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                (p.matchReasons && p.matchReasons.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())))
                            ).length === 0 ? (
                                <div className="text-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Users className="w-8 h-8 text-white/30" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                                    <p className="text-white/40 max-w-sm mx-auto">Try adjusting your search terms or update your profile.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {peers
                                        .filter(p =>
                                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            (p.matchReasons && p.matchReasons.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())))
                                        )
                                        .map((peer, idx) => (
                                            <motion.div
                                                key={peer._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group bg-[#0d0d0d] rounded-3xl border border-white/10 p-6 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden"
                                            >
                                                {/* Glow effect on hover */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="flex items-start justify-between mb-6 relative">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <img
                                                                src={peer.avatar || `https://ui-avatars.com/api/?name=${peer.name}&background=random`}
                                                                alt={peer.name}
                                                                className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0d0d0d] rounded-lg flex items-center justify-center border border-white/10">
                                                                <Sparkles className="w-3 h-3 text-red-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg leading-tight mb-1">{peer.name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-wide">
                                                                    Lvl {Math.floor((peer.xp || 0) / 1000) + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        {peer.matchScore}%
                                                    </div>
                                                </div>

                                                <p className="text-white/60 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">
                                                    {peer.bio || "Building cool things on ElevateX."}
                                                </p>

                                                {peer.matchReasons && peer.matchReasons.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-8">
                                                        {peer.matchReasons.slice(0, 3).map((reason, i) => (
                                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/40 border border-white/5">
                                                                {reason}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleFollow(peer._id, peer.name)}
                                                    className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    <span>Connect</span>
                                                </button>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="events"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {UPCOMING_EVENTS.map((event, idx) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-[#0d0d0d] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-300"
                                >
                                    {/* Event Banner Area */}
                                    <div className="h-40 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[#111]" />
                                        <div className="absolute inset-0 opacity-20"
                                            style={{
                                                background: `radial-gradient(circle at top right, ${event.accent}, transparent 70%)`
                                            }}
                                        />
                                        <div className="absolute bottom-6 left-6">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                                                style={{ background: event.accent }}>
                                                <event.icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-2 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {event.date}
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors leading-tight">
                                            {event.title}
                                        </h3>

                                        <p className="text-white/50 text-sm mb-6 flex-1 leading-relaxed">
                                            {event.desc}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#0d0d0d]" />
                                                ))}
                                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#0d0d0d] flex items-center justify-center text-[10px] font-bold text-white/50">
                                                    +{event.participants}
                                                </div>
                                            </div>

                                            <button className="text-sm font-bold text-white hover:text-red-500 transition-colors flex items-center gap-1">
                                                Register <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommunityEvents;
