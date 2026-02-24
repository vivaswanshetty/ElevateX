import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Search, Award, X, UserPlus, UserMinus,
    Users, Zap, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';

const calculateLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

const getLevelTitle = (level) => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Achiever';
    if (level < 35) return 'Expert';
    if (level < 50) return 'Master';
    return 'Legend';
};

// Subtle accent per tier — muted, not loud
const getLevelAccent = (level) => {
    if (level < 5) return 'rgba(156,163,175,0.5)';
    if (level < 10) return 'rgba(74,222,128,0.5)';
    if (level < 20) return 'rgba(96,165,250,0.5)';
    if (level < 35) return 'rgba(167,139,250,0.5)';
    if (level < 50) return 'rgba(251,146,60,0.5)';
    return 'rgba(250,204,21,0.6)';
};

// ─── User Card ────────────────────────────────────────────────────────────────
const UserCard = ({ user, currentUser, isFollowing, onFollow, onUnfollow, onClick }) => {
    const [followState, setFollowState] = useState(isFollowing ? 'following' : 'none');
    const level = calculateLevel(user.xp);
    const accent = getLevelAccent(level);
    const title = getLevelTitle(level);

    const handleFollowClick = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;
        if (followState === 'none') {
            setFollowState('following');
            await onFollow(user._id);
        } else {
            setFollowState('none');
            await onUnfollow(user._id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={() => onClick(user)}
            className="cursor-pointer transition-all group"
            style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
            {/* Thin accent top bar */}
            <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

            <div className="p-5">
                {/* Avatar row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                            alt={user.name}
                            className="w-14 h-14 rounded-2xl object-cover transition-transform group-hover:scale-105"
                            style={{ border: `1px solid ${accent}25` }}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black"
                            style={{ background: '#050505', border: `1px solid ${accent}40`, color: accent }}
                        >
                            L{level}
                        </div>
                    </div>

                    {currentUser && currentUser._id !== user._id && (
                        <button
                            onClick={handleFollowClick}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={followState === 'following'
                                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }
                                : { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }
                            }
                            onMouseEnter={e => {
                                if (followState === 'following') { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }
                                else { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }
                            }}
                            onMouseLeave={e => {
                                if (followState === 'following') { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }
                                else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }
                            }}
                        >
                            {followState === 'following'
                                ? <><UserMinus className="w-3 h-3" /> Following</>
                                : <><UserPlus className="w-3 h-3" /> Follow</>
                            }
                        </button>
                    )}
                </div>

                {/* Name & title */}
                <div className="mb-4">
                    <h3 className="font-black text-white text-sm capitalize leading-tight mb-0.5 transition-colors group-hover:text-red-500">
                        {user.name}
                    </h3>
                    <span className="text-[11px] font-semibold" style={{ color: accent }}>{title}</span>
                    {user.bio && (
                        <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed font-light text-gray-400">
                            {user.bio}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: Zap, value: (user.xp || 0).toLocaleString(), label: 'XP' },
                        { icon: Award, value: (user.coins || 0).toLocaleString(), label: 'Coins' },
                        { icon: Users, value: (user.followers?.length || 0).toLocaleString(), label: 'Followers' },
                    ].map(({ icon: Icon, value, label }) => (
                        <div key={label} className="text-center py-2.5 rounded-xl transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-sm font-black text-white">{value}</p>
                            <p className="text-[10px] font-light mt-0.5 text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="rounded-[20px] overflow-hidden animate-pulse" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="w-20 h-7 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
            <div className="h-4 rounded-lg w-2/3 mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-3 rounded w-1/3 mb-4" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
            </div>
        </div>
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const UserSearch = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('xp');
    const [filters, setFilters] = useState({ minXP: '', maxXP: '', minLevel: '', maxLevel: '' });
    const searchRef = useRef();

    useEffect(() => {
        fetchUsers();
        searchRef.current?.focus();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const isFollowing = useCallback((u) => {
        if (!currentUser || !u.followers) return false;
        return u.followers.includes(currentUser._id);
    }, [currentUser]);

    const handleFollow = useCallback(async (userId) => {
        try { await api.put(`/users/${userId}/follow`); fetchUsers(); } catch { /* silent */ }
    }, []);

    const handleUnfollow = useCallback(async (userId) => {
        try { await api.put(`/users/${userId}/unfollow`); fetchUsers(); } catch { /* silent */ }
    }, []);

    const clearFilters = () => setFilters({ minXP: '', maxXP: '', minLevel: '', maxLevel: '' });
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const filteredUsers = useMemo(() => {
        let result = users.filter(u => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = u.name.toLowerCase().includes(q) || (u.bio || '').toLowerCase().includes(q);
            const level = calculateLevel(u.xp);
            const matchesMinXP = !filters.minXP || u.xp >= parseInt(filters.minXP);
            const matchesMaxXP = !filters.maxXP || u.xp <= parseInt(filters.maxXP);
            const matchesMinLevel = !filters.minLevel || level >= parseInt(filters.minLevel);
            const matchesMaxLevel = !filters.maxLevel || level <= parseInt(filters.maxLevel);
            return matchesSearch && matchesMinXP && matchesMaxXP && matchesMinLevel && matchesMaxLevel;
        });
        result.sort((a, b) => {
            if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
            if (sortBy === 'coins') return (b.coins || 0) - (a.coins || 0);
            if (sortBy === 'followers') return (b.followers?.length || 0) - (a.followers?.length || 0);
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return 0;
        });
        return result;
    }, [users, searchQuery, filters, sortBy]);

    const topUsers = useMemo(() => [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 3), [users]);

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(220,38,38,0.1) 0%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
                <div className="max-w-6xl mx-auto">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-4 text-gray-400">Community</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-3">
                        Discover Talent
                    </h1>
                    <p className="text-sm font-light text-gray-400">
                        Connect with {users.length} talented individuals from the community
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">

                {/* ── Top 3 Spotlight ── */}
                {!loading && topUsers.length >= 3 && (
                    <div className="mb-10">
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Top Performers</p>
                        <div className="grid grid-cols-3 gap-4">
                            {topUsers.map((u, i) => {
                                const rankAccents = ['rgba(250,204,21,0.5)', 'rgba(156,163,175,0.5)', 'rgba(180,120,60,0.5)'];
                                const accent = rankAccents[i];
                                return (
                                    <motion.div
                                        key={u._id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedUser(u)}
                                        className="cursor-pointer p-4 rounded-2xl flex flex-col items-center text-center transition-all bg-[#0d0d0d]"
                                        style={{ border: `1px solid ${accent}25` }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}25`; }}
                                    >
                                        <div className="text-xl mb-2">{['🥇', '🥈', '🥉'][i]}</div>
                                        <img
                                            src={u.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(u.name)}`}
                                            alt={u.name}
                                            className="w-12 h-12 rounded-2xl object-cover mb-2"
                                            style={{ border: `1px solid ${accent}30` }}
                                        />
                                        <p className="font-black text-sm capitalize text-white truncate w-full">{u.name}</p>
                                        <p className="text-xs flex items-center gap-1 mt-0.5 font-light" style={{ color: accent }}>
                                            <Zap className="w-3 h-3" />{(u.xp || 0).toLocaleString()} XP
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Search + Controls ── */}
                <div className="mb-8 space-y-3">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search by name or bio..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm font-light text-white placeholder:text-gray-600 outline-none transition-all"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(f => !f)}
                            className="px-4 py-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all"
                            style={showFilters || hasActiveFilters
                                ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }
                                : { background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)' }
                            }
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#ef4444', color: 'white' }}>!</span>}
                        </button>
                    </div>

                    {/* Sort + count */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-light text-gray-500">
                            <span className="font-bold text-white">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'} found
                        </p>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer bg-[#0d0d0d] border border-white/10 text-gray-400"
                            >
                                <option value="xp">Sort by XP</option>
                                <option value="coins">Sort by Coins</option>
                                <option value="followers">Sort by Followers</option>
                                <option value="name">Sort by Name</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 rounded-xl bg-[#0d0d0d] border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white text-xs uppercase tracking-widest">Filter Options</h3>
                                        {hasActiveFilters && (
                                            <button onClick={clearFilters} className="text-xs font-semibold text-red-500 hover:text-red-400">Clear All</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'minXP', label: 'Min XP', placeholder: '0' },
                                            { key: 'maxXP', label: 'Max XP', placeholder: '10000' },
                                            { key: 'minLevel', label: 'Min Level', placeholder: '1' },
                                            { key: 'maxLevel', label: 'Max Level', placeholder: '100' },
                                        ].map(({ key, label, placeholder }) => (
                                            <div key={key}>
                                                <label className="block text-[10px] font-semibold mb-1.5 uppercase tracking-wider text-gray-500">{label}</label>
                                                <input
                                                    type="number"
                                                    placeholder={placeholder}
                                                    value={filters[key]}
                                                    onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-all bg-white/5 border border-white/10 focus:border-red-500/50"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── User Grid ── */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {filteredUsers.map(u => (
                                <UserCard
                                    key={u._id}
                                    user={u}
                                    currentUser={currentUser}
                                    isFollowing={isFollowing(u)}
                                    onFollow={handleFollow}
                                    onUnfollow={handleUnfollow}
                                    onClick={setSelectedUser}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-24 rounded-2xl bg-[#0d0d0d] border border-white/5"
                    >
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-sm font-light text-gray-500">
                            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-red-500 hover:text-red-400">
                                Clear filters
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} onFollowChange={fetchUsers} />
        </div>
    );
};

export default UserSearch;
