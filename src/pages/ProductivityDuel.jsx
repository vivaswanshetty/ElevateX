import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Trophy, Flame, Clock, CheckCircle, Users, Zap, Crown,
    ArrowRight, Play, UserPlus, Search, X, Shield, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AuthModal from '../components/AuthModal';
import api from '../api/axios';
import Toast from '../components/Toast';
import { io } from 'socket.io-client';

// ─── Constants ────────────────────────────────────────────────────────────────
const CHALLENGE_TYPES = [
    {
        id: 'task-sprint', name: 'Task Sprint', description: 'First to complete 5 tasks wins',
        icon: CheckCircle, accent: '#3b82f6',
        target: 5, unit: 'tasks', duration: 'Unlimited'
    },
    {
        id: 'habit-streak', name: 'Habit Streak', description: 'Longest consecutive daily streak',
        icon: Flame, accent: '#fb923c',
        target: 7, unit: 'days', duration: '7 days'
    },
    {
        id: 'study-duel', name: 'Study Duel', description: '1-hour focused study session',
        icon: Clock, accent: '#a855f7',
        target: 60, unit: 'minutes', duration: '1 hour'
    },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ label, avatar, progress, target, accent, isYou }) => {
    const pct = Math.min((progress / target) * 100, 100);
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <div className={`relative ${isYou ? 'ring-1 ring-offset-1 ring-offset-[#0d0d0d]' : ''} rounded-full`}
                        style={{ ringColor: isYou ? accent : undefined }}>
                        <img src={avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(label)}`}
                            alt={label} className="w-7 h-7 rounded-full object-cover" />
                    </div>
                    <span className="font-medium text-sm" style={{ color: isYou ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
                        {label} {isYou && <span className="text-[10px] opacity-50">(you)</span>}
                    </span>
                </div>
                <span className="text-sm font-black text-white">{progress}<span className="text-white/20 font-light">/{target}</span></span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: isYou ? accent : 'rgba(255,255,255,0.40)' }}
                />
            </div>
        </div>
    );
};

// ─── Duel Card ────────────────────────────────────────────────────────────────
const DuelCard = ({ duel, currentUser, onRespond }) => {
    const ct = CHALLENGE_TYPES.find(c => c.id === duel.type) || CHALLENGE_TYPES[0];
    const isChallenger = duel.challenger._id === currentUser._id;
    const isShadow = duel.isShadow;
    const opponent = isShadow ? { name: 'Your Shadow', avatar: null }
        : (isChallenger ? duel.opponent : duel.challenger);
    const myProgress = isChallenger ? duel.challengerProgress : duel.opponentProgress;
    const oppProgress = isShadow ? (duel.shadowData?.bestProgress || 0)
        : (isChallenger ? duel.opponentProgress : duel.challengerProgress);

    const statusColors = {
        active: { bg: 'rgba(34,197,94,0.08)', text: 'rgba(134,239,172,0.7)', border: 'rgba(34,197,94,0.15)', label: 'Active' },
        pending: { bg: 'rgba(234,179,8,0.08)', text: 'rgba(253,224,71,0.7)', border: 'rgba(234,179,8,0.15)', label: 'Pending' },
        completed: { bg: 'rgba(255,255,255,0.04)', text: 'rgba(255,255,255,0.50)', border: 'rgba(255,255,255,0.06)', label: 'Ended' },
    };
    const sc = statusColors[duel.status] || statusColors.completed;

    return (
        <div
            className="rounded-2xl overflow-hidden transition-all"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: isShadow ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Top accent line */}
            <div className="h-px w-full" style={{ background: ct.accent + '40' }} />
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ct.accent + '15', border: `1px solid ${ct.accent}25` }}>
                            {isShadow ? <Shield className="w-4 h-4" style={{ color: '#a855f7' }} /> : <ct.icon className="w-4 h-4" style={{ color: ct.accent }} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{isShadow ? `Shadow: ${ct.name}` : ct.name}</h3>
                            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{isShadow ? 'Racing against past best' : `vs ${opponent.name}`}</p>
                        </div>
                    </div>
                    <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                    >
                        {sc.label}
                    </span>
                </div>

                {duel.status === 'pending' && !isChallenger ? (
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => onRespond(duel._id, 'accept')}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: 'rgba(134,239,172,0.9)' }}>
                            Accept
                        </button>
                        <button onClick={() => onRespond(duel._id, 'reject')}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)' }}>
                            Decline
                        </button>
                    </div>
                ) : duel.status === 'active' ? (
                    <div className="space-y-3">
                        <ProgressBar label="You" avatar={currentUser.avatar} progress={myProgress} target={duel.target} accent={ct.accent} isYou />
                        <ProgressBar label={opponent.name} avatar={opponent.avatar} progress={oppProgress} target={duel.target} accent={ct.accent} isYou={false} />
                    </div>
                ) : (
                    <p className="text-center text-sm py-2" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        {duel.status === 'pending' ? 'Waiting for opponent...' : 'Duel ended'}
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProductivityDuel = () => {
    const { currentUser } = useAuth();
    const { tasks } = useData();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [liveDuels, setLiveDuels] = useState([]);
    const [myDuels, setMyDuels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [challengeMessage, setChallengeMessage] = useState('');
    const [isShadowMode, setIsShadowMode] = useState(false);

    useEffect(() => {
        fetchDuels();
        if (!currentUser) return;
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', { withCredentials: true });
        socket.on('connect', () => socket.emit('join_user_room', currentUser._id));
        socket.on('duel_request', (data) => { setToast({ type: 'info', message: data.message }); setMyDuels(p => [data.duel, ...p]); });
        socket.on('duel_accepted', (data) => { setToast({ type: 'success', message: data.message }); setMyDuels(p => p.map(d => d._id === data.duel._id ? data.duel : d)); });
        socket.on('duel_progress', (data) => {
            setMyDuels(p => p.map(d => {
                if (d._id !== data.duelId) return d;
                return d.challenger._id === data.userId
                    ? { ...d, challengerProgress: data.progress }
                    : { ...d, opponentProgress: data.progress };
            }));
        });
        socket.on('duel_lost', () => { setToast({ type: 'info', message: 'Your opponent reached the target first!' }); setMyDuels(p => p.map(d => d._id === data.duelId ? { ...d, status: 'completed' } : d)); });
        socket.on('duel_update', () => api.get('/duels/live').then(r => setLiveDuels(r.data)));
        return () => socket.disconnect();
    }, [currentUser]);

    const fetchDuels = async () => {
        try {
            const liveRes = await api.get('/duels/live');
            setLiveDuels(liveRes.data);
            if (currentUser) { const myRes = await api.get('/duels/my'); setMyDuels(myRes.data); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleStartChallenge = (ct) => {
        if (!currentUser) { setShowAuthModal(true); return; }
        setSelectedChallenge(ct); setShowCreateModal(true);
        setSearchQuery(''); setSearchResults([]); setSelectedOpponent(null);
        setChallengeMessage(''); setIsShadowMode(false);
    };

    const handleSearchUser = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const r = await api.get(`/users/search?q=${q}`);
            setSearchResults(r.data.filter(u => u._id !== currentUser._id));
        } catch (e) { console.error(e); } finally { setIsSearching(false); }
    };

    const handleSendChallenge = async () => {
        if (!isShadowMode && (!selectedOpponent || !selectedChallenge || isSubmitting)) return;
        if (isShadowMode && (!selectedChallenge || isSubmitting)) return;
        setIsSubmitting(true);
        try {
            await api.post('/duels', {
                opponentId: isShadowMode ? currentUser._id : selectedOpponent._id,
                type: selectedChallenge.id, target: selectedChallenge.target,
                message: challengeMessage, isShadow: isShadowMode
            });
            setToast({ type: 'success', message: isShadowMode ? 'Shadow Duel started!' : `Challenged ${selectedOpponent.name}!` });
            setShowCreateModal(false); fetchDuels();
        } catch (e) {
            setToast({ type: 'error', message: e.response?.data?.message || 'Failed to start duel' });
        } finally { setIsSubmitting(false); }
    };

    const handleRespondToDuel = async (duelId, action) => {
        try {
            await api.put(`/duels/${duelId}/respond`, { action });
            fetchDuels();
            setToast({ type: action === 'accept' ? 'success' : 'info', message: action === 'accept' ? 'Challenge accepted! The duel has begun!' : 'Challenge declined' });
        } catch (e) { setToast({ type: 'error', message: 'Failed to respond to challenge' }); }
    };

    const inputCls = `w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3.5
        text-white placeholder:text-white/20 focus:border-white/20 outline-none transition-all text-sm font-light`;

    // ── Guest ──
    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center px-6" style={{ background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <Swords className="w-7 h-7 text-white/30" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Productivity Duels</h2>
                    <p className="text-sm text-white/25 mb-8 font-light">Challenge others and boost your productivity in real-time battles.</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 0 0 1px rgba(239,68,68,0.3)' }}
                    >
                        Sign In to Start Dueling
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 100%)' }}
                />
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
                />
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Social Productivity
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                        Productivity Duels
                    </h1>
                    <p className="text-sm font-light max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Compete with peers in real-time productivity challenges. First to finish wins.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl">

                {/* ── Challenge Type Cards ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Choose Your Battle</h2>
                            <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Pick a challenge type and challenge a friend or your shadow</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {CHALLENGE_TYPES.map((ct, i) => (
                            <motion.div
                                key={ct.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.08 }}
                                whileHover={{ y: -4 }}
                                className="group cursor-pointer rounded-2xl overflow-hidden transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = `1px solid ${ct.accent}30`;
                                    e.currentTarget.style.background = `${ct.accent}06`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                                onClick={() => handleStartChallenge(ct)}
                            >
                                <div className="h-px w-full" style={{ background: ct.accent + '30' }} />
                                <div className="p-6">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                                        style={{ background: ct.accent + '12', border: `1px solid ${ct.accent}20` }}
                                    >
                                        <ct.icon className="w-6 h-6" style={{ color: ct.accent }} />
                                    </div>
                                    <h3 className="text-base font-black text-white mb-1.5">{ct.name}</h3>
                                    <p className="text-xs font-light mb-5" style={{ color: 'rgba(255,255,255,0.60)' }}>{ct.description}</p>

                                    <div className="flex gap-3 mb-5">
                                        <div className="flex-1 text-center py-2.5 rounded-xl" style={{ background: ct.accent + '08', border: `1px solid ${ct.accent}15` }}>
                                            <div className="text-lg font-black" style={{ color: ct.accent }}>{ct.target}</div>
                                            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{ct.unit}</div>
                                        </div>
                                        <div className="flex-1 text-center py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="text-sm font-black text-white">{ct.duration}</div>
                                            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Duration</div>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                        style={{ background: ct.accent + '12', border: `1px solid ${ct.accent}20`, color: ct.accent }}
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" /> Start Challenge
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── My Duels ── */}
                {myDuels.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Swords className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">My Duels</h2>
                                <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>{myDuels.length} active challenge{myDuels.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {myDuels.map(duel => (
                                <DuelCard key={duel._id} duel={duel} currentUser={currentUser} onRespond={handleRespondToDuel} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Live Duels ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-2xl overflow-hidden mb-16"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Zap className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white">Live Duels</h2>
                                <p className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Watch battles unfold in real-time</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.7)' }}>
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                            {liveDuels.length} Active
                        </div>
                    </div>

                    <div className="p-6">
                        {liveDuels.length > 0 ? (
                            <div className="space-y-3">
                                {liveDuels.map((duel, i) => {
                                    const ct = CHALLENGE_TYPES.find(c => c.id === duel.type) || CHALLENGE_TYPES[0];
                                    const elapsed = Math.floor((Date.now() - new Date(duel.startedAt)) / 60000);
                                    return (
                                        <motion.div
                                            key={duel._id}
                                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="p-5 rounded-xl transition-all"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ct.accent + '12' }}>
                                                        <ct.icon className="w-3.5 h-3.5" style={{ color: ct.accent }} />
                                                    </div>
                                                    <span className="font-bold text-white text-sm">{ct.name}</span>
                                                </div>
                                                <span className="text-[11px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                    <Clock className="w-3 h-3" /> {elapsed}m ago
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                <ProgressBar label={duel.challenger.name} avatar={duel.challenger.avatar} progress={duel.challengerProgress} target={duel.target} accent={ct.accent} isYou={false} />
                                                <div className="flex items-center gap-2 py-0.5">
                                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                                                    <span className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>VS</span>
                                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                                                </div>
                                                <ProgressBar label={duel.opponent.name} avatar={duel.opponent.avatar} progress={duel.opponentProgress} target={duel.target} accent={ct.accent} isYou={false} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <Swords className="w-6 h-6 text-white/15" />
                                </div>
                                <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>No live duels right now.</p>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.1)' }}>Be the first to start one!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Create Challenge Modal ── */}
            <AnimatePresence>
                {showCreateModal && selectedChallenge && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                                className="max-w-md w-full rounded-2xl overflow-hidden"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div className="h-px w-full" style={{ background: selectedChallenge.accent + '50' }} />
                                <div className="p-7">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selectedChallenge.accent + '12', border: `1px solid ${selectedChallenge.accent}20` }}>
                                                <selectedChallenge.icon className="w-5 h-5" style={{ color: selectedChallenge.accent }} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-white">{selectedChallenge.name}</h3>
                                                <p className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>{isShadowMode ? 'Race against your best self' : selectedChallenge.description}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl transition-colors" style={{ color: 'rgba(255,255,255,0.60)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Mode switcher */}
                                    <div className="flex p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button
                                            onClick={() => setIsShadowMode(false)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all"
                                            style={{
                                                background: !isShadowMode ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                color: !isShadowMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                                            }}
                                        >
                                            <Users className="w-3.5 h-3.5" /> Social
                                        </button>
                                        <button
                                            onClick={() => setIsShadowMode(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all"
                                            style={{
                                                background: isShadowMode ? 'rgba(168,85,247,0.12)' : 'transparent',
                                                color: isShadowMode ? 'rgba(216,180,254,0.8)' : 'rgba(255,255,255,0.55)',
                                            }}
                                        >
                                            <Shield className="w-3.5 h-3.5" /> Shadow
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {!isShadowMode ? (
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
                                                <input
                                                    type="text" value={searchQuery}
                                                    onChange={e => handleSearchUser(e.target.value)}
                                                    placeholder="Search user to challenge..."
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-light text-white placeholder:text-white/20 outline-none transition-all"
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                                                />
                                                {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />}
                                                {searchResults.length > 0 && !selectedOpponent && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                        {searchResults.map(u => (
                                                            <div key={u._id} onClick={() => { setSelectedOpponent(u); setSearchQuery(u.name); setSearchResults([]); }}
                                                                className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
                                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                <img src={u.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(u.name)}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                                <div>
                                                                    <div className="font-semibold text-white text-sm">{u.name}</div>
                                                                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>@{u.username}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                                <Shield className="w-7 h-7 mx-auto mb-2" style={{ color: 'rgba(216,180,254,0.6)' }} />
                                                <p className="text-sm font-semibold" style={{ color: 'rgba(216,180,254,0.8)' }}>Shadow Mode</p>
                                                <p className="text-xs mt-1 font-light" style={{ color: 'rgba(168,85,247,0.5)' }}>Race against your own historical best performance.</p>
                                            </div>
                                        )}

                                        {!isShadowMode && selectedOpponent && (
                                            <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                <img src={selectedOpponent.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(selectedOpponent.name)}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white text-sm">Challenging {selectedOpponent.name}</div>
                                                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Target: {selectedChallenge.target} {selectedChallenge.unit}</div>
                                                </div>
                                                <button onClick={() => { setSelectedOpponent(null); setSearchQuery(''); }}
                                                    className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.60)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        <textarea
                                            value={challengeMessage} onChange={e => setChallengeMessage(e.target.value)}
                                            placeholder="Add a message (optional)" rows="2"
                                            className="w-full px-4 py-3.5 rounded-xl text-sm font-light text-white placeholder:text-white/20 outline-none transition-all resize-none"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setShowCreateModal(false)}
                                            className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendChallenge}
                                            disabled={(!isShadowMode && !selectedOpponent) || isSubmitting}
                                            className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 0 0 1px rgba(239,68,68,0.25)' }}
                                        >
                                            {isSubmitting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : isShadowMode ? (
                                                <><Shield className="w-4 h-4" /> Start Shadow Duel</>
                                            ) : (
                                                <><UserPlus className="w-4 h-4" /> Send Challenge</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <Toast toast={toast} onClose={() => setToast(null)} />
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default ProductivityDuel;
