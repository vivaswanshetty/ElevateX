import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Search, ChevronUp, ChevronDown, Minus, Crown, Medal, Award,
    Coins, Zap, Star, Flame, CalendarDays, Clock, Swords
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
    { key: 'xp', label: 'XP', icon: Zap },
    { key: 'coins', label: 'Coins', icon: Coins },
    { key: 'level', label: 'Level', icon: Star },
];

// ─── Rank badge ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
    if (rank === 1) return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Crown className="w-4 h-4" style={{ color: '#f59e0b' }} />
        </div>
    );
    if (rank === 2) return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.2)' }}>
            <Medal className="w-4 h-4" style={{ color: '#9ca3af' }} />
        </div>
    );
    if (rank === 3) return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(180,120,60,0.1)', border: '1px solid rgba(180,120,60,0.2)' }}>
            <Award className="w-4 h-4" style={{ color: '#b47c3c' }} />
        </div>
    );
    return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.60)' }}>#{rank}</span>
        </div>
    );
};

// ─── Rank change indicator ────────────────────────────────────────────────────
const RankChange = ({ change }) => {
    if (!change || change === 0) return <Minus className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.40)' }} />;
    if (change > 0) return (
        <div className="flex items-center gap-0.5" style={{ color: 'rgba(134,239,172,0.7)' }}>
            <ChevronUp className="w-3 h-3" />
            <span className="text-[10px] font-bold">{change}</span>
        </div>
    );
    return (
        <div className="flex items-center gap-0.5" style={{ color: 'rgba(252,165,165,0.7)' }}>
            <ChevronDown className="w-3 h-3" />
            <span className="text-[10px] font-bold">{Math.abs(change)}</span>
        </div>
    );
};

