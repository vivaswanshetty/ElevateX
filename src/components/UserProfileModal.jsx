import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, UserPlus, UserMinus, Briefcase, Linkedin, Twitter, Github,
    ExternalLink, MessageSquare, Clock, MapPin, Star, Zap, GraduationCap,
    Crown, Heart, Coins, Users, Code, Sparkles, Coffee, Music, Sun, Cloud,
    Rocket, Cpu, Globe, Layers, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserListModal from './UserListModal';
import Toast from './Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calculateLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

const getLevelTitle = (level) => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Achiever';
    if (level < 35) return 'Expert';
    if (level < 50) return 'Master';
    return 'Legend';
};

const getLevelGradient = (level) => {
    if (level < 5) return 'from-gray-400 to-gray-500';
    if (level < 10) return 'from-green-400 to-emerald-500';
    if (level < 20) return 'from-blue-400 to-indigo-500';
    if (level < 35) return 'from-purple-400 to-violet-500';
    if (level < 50) return 'from-orange-400 to-amber-500';
    return 'from-yellow-400 to-orange-500';
};

const getBannerGradient = (level) => {
    if (level < 5) return 'from-slate-700 via-gray-700 to-slate-800';
    if (level < 10) return 'from-emerald-700 via-green-700 to-teal-800';
    if (level < 20) return 'from-blue-700 via-indigo-700 to-violet-800';
    if (level < 35) return 'from-purple-700 via-violet-700 to-fuchsia-800';
    if (level < 50) return 'from-orange-700 via-amber-700 to-yellow-800';
    return 'from-yellow-600 via-orange-600 to-red-700';
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return `${baseUrl.replace('/api', '')}${path}`;
};

const getSocialIcon = (platform) => {
    switch (platform) {
        case 'linkedin': return <Linkedin className="w-4 h-4" />;
        case 'twitter': return <Twitter className="w-4 h-4" />;
        case 'github': return <Github className="w-4 h-4" />;
        default: return <ExternalLink className="w-4 h-4" />;
    }
};

const DOODLE_ICONS = [Code, Sparkles, Zap, Coffee, Music, Sun, Cloud, Rocket, Cpu, Globe, Layers];

