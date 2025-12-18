import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Target, Flame, Clock, CheckCircle, Users, Zap, Award, Crown, TrendingUp, ArrowRight, Play, UserPlus, Search, X, Code, Sparkles, Coffee, Music, Sun, Cloud, Flag, Bookmark, Compass, Rocket, Smile, Cpu, Globe, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AuthModal from '../components/AuthModal';
import api from '../api/axios';
import Toast from '../components/Toast';

const CHALLENGE_TYPES = [
    {
        id: 'task-sprint',
        name: 'Task Sprint',
        description: 'First to complete 5 tasks wins',
        icon: CheckCircle,
        color: 'from-blue-600 to-cyan-600',
        target: 5,
        unit: 'tasks',
        duration: 'Unlimited'
    },
    {
        id: 'habit-streak',
        name: 'Habit Streak',
        description: 'Longest consecutive daily streak',
        icon: Flame,
        color: 'from-orange-600 to-red-600',
        target: 7,
        unit: 'days',
        duration: '7 days'
    },
    {
        id: 'study-duel',
        name: 'Study Duel',
        description: '1-hour focused study session',
        icon: Clock,
        color: 'from-purple-600 to-pink-600',
        target: 60,
        unit: 'minutes',
        duration: '1 hour'
    }
];

const ProductivityDuel = () => {
    const { currentUser } = useAuth();
    const { tasks } = useData();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Data states
    const [liveDuels, setLiveDuels] = useState([]);
    const [myDuels, setMyDuels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [challengeMessage, setChallengeMessage] = useState('');
    const [isShadowMode, setIsShadowMode] = useState(false);

    useEffect(() => {
        fetchDuels();
    }, [currentUser]);

    const fetchDuels = async () => {
        try {
            const liveRes = await api.get('/duels/live');
            setLiveDuels(liveRes.data);

            if (currentUser) {
                const myRes = await api.get('/duels/my');
                setMyDuels(myRes.data);
            }
        } catch (error) {
            console.error('Error fetching duels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChallenge = (challengeType) => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        setSelectedChallenge(challengeType);
        setShowCreateModal(true);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedOpponent(null);
        setChallengeMessage('');
        setIsShadowMode(false);
    };

    const handleSearchUser = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/users/search?q=${query}`);
            setSearchResults(response.data.filter(u => u._id !== currentUser._id));
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendChallenge = async () => {
        if (!isShadowMode && (!selectedOpponent || !selectedChallenge || isSubmitting)) return;
        if (isShadowMode && (!selectedChallenge || isSubmitting)) return;

        setIsSubmitting(true);
        try {
            await api.post('/duels', {
                opponentId: isShadowMode ? currentUser._id : selectedOpponent._id,
                type: selectedChallenge.id,
                target: selectedChallenge.target,
                message: challengeMessage,
                isShadow: isShadowMode
            });

            setToast({
                type: 'success',
                title: isShadowMode ? 'Shadow Duel Started!' : 'Challenge Sent!',
                message: isShadowMode
                    ? `You are now racing against your best self!`
                    : `You challenged ${selectedOpponent.name} to a ${selectedChallenge.name}`
            });

            setShowCreateModal(false);
            fetchDuels();
        } catch (error) {
            setToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to start duel'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRespondToDuel = async (duelId, action) => {
        try {
            await api.put(`/duels/${duelId}/respond`, { action });
            fetchDuels();
            setToast({
                type: action === 'accept' ? 'success' : 'info',
                title: action === 'accept' ? 'Challenge Accepted!' : 'Challenge Rejected',
                message: action === 'accept' ? 'The duel has begun!' : 'You declined the challenge'
            });
        } catch (error) {
            console.error('Error responding to duel:', error);
            setToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to respond to challenge'
            });
        }
    };

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Swords className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Productivity Duels</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Login to challenge others and boost your productivity!</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all"
                    >
                        Login to Start Dueling
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 pt-40 pb-24 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Animated background elements */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
                />

                {/* Doodle Pattern Overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { Icon: Code, top: '10%', left: '10%' },
                        { Icon: Sparkles, top: '20%', left: '80%' },
                        { Icon: Zap, top: '60%', left: '15%' },
                        { Icon: Coffee, top: '80%', left: '70%' },
                        { Icon: Music, top: '15%', left: '40%' },
                        { Icon: Sun, top: '75%', left: '30%' },
                        { Icon: Cloud, top: '30%', left: '60%' },
                        { Icon: Flag, top: '50%', left: '90%' },
                        { Icon: Bookmark, top: '40%', left: '5%' },
                        { Icon: Compass, top: '85%', left: '50%' },
                        { Icon: Rocket, top: '5%', left: '90%' },
                        { Icon: Smile, top: '90%', left: '10%' },
                        { Icon: Cpu, top: '45%', left: '75%' },
                        { Icon: Globe, top: '25%', left: '25%' },
                        { Icon: Layers, top: '55%', left: '40%' },
                    ].map(({ Icon, top, left }, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/40"
                            style={{ top, left }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.4, 0.8, 0.4],
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        >
                            <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
                        </motion.div>
                    ))}
                </div>

                <div className="container mx-auto px-6 flex flex-col items-center justify-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 mb-8 shadow-lg">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-bold">Social Productivity Duel</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg leading-tight">
                            Challenge & Conquer
                        </h1>
                        <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md leading-relaxed mb-8">
                            Compete with friends in real-time productivity challenges. First to finish wins! 🏆
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <div className="container mx-auto px-6 -mt-16 relative z-10 max-w-6xl">
                {/* Challenge Types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Choose Your Battle</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {CHALLENGE_TYPES.map((challenge, index) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.1, ease: "linear" }
                                }}
                                className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-100 cursor-pointer group"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${challenge.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-100`}>
                                    <challenge.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{challenge.description}</p>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Target:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{challenge.target} {challenge.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{challenge.duration}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleStartChallenge(challenge)}
                                    className={`w-full py-3 bg-gradient-to-r ${challenge.color} text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:brightness-110`}
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Start Challenge
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* My Active Duels */}
                {myDuels.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Swords className="w-6 h-6 text-red-500" />
                            My Duels
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {myDuels.map((duel) => {
                                const challengeType = CHALLENGE_TYPES.find(c => c.id === duel.type) || CHALLENGE_TYPES[0];
                                const isChallenger = duel.challenger._id === currentUser._id;
                                const isShadow = duel.isShadow;
                                const opponent = isShadow ? { name: 'Your Shadow' } : (isChallenger ? duel.opponent : duel.challenger);
                                const myProgress = isChallenger ? duel.challengerProgress : duel.opponentProgress;
                                const opponentProgress = isShadow ? duel.shadowData?.bestProgress : (isChallenger ? duel.opponentProgress : duel.challengerProgress);

                                return (
                                    <div key={duel._id} className={`bg-white dark:bg-[#111] rounded-2xl p-6 border ${isShadow ? 'border-purple-500/30' : 'border-gray-200 dark:border-white/10'} shadow-lg`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${isShadow ? 'from-purple-600 to-indigo-600' : challengeType.color} flex items-center justify-center`}>
                                                    {isShadow ? <Clock className="w-5 h-5 text-white" /> : <challengeType.icon className="w-5 h-5 text-white" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                                        {isShadow ? `Shadow: ${challengeType.name}` : challengeType.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {isShadow ? 'Racing against past best' : `vs ${opponent.name}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${duel.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                                duel.status === 'pending' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {duel.status}
                                            </div>
                                        </div>

                                        {duel.status === 'pending' && !isChallenger ? (
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => handleRespondToDuel(duel._id, 'accept')}
                                                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRespondToDuel(duel._id, 'reject')}
                                                    className="flex-1 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-gray-800 dark:text-white rounded-lg font-bold transition-colors"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        ) : duel.status === 'active' ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-gray-400">You</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{myProgress}/{duel.target}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${challengeType.color}`}
                                                            style={{ width: `${(myProgress / duel.target) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-gray-400">{opponent.name}</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{opponentProgress}/{duel.target}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gray-400 dark:bg-gray-600"
                                                            style={{ width: `${(opponentProgress / duel.target) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 text-center text-gray-500 dark:text-gray-400 italic text-sm">
                                                {duel.status === 'pending' ? 'Waiting for opponent to accept...' : 'Duel ended'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Live Duels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-[#111] rounded-2xl p-8 border border-gray-200 dark:border-white/10 shadow-xl mb-12"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Duels</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Watch battles unfold in real-time</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-bold">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            {liveDuels.length} Active
                        </div>
                    </div>

                    {liveDuels.length > 0 ? (
                        <div className="space-y-4">
                            {liveDuels.map((duel, index) => {
                                const challengeType = CHALLENGE_TYPES.find(c => c.id === duel.type) || CHALLENGE_TYPES[0];
                                const challengerPercent = (duel.challengerProgress / duel.target) * 100;
                                const opponentPercent = (duel.opponentProgress / duel.target) * 100;

                                return (
                                    <motion.div
                                        key={duel._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" }}
                                        className="p-6 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <challengeType.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                <span className="font-bold text-gray-900 dark:text-white">{challengeType.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Started {Math.floor((Date.now() - new Date(duel.startedAt)) / 60000)}m ago
                                            </span>
                                        </div>

                                        {/* Progress bars */}
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <img src={duel.challenger.avatar || `https://ui-avatars.com/api/?name=${duel.challenger.name}`} alt="" className="w-8 h-8 rounded-full" />
                                                        <span className="font-bold text-sm text-gray-900 dark:text-white">{duel.challenger.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {duel.challengerProgress}/{duel.target}
                                                    </span>
                                                </div>
                                                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${challengerPercent}%` }}
                                                        transition={{ duration: 1, delay: 1 }}
                                                        className={`h-full bg-gradient-to-r ${challengeType.color}`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <img src={duel.opponent.avatar || `https://ui-avatars.com/api/?name=${duel.opponent.name}`} alt="" className="w-8 h-8 rounded-full" />
                                                        <span className="font-bold text-sm text-gray-900 dark:text-white">{duel.opponent.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {duel.opponentProgress}/{duel.target}
                                                    </span>
                                                </div>
                                                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${opponentPercent}%` }}
                                                        transition={{ duration: 1, delay: 1 }}
                                                        className={`h-full bg-gradient-to-r ${challengeType.color}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No live duels happening right now. Be the first to start one!
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Create Challenge Modal */}
            <AnimatePresence>
                {showCreateModal && selectedChallenge && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#111] rounded-3xl max-w-md w-full p-8 border border-gray-200 dark:border-white/10 shadow-2xl"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${selectedChallenge.color} flex items-center justify-center mb-4 mx-auto`}>
                                    <selectedChallenge.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                                    {selectedChallenge.name}
                                </h3>
                                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                                    {isShadowMode ? "Race against your own historical best performance." : `Challenge a friend to ${selectedChallenge.description.toLowerCase()}`}
                                </p>

                                {/* Mode Switcher */}
                                <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-6">
                                    <button
                                        onClick={() => setIsShadowMode(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${!isShadowMode ? 'bg-white dark:bg-white/10 shadow-sm text-red-600' : 'text-gray-500'}`}
                                    >
                                        <Users className="w-4 h-4" />
                                        Social
                                    </button>
                                    <button
                                        onClick={() => setIsShadowMode(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${isShadowMode ? 'bg-white dark:bg-white/10 shadow-sm text-red-600' : 'text-gray-500'}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        Shadow
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* User Search - Only show if not shadow mode */}
                                    {!isShadowMode ? (
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => handleSearchUser(e.target.value)}
                                                placeholder="Search user to challenge..."
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-red-500 outline-none transition-all"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            )}

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && !selectedOpponent && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/10 shadow-xl max-h-48 overflow-y-auto z-50">
                                                    {searchResults.map(user => (
                                                        <div
                                                            key={user._id}
                                                            onClick={() => {
                                                                setSelectedOpponent(user);
                                                                setSearchQuery(user.name);
                                                                setSearchResults([]);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                                        >
                                                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="" className="w-8 h-8 rounded-full" />
                                                            <div className="text-left">
                                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</div>
                                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20 text-center">
                                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                In Shadow Mode, you race against your own record.
                                            </p>
                                        </div>
                                    )}

                                    {!isShadowMode && selectedOpponent && (
                                        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                                            <img src={selectedOpponent.avatar || `https://ui-avatars.com/api/?name=${selectedOpponent.name}`} alt="" className="w-10 h-10 rounded-full" />
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 dark:text-white">Challenging {selectedOpponent.name}</div>
                                                <div className="text-xs text-red-500">Target: {selectedChallenge.target} {selectedChallenge.unit}</div>
                                            </div>
                                            <button onClick={() => {
                                                setSelectedOpponent(null);
                                                setSearchQuery('');
                                            }} className="p-1 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-full transition-colors">
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    )}

                                    <textarea
                                        value={challengeMessage}
                                        onChange={(e) => setChallengeMessage(e.target.value)}
                                        placeholder="Add a message (optional)"
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-red-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendChallenge}
                                        disabled={(!isShadowMode && !selectedOpponent) || isSubmitting}
                                        className={`flex-1 py-3 bg-gradient-to-r ${selectedChallenge.color} text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isShadowMode ? <Clock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                                {isShadowMode ? 'Start Shadow Duel' : 'Send Challenge'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default ProductivityDuel;