// ─── Top 3 Podium ─────────────────────────────────────────────────────────────
const Podium = ({ top3, sortBy, isSeasonMode }) => {
    const order = [1, 0, 2];
    const heights = ['h-24', 'h-32', 'h-20'];
    const accentColors = ['#9ca3af', '#f59e0b', '#b47c3c'];

    return (
        <div className="flex items-end justify-center gap-3 mb-12">
            {order.map((idx, pos) => {
                const user = top3[idx];
                if (!user) return null;
                const rank = idx + 1;
                const accent = accentColors[pos];
                const sortValue = isSeasonMode
                    ? user.seasonXP?.toLocaleString()
                    : sortBy === 'xp' ? user.xp?.toLocaleString() : sortBy === 'coins' ? user.coins?.toLocaleString() : user.level;
                return (
                    <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pos * 0.1 }}
                        className="flex flex-col items-center gap-3"
                        style={{ width: '140px' }}
                    >
                        <div className="relative">
                            <img
                                src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-14 h-14 rounded-2xl object-cover"
                                style={{ border: `1px solid ${accent}30` }}
                            />
                            <div
                                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                                style={{ background: accent + '20', border: `1px solid ${accent}30`, color: accent }}
                            >
                                {rank}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-black text-white text-sm truncate max-w-[120px]">{user.name}</div>
                            <div className="text-[10px] font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                {isSeasonMode ? `${user.seasonTasksCompleted || 0} tasks` : `Lv. ${user.level || 1}`}
                            </div>
                        </div>
                        <div
                            className={`w-full ${heights[pos]} rounded-t-xl flex items-start justify-center pt-3`}
                            style={{
                                background: `linear-gradient(180deg, ${accent}10 0%, ${accent}05 100%)`,
                                border: `1px solid ${accent}20`,
                                borderBottom: 'none',
                            }}
                        >
                            <div className="text-center">
                                <div className="text-base font-black" style={{ color: accent }}>{sortValue}</div>
                                <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                    {isSeasonMode ? 'Season XP' : sortBy}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ─── Season countdown helper ──────────────────────────────────────────────────
const formatTimeLeft = (endDate) => {
    const ms = new Date(endDate) - new Date();
    if (ms <= 0) return 'Ended';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    if (d > 0) return `${d}d ${h}h left`;
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m left`;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Leaderboard = () => {
    const { currentUser } = useAuth();
    // Tabs: 'alltime' | 'season'
    const [activeTab, setActiveTab] = useState('alltime');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('xp');
    const [searchQuery, setSearchQuery] = useState('');

    // Season data
    const [seasonData, setSeasonData] = useState(null);
    const [seasonLoading, setSeasonLoading] = useState(false);

    // ── All-time leaderboard ──────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab !== 'alltime') return;
        setLoading(true);
        api.get(`/users/leaderboard?sort=${sortBy}`)
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [sortBy, activeTab]);

    // ── Season leaderboard ───────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab !== 'season') return;
        setSeasonLoading(true);
        api.get('/seasons/current')
            .then(res => setSeasonData(res.data))
            .catch(console.error)
            .finally(() => setSeasonLoading(false));
    }, [activeTab]);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const seasonFiltered = (seasonData?.leaderboard || []).filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const top3 = filtered.slice(0, 3);
    const rest = filtered.slice(3);
    const myRank = currentUser ? filtered.findIndex(u => u._id === currentUser._id) + 1 : null;

    const seasonTop3 = seasonFiltered.slice(0, 3);
    const seasonRest = seasonFiltered.slice(3);
    const mySeasonRank = currentUser ? seasonFiltered.findIndex(u => u._id === currentUser._id) + 1 : null;

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(220,38,38,0.08) 0%, transparent 100%)' }}
                />
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.1), transparent)' }}
                />
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(239,68,68,0.70)' }}>
                        Global Rankings
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                        Leaderboard
                    </h1>
                    <p className="text-sm font-light max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        The most productive members of the ElevateX community.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">

                {/* ── Mode Tabs ── */}
                <div className="flex p-1 rounded-xl gap-1 mb-8 w-fit mx-auto"
                    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {[
                        { key: 'alltime', label: 'All-Time', icon: Trophy },
                        { key: 'season', label: 'Season', icon: Flame },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
                            style={{
                                background: activeTab === tab.key
                                    ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                                    : 'transparent',
                                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.40)',
                            }}
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Season Info Banner ── */}
                <AnimatePresence>
                    {activeTab === 'season' && seasonData?.season && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="mb-6 p-5 rounded-2xl"
                            style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.03))', border: '1px solid rgba(239,68,68,0.15)' }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flame className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-black uppercase tracking-widest text-red-500">
                                            Season {seasonData.season.number}
                                        </span>
                                    </div>
                                    <p className="text-lg font-black text-white">{seasonData.season.name}</p>
                                    {seasonData.season.theme && (
                                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{seasonData.season.theme}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Clock className="w-3. h-3.5" style={{ color: 'rgba(239,68,68,0.6)' }} />
                                        <span className="text-xs font-bold text-red-400">
                                            {formatTimeLeft(seasonData.season.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                        <CalendarDays className="w-3 h-3" />
                                        <span className="text-[10px]">
                                            Ends {new Date(seasonData.season.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'season' && !seasonData?.season && !seasonLoading && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mb-6 p-8 rounded-2xl text-center"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <Swords className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(239,68,68,0.4)' }} />
                            <p className="text-sm font-bold text-white mb-1">No Active Season</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>The next season hasn't started yet. Check back soon.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Controls (only for all-time mode) ── */}
                {activeTab === 'alltime' && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-10">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search members..."
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold text-white placeholder:text-white/20 outline-none transition-all"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.3)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>
                        <div className="flex p-1 rounded-xl gap-1" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => setSortBy(opt.key)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                    style={{
                                        background: sortBy === opt.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: sortBy === opt.key ? '#fff' : 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Season search ── */}
                {activeTab === 'season' && seasonData?.season && (
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search season members..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold text-white placeholder:text-white/20 outline-none transition-all"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.3)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>
                )}

                {/* ── All-Time Leaderboard ── */}
                {activeTab === 'alltime' && (
                    loading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.30)' }}>No members found.</p>
                        </div>
                    ) : (
                        <>
                            {!searchQuery && <Podium top3={top3} sortBy={sortBy} isSeasonMode={false} />}
                            {currentUser && myRank > 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 rounded-xl flex items-center gap-4"
                                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Your Rank</div>
                                    <div className="text-2xl font-black text-white">#{myRank}</div>
                                    <div className="ml-auto text-xs font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                        {myRank - 1} places to climb
                                    </div>
                                </motion.div>
                            )}
                            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                {(searchQuery ? filtered : rest).map((user, idx) => {
                                    const rank = searchQuery ? idx + 1 : idx + 4;
                                    const isMe = currentUser?._id === user._id;
                                    const sortValue = sortBy === 'xp' ? user.xp : sortBy === 'coins' ? user.coins : user.level;
                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="flex items-center gap-4 px-5 py-4 transition-all"
                                            style={{
                                                borderBottom: idx < (searchQuery ? filtered : rest).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                                background: isMe ? 'rgba(239,68,68,0.04)' : 'transparent',
                                            }}
                                            onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = isMe ? 'rgba(239,68,68,0.04)' : 'transparent'; }}
                                        >
                                            <RankBadge rank={rank} />
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                                                alt={user.name}
                                                className="w-9 h-9 rounded-xl object-cover"
                                                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm truncate">{user.name}</span>
                                                    {isMe && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)' }}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] mt-0.5 font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                    Lv. {user.level || 1} · {user.tasksCompleted || 0} tasks
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xs font-black text-white">{sortValue?.toLocaleString()}</div>
                                                    <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{sortBy}</div>
                                                </div>
                                                <RankChange change={user.rankChange} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    )
                )}

                {/* ── Season Leaderboard ── */}
                {activeTab === 'season' && (
                    seasonLoading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        </div>
                    ) : seasonData?.season && seasonFiltered.length > 0 ? (
                        <>
                            {!searchQuery && <Podium top3={seasonTop3} sortBy="xp" isSeasonMode={true} />}
                            {currentUser && mySeasonRank > 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 rounded-xl flex items-center gap-4"
                                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Your Season Rank</div>
                                    <div className="text-2xl font-black text-white">#{mySeasonRank}</div>
                                    <div className="ml-auto text-xs font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                        {mySeasonRank - 1} places to climb
                                    </div>
                                </motion.div>
                            )}
                            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                {(searchQuery ? seasonFiltered : seasonRest).map((user, idx) => {
                                    const rank = searchQuery ? idx + 1 : idx + 4;
                                    const isMe = currentUser?._id === user._id;
                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="flex items-center gap-4 px-5 py-4 transition-all"
                                            style={{
                                                borderBottom: idx < (searchQuery ? seasonFiltered : seasonRest).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                                background: isMe ? 'rgba(239,68,68,0.04)' : 'transparent',
                                            }}
                                            onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = isMe ? 'rgba(239,68,68,0.04)' : 'transparent'; }}
                                        >
                                            <RankBadge rank={rank} />
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                                                alt={user.name}
                                                className="w-9 h-9 rounded-xl object-cover"
                                                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm truncate">{user.name}</span>
                                                    {isMe && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)' }}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] mt-0.5 font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                    {user.seasonTasksCompleted || 0} tasks this season
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-white">{user.seasonXP?.toLocaleString()}</div>
                                                <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Season XP</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    ) : seasonData?.season && seasonFiltered.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.30)' }}>
                                {searchQuery ? 'No matching members' : 'No season activity yet — complete tasks to appear!'}
                            </p>
                        </div>
                    ) : null
                )}

            </div>
        </div>
    );
};

export default Leaderboard;