// ─── XP Ring ─────────────────────────────────────────────────────────────────
const XPRing = ({ xp, size = 80 }) => {
    const level = calculateLevel(xp);
    const progress = ((xp || 0) % 500) / 500;
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * progress;
    const grad = getLevelGradient(level);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90 absolute">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" strokeWidth={6} strokeLinecap="round"
                    stroke="url(#xpGrad)"
                    strokeDasharray={`${dash} ${circ}`}
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${dash} ${circ}` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
                <defs>
                    <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="text-center z-10">
                <p className="text-white font-black text-lg leading-none">{level}</p>
                <p className="text-white/50 text-[9px] font-bold uppercase tracking-wider">LVL</p>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserProfileModal = ({ user: initialUser, onClose, onFollowChange }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(initialUser);
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [listModal, setListModal] = useState({ isOpen: false, title: '', users: [], loading: false });
    const [isRequested, setIsRequested] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
            setActiveTab('posts');
            if (currentUser && initialUser.isPrivate && initialUser.followRequests) {
                setIsRequested(initialUser.followRequests.includes(currentUser._id));
            } else {
                setIsRequested(false);
            }
            if (!initialUser.followers || !initialUser.following) fetchFullUserProfile(initialUser._id);
            fetchUserPosts(initialUser._id);
        }
    }, [initialUser, currentUser]);

    useEffect(() => {
        document.body.style.overflow = initialUser && user ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [initialUser, user]);

    const fetchFullUserProfile = async (userId) => {
        try {
            const res = await api.get(`/users/${userId}`);
            setUser(prev => ({ ...prev, ...res.data }));
        } catch (e) { console.error(e); }
    };

    const fetchUserPosts = async (userId) => {
        setLoadingPosts(true);
        try {
            const res = await api.get(`/posts/user/${userId}`);
            setUserPosts(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingPosts(false); }
    };

    const handleClose = () => { setUser(null); onClose(); };

    const isFollowing = (u) => currentUser && u.followers?.includes(currentUser._id);

    const handleFollow = async () => {
        if (!currentUser) { setToast({ type: 'warning', message: 'Please login to follow users' }); return; }
        try {
            await api.put(`/users/${user._id}/follow`);
            if (user.isPrivate) {
                setIsRequested(true);
                setUser(prev => ({ ...prev, followRequests: [...(prev.followRequests || []), currentUser._id] }));
                setToast({ type: 'info', message: 'Follow request sent!' });
            } else {
                setUser(prev => ({ ...prev, followers: [...(prev.followers || []), currentUser._id] }));
                setToast({ type: 'success', message: `Following ${user.name}!` });
            }
            if (onFollowChange) onFollowChange();
        } catch (e) {
            setToast({ type: 'error', message: e.response?.data?.message || 'Failed to follow' });
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser) return;
        const wasRequested = isRequested;
        setIsRequested(false);
        try {
            await api.put(`/users/${user._id}/unfollow`);
            setUser(prev => ({
                ...prev,
                followers: (prev.followers || []).filter(id => id !== currentUser._id),
                followRequests: wasRequested ? (prev.followRequests || []).filter(id => id !== currentUser._id) : prev.followRequests
            }));
            setToast({ type: 'info', message: wasRequested ? 'Request withdrawn' : `Unfollowed ${user.name}` });
            if (onFollowChange) onFollowChange();
        } catch (e) {
            setIsRequested(true);
            setToast({ type: 'error', message: 'Failed to unfollow' });
        }
    };

    const fetchList = async (type) => {
        setListModal({ isOpen: true, title: type === 'followers' ? 'Followers' : 'Following', users: [], loading: true });
        try {
            const res = await api.get(`/users/${user._id}/${type}`);
            setListModal(prev => ({ ...prev, users: res.data, loading: false }));
        } catch (e) {
            setListModal(prev => ({ ...prev, loading: false }));
        }
    };

    if (!initialUser) return null;

    const level = calculateLevel(user?.xp);
    const levelTitle = getLevelTitle(level);
    const levelGrad = getLevelGradient(level);
    const bannerGrad = getBannerGradient(level);
    const xpProgress = ((user?.xp || 0) % 500) / 500 * 100;
    const following = isFollowing(user || {});

    return (
        <>
            <AnimatePresence>
                {user && initialUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.93, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.93, opacity: 0, y: 24 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0d0d0d] rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-white/10 flex flex-col"
                        >
                            {/* ── Animated Banner ── */}
                            <div className={`relative h-36 bg-gradient-to-br ${bannerGrad} overflow-hidden flex-shrink-0`}>
                                {/* Animated blobs */}
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, 20, 0] }}
                                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/10 rounded-full blur-3xl"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], x: [0, -20, 0], y: [0, 30, 0] }}
                                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-black/20 rounded-full blur-3xl"
                                />
                                {/* Doodle icons */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {DOODLE_ICONS.slice(0, 6).map((Icon, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute text-white/20"
                                            style={{ top: `${10 + i * 15}%`, left: `${8 + i * 15}%` }}
                                            animate={{ opacity: [0.2, 0.5, 0.2], rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
                                        >
                                            <Icon className="w-8 h-8" strokeWidth={1.5} />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-black/20" />

                                {/* Level badge top-left */}
                                <div className={`absolute top-3 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white text-xs font-black flex items-center gap-1.5`}>
                                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${levelGrad}`} />
                                    Lv {level} · {levelTitle}
                                </div>

                                {/* Subscription badge */}
                                {(user.subscription?.plan === 'pro' || user.subscription?.plan === 'elite') && (
                                    <div className="absolute top-3 right-12 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        {user.subscription.plan === 'elite' ? 'Elite' : 'Pro'}
                                    </div>
                                )}

                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors z-20"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Profile Content ── */}
                            <div className="px-5 pb-6 -mt-14 relative flex flex-col flex-1">

                                {/* Avatar row */}
                                <div className="flex items-end justify-between mb-4">
                                    {/* Avatar with XP ring */}
                                    <div className="relative">
                                        <div className={`p-1 rounded-full bg-gradient-to-tr ${levelGrad} shadow-xl`}>
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.name)}`}
                                                alt={user.name}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-[#0d0d0d]"
                                                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=111&color=fff&size=256&bold=true`; }}
                                            />
                                        </div>
                                        {/* XP progress ring overlay */}
                                        <div className="absolute -bottom-1 -right-1 bg-[#0d0d0d] rounded-full p-0.5 border-2 border-[#0d0d0d]">
                                            <XPRing xp={user.xp} size={36} />
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    {currentUser && currentUser._id !== user._id && (
                                        <div className="flex items-center gap-2 mt-16">
                                            <button
                                                onClick={() => { handleClose(); navigate('/chat', { state: { user } }); }}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Message
                                            </button>
                                            <button
                                                onClick={() => following ? handleUnfollow() : (isRequested ? handleUnfollow() : handleFollow())}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${following
                                                    ? 'bg-white/10 text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-300'
                                                    : isRequested
                                                        ? 'bg-white/10 text-gray-400'
                                                        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105'
                                                    }`}
                                            >
                                                {following ? (
                                                    <><UserMinus className="w-4 h-4" /> Following</>
                                                ) : isRequested ? (
                                                    <><Clock className="w-4 h-4" /> Requested</>
                                                ) : (
                                                    <><UserPlus className="w-4 h-4" /> Follow</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Name & bio */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h2 className="text-xl font-black text-white capitalize">{user.name}</h2>
                                        {user.isPrivate && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                                                <Lock className="w-2.5 h-2.5" /> Private
                                            </span>
                                        )}
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                            <MapPin className="w-3 h-3" /> {user.location}
                                        </div>
                                    )}
                                    {user.bio && (
                                        <p className="text-sm text-gray-300 leading-relaxed">{user.bio}</p>
                                    )}
                                </div>

                                {/* ── Stats row ── */}
                                <div className="grid grid-cols-4 gap-2 mb-5">
                                    {[
                                        { label: 'Followers', value: user.followers?.length || 0, onClick: () => fetchList('followers'), icon: Users, color: 'text-indigo-400' },
                                        { label: 'Following', value: user.following?.length || 0, onClick: () => fetchList('following'), icon: Users, color: 'text-purple-400' },
                                        { label: 'XP', value: (user.xp || 0).toLocaleString(), icon: Zap, color: 'text-yellow-400' },
                                        { label: 'Coins', value: (user.coins || 0).toLocaleString(), icon: Coins, color: 'text-orange-400' },
                                    ].map(({ label, value, onClick, icon: Icon, color }) => (
                                        <button
                                            key={label}
                                            onClick={onClick}
                                            disabled={!onClick}
                                            className={`flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 ${onClick ? 'hover:border-white/10 hover:bg-white/10 cursor-pointer' : 'cursor-default'} transition-all`}
                                        >
                                            <Icon className={`w-4 h-4 ${color} mb-1`} />
                                            <span className="font-black text-white text-sm leading-none">{value}</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5 font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* XP Progress bar */}
                                <div className="mb-5">
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                                        <span className="font-bold">XP Progress</span>
                                        <span>{(user.xp || 0) % 500} / 500 to Lv {level + 1}</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${xpProgress}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                            className={`h-full bg-gradient-to-r ${levelGrad} rounded-full`}
                                        />
                                    </div>
                                </div>

                                {/* ── Tabs ── */}
                                <div className="flex border-b border-white/10 mb-4">
                                    {[
                                        { id: 'posts', label: 'Posts' },
                                        { id: 'work', label: 'Experience' },
                                        { id: 'socials', label: 'Socials' },
                                    ].map(({ id, label }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id)}
                                            className={`flex-1 py-2.5 text-xs font-bold transition-colors relative ${activeTab === id
                                                ? 'text-red-500'
                                                : 'text-gray-400 hover:text-gray-200'
                                                }`}
                                        >
                                            {label}
                                            {activeTab === id && (
                                                <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Tab Content ── */}
                                <AnimatePresence mode="wait">
                                    {activeTab === 'posts' && (
                                        <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            {loadingPosts ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-xl" />
                                                    ))}
                                                </div>
                                            ) : userPosts.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {userPosts.map(post => (
                                                        <div
                                                            key={post._id}
                                                            onClick={() => { handleClose(); navigate(`/post/${post._id}`); }}
                                                            className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl bg-white/5 border border-white/5"
                                                        >
                                                            {post.image ? (
                                                                post.image.match(/\.(mp4|webm|ogg)$/i) ? (
                                                                    <video src={getImageUrl(post.image)} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <img src={getImageUrl(post.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                                )
                                                            ) : (
                                                                <div className="w-full h-full p-2 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                                                                    <p className="text-[10px] text-gray-300 font-medium text-center line-clamp-4 leading-relaxed">{post.content}</p>
                                                                </div>
                                                            )}
                                                            {/* Hover overlay */}
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                                                                <div className="flex items-center gap-1 text-sm font-bold">
                                                                    <Heart className="w-4 h-4 fill-white" /> {post.likes?.length || 0}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                                    <p className="text-sm text-gray-400 font-medium">No posts yet</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'work' && (
                                        <motion.div key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                            {/* Work Experience */}
                                            {user.work?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Briefcase className="w-3.5 h-3.5" /> Experience
                                                    </p>
                                                    <div className="space-y-3">
                                                        {user.work.map((job, i) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                                <div className="p-2 bg-blue-500/10 rounded-lg h-fit flex-shrink-0">
                                                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-white">{job.title}</p>
                                                                    <p className="text-xs text-gray-500">{job.company}</p>
                                                                    {job.duration && <p className="text-[10px] text-gray-400 mt-0.5">{job.duration}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Education */}
                                            {user.education?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <GraduationCap className="w-3.5 h-3.5" /> Education
                                                    </p>
                                                    <div className="space-y-3">
                                                        {user.education.map((edu, i) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                                <div className="p-2 bg-purple-500/10 rounded-lg h-fit flex-shrink-0">
                                                                    <GraduationCap className="w-4 h-4 text-purple-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-white">{edu.school}</p>
                                                                    <p className="text-xs text-gray-500">{edu.degree}</p>
                                                                    {edu.year && <p className="text-[10px] text-gray-400 mt-0.5">{edu.year}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {!user.work?.length && !user.education?.length && (
                                                <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                                    <p className="text-sm text-gray-400 font-medium">No experience listed</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'socials' && (
                                        <motion.div key="socials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            {user.socials && Object.entries(user.socials).some(([, v]) => v) ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Object.entries(user.socials).map(([platform, url]) =>
                                                        url ? (
                                                            <a
                                                                key={platform}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/40 hover:bg-black/20 transition-all group"
                                                            >
                                                                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-red-500/10 transition-colors">
                                                                    {getSocialIcon(platform)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-bold text-white capitalize">{platform}</p>
                                                                    <p className="text-[10px] text-gray-400 truncate">{url.replace(/^https?:\/\//, '')}</p>
                                                                </div>
                                                                <ExternalLink className="w-3 h-3 text-gray-300 ml-auto flex-shrink-0" />
                                                            </a>
                                                        ) : null
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                                    <Globe className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                                    <p className="text-sm text-gray-400 font-medium">No social links</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* View full profile button */}
                                <button
                                    onClick={() => { handleClose(); navigate(`/search?user=${user._id}`); }}
                                    className="mt-5 w-full py-3 rounded-2xl border border-white/10 text-sm font-bold text-gray-400 hover:border-red-500/50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> View Full Profile
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <UserListModal
                isOpen={listModal.isOpen}
                onClose={() => setListModal(prev => ({ ...prev, isOpen: false }))}
                title={listModal.title}
                users={listModal.users}
                loading={listModal.loading}
                onUserClick={(clickedUser) => {
                    setUser(clickedUser);
                    setListModal(prev => ({ ...prev, isOpen: false }));
                }}
            />
        </>
    );
};

export default UserProfileModal;
