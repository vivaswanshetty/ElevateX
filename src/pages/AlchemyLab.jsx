import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Beaker, Sparkles, Zap, Brain, Flame, Lock, Trophy, ArrowRight, Activity, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const RELICS = [
    {
        id: 'focus-lens',
        name: 'Crimson Focus Lens',
        tier: 'Epic',
        bonus: '+5% XP from Focus tasks',
        recipe: { focus: 5, creativity: 1, discipline: 2 },
        accent: '#f43f5e'
    },
    {
        id: 'creative-spark',
        name: 'Infernal Spark',
        tier: 'Legendary',
        bonus: '+10% Coins from Projects',
        recipe: { focus: 2, creativity: 8, discipline: 0 },
        accent: '#ef4444'
    },
    {
        id: 'iron-will',
        name: 'Vessel of Blood Iron',
        tier: 'Rare',
        bonus: '-10% Duel cooldown',
        recipe: { focus: 3, creativity: 0, discipline: 5 },
        accent: '#be123c'
    },
    {
        id: 'void-mirror',
        name: 'Echoing Void Mirror',
        tier: 'Epic',
        bonus: '+15% XP for Night sessions',
        recipe: { focus: 4, creativity: 4, discipline: 4 },
        accent: '#e11d48'
    },
    {
        id: 'synergy-prism',
        name: 'Prism of Sacrifice',
        tier: 'Rare',
        bonus: '+2 XP to Duel teammates',
        recipe: { focus: 1, creativity: 3, discipline: 2 },
        accent: '#9f1239'
    }
];

const TIER_COLORS = {
    Legendary: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#fca5a5', shadow: '0 0 15px rgba(239, 68, 68, 0.5)' },
    Epic: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)', text: '#fda4af', shadow: '0 0 10px rgba(244, 63, 94, 0.3)' },
    Rare: { bg: 'rgba(190, 18, 60, 0.1)', border: 'rgba(190, 18, 60, 0.3)', text: '#fecdd3', shadow: '0 0 5px rgba(190, 18, 60, 0.2)' },
};

const ESSENCES = [
    { key: 'focus', label: 'Focus', icon: Brain, accent: '#f43f5e' },
    { key: 'creativity', label: 'Creativity', icon: Sparkles, accent: '#ef4444' },
    { key: 'discipline', label: 'Discipline', icon: Flame, accent: '#be123c' },
];

const FloatingParticle = ({ accent, delay }) => {
    return (
        <motion.div
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
                y: [0, -40, -80],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 90, 180]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: delay, ease: "easeInOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                background: accent,
                left: `${Math.random() * 100}%`,
                bottom: '20%',
                boxShadow: `0 0 10px ${accent}`,
                filter: 'blur(1px)'
            }}
        />
    )
}

const AlchemyLab = () => {
    const { currentUser, refreshProfile } = useAuth();
    const [userEssences, setUserEssences] = useState({ focus: 0, creativity: 0, discipline: 0 });
    const [selectedRelic, setSelectedRelic] = useState(null);
    const [isCrafting, setIsCrafting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const controls = useAnimation();

    useEffect(() => {
        if (currentUser?.essences) setUserEssences(currentUser.essences);
    }, [currentUser]);

    const handleTransmute = async (fromType, toType) => {
        if (userEssences[fromType] < 3) return;
        try {
            await api.post('/alchemy/transmute', { from: fromType, to: toType });
            await refreshProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Transmutation failed. The arcane energies destabilized.');
            setTimeout(() => setError(null), 4000);
        }
    };

    const handleCraft = async () => {
        if (!selectedRelic) return;
        setIsCrafting(true);
        setError(null);

        // Trigger cauldron animation
        await controls.start({
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, -5, 5, -5, 0],
            filter: ["brightness(1)", "brightness(1.5)", "brightness(2)", "brightness(1)"],
            transition: { duration: 1.5, ease: "easeInOut" }
        });

        try {
            await api.post('/alchemy/craft', { relicId: selectedRelic.id });
            await refreshProfile();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
            setSelectedRelic(null);
        } catch (err) {
            setError(err.response?.data?.message || 'The ritual collapsed. Missing required essences.');
            setTimeout(() => setError(null), 4000);
        } finally {
            setIsCrafting(false);
        }
    };

    const canCraft = (relic) =>
        userEssences.focus >= relic.recipe.focus &&
        userEssences.creativity >= relic.recipe.creativity &&
        userEssences.discipline >= relic.recipe.discipline;

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: '#050505' }}>
            {/* Dark Premium Background Grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkJPHBhdGggZD0iTTU5LjUgMEg2MHY2MEgwaC0uNXYtLjVINThWMEg1OS41eiIgZmlsbD0icmdiYSgyNTUsIDI1NSLCAyNTUsIDAuMDIpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KCTwvc3ZnPg==')] pointer-events-none opacity-20 mask-image-linear-gradient" />

            {/* Ambient Red Glows */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none transform -translate-y-1/2" />
            <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-12 px-6 overflow-hidden flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto text-center relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 mb-6 backdrop-blur-md">
                        <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-400">
                            Blood Moon Laboratory
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-red-500/50 mb-6 leading-tight drop-shadow-2xl">
                        Synthesize your <br /> <span className="text-red-500">True Potential</span>
                    </h1>
                    <p className="text-sm md:text-base font-medium max-w-xl mx-auto text-white/50 leading-relaxed">
                        Harness the profound energies of your focused work. Weave disparate essences into artifacts of immense, undeniable power.
                    </p>
                </motion.div>
                <div className="w-full max-w-2xl h-px mt-16 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="mb-8 p-4 rounded-2xl flex items-center justify-center gap-3 relative overflow-hidden backdrop-blur-xl"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500/50 animate-pulse" />
                            <Flame className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-semibold text-red-200 tracking-wide">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── Left: Inventory + Blueprints ── */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Essence Inventory */}
                        <div className="grid grid-cols-3 gap-4">
                            {ESSENCES.map((e, idx) => (
                                <motion.div
                                    key={e.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="rounded-3xl p-6 flex flex-col items-center gap-3 relative overflow-hidden group cursor-default transition-all duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(20,20,20,0.8), rgba(5,5,5,0.9))`,
                                        border: `1px solid ${e.accent}25`,
                                        boxShadow: `inset 0 0 20px ${e.accent}05`
                                    }}
                                >
                                    <div className={`absolute -inset-2 bg-gradient-to-r from-transparent via-${e.accent}/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10" style={{ background: `${e.accent}15`, border: `1px solid ${e.accent}30` }}>
                                        <e.icon className="w-6 h-6" style={{ color: e.accent }} />
                                    </div>
                                    <span className="text-4xl font-black text-white tracking-tighter relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{userEssences[e.key]}</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold relative z-10" style={{ color: e.accent }}>
                                        {e.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Blueprints Grid */}
                        <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -m-32 pointer-events-none" />

                            <div className="flex items-center gap-3 mb-8">
                                <Hexagon className="w-5 h-5 text-red-500" />
                                <h2 className="text-lg font-black text-white/90 tracking-widest uppercase">Ancient Blueprints</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                {RELICS.map((relic, idx) => {
                                    const isSelected = selectedRelic?.id === relic.id;
                                    const craftable = canCraft(relic);
                                    const tc = TIER_COLORS[relic.tier];

                                    return (
                                        <motion.div
                                            key={relic.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedRelic(relic)}
                                            className="p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group"
                                            style={{
                                                background: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                                border: isSelected ? `1px solid rgba(239, 68, 68, 0.4)` : '1px solid rgba(255, 255, 255, 0.05)',
                                                boxShadow: isSelected ? `0 0 30px rgba(239, 68, 68, 0.1)` : 'none'
                                            }}
                                        >
                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-inner"
                                                    style={{ background: 'rgba(5,5,5,0.8)', border: `1px solid ${relic.accent}40` }}
                                                >
                                                    <Trophy className="w-6 h-6" style={{ color: relic.accent, filter: `drop-shadow(0 0 5px ${relic.accent})` }} />
                                                </div>
                                                <span
                                                    className="text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest"
                                                    style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text, boxShadow: tc.shadow }}
                                                >
                                                    {relic.tier}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-white text-base mb-1 tracking-tight relative z-10 group-hover:text-red-100 transition-colors">{relic.name}</h3>
                                            <p className="text-xs font-medium mb-5 relative z-10" style={{ color: 'rgba(255,255,255,0.40)' }}>{relic.bonus}</p>

                                            <div className="flex gap-2 flex-wrap items-center bg-black/40 p-2 rounded-xl border border-white/5 relative z-10">
                                                {Object.entries(relic.recipe).map(([type, cost]) =>
                                                    cost > 0 && (
                                                        <div key={type} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white-5">
                                                            <div
                                                                className="w-2 h-2 rounded-full ring-2 ring-black transform rotate-45"
                                                                style={{ background: ESSENCES.find(e => e.key === type)?.accent, boxShadow: `0 0 5px ${ESSENCES.find(e => e.key === type)?.accent}` }}
                                                            />
                                                            <span
                                                                className="text-xs font-black"
                                                                style={{ color: userEssences[type] < cost ? '#f87171' : '#d1d5db' }}
                                                            >
                                                                {userEssences[type]}/{cost}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Cauldron ── */}
                    <div className="lg:col-span-4 perspective-1000">
                        <motion.div
                            animate={controls}
                            className="sticky top-32 rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                            style={{
                                background: 'linear-gradient(145deg, rgba(20,20,20,0.95), rgba(5,5,5,0.98))',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                boxShadow: selectedRelic ? '0 0 50px rgba(239, 68, 68, 0.05), inset 0 0 20px rgba(239, 68, 68, 0.05)' : 'none'
                            }}
                        >
                            {/* Mystical Cauldron Top Glow */}
                            <div className="absolute -top-10 inset-x-0 h-20 bg-gradient-to-b from-red-600/20 to-transparent blur-2xl" />

                            <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 mb-8 uppercase tracking-[0.3em]">
                                The Core
                            </h2>

                            {/* Cauldron visual */}
                            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                {/* Rotating Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border border-dashed border-red-500/20"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 rounded-full border border-red-500/10"
                                />

                                {/* Core Glow Base */}
                                <div className="absolute inset-10 rounded-full bg-red-900/40 blur-[30px]" />

                                {isCrafting && (
                                    <>
                                        {[...Array(8)].map((_, i) => (
                                            <FloatingParticle key={i} accent="#ef4444" delay={i * 0.2} />
                                        ))}
                                    </>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <AnimatePresence mode="wait">
                                        {isCrafting ? (
                                            <motion.div
                                                key="crafting"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1.2, opacity: 1, rotate: 360 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 2 }}
                                                className="will-change-transform"
                                            >
                                                <Zap className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                                            </motion.div>
                                        ) : selectedRelic ? (
                                            <motion.div
                                                key="selected"
                                                initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                                transition={{ type: 'spring', damping: 15 }}
                                                className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-sm"
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${selectedRelic.accent}50` }}
                                            >
                                                <Trophy className="w-12 h-12" style={{ color: selectedRelic.accent, filter: `drop-shadow(0 0 10px ${selectedRelic.accent})` }} />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="empty" className="flex flex-col items-center gap-3 opacity-50">
                                                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                                                    <Lock className="w-6 h-6 text-white/50" />
                                                </div>
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Select Blueprint</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedRelic && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="w-full space-y-5"
                                    >
                                        <button
                                            onClick={handleCraft}
                                            disabled={!canCraft(selectedRelic) || isCrafting}
                                            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                                            style={{
                                                background: canCraft(selectedRelic) && !isCrafting
                                                    ? 'linear-gradient(135deg, #be123c, #ef4444)'
                                                    : 'rgba(255,255,255,0.05)',
                                                border: canCraft(selectedRelic) && !isCrafting
                                                    ? 'none'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                                boxShadow: canCraft(selectedRelic) && !isCrafting ? '0 10px 25px -5px rgba(239, 68, 68, 0.4)' : 'none'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                            <span className="relative z-10 flex items-center gap-2">
                                                {isCrafting ? <><Activity className="w-4 h-4 animate-spin" /> Synthesizing...</> : <><Flame className="w-4 h-4" /> Ignite Ritual</>}
                                            </span>
                                        </button>

                                        {!canCraft(selectedRelic) && (
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-red-400 text-center animate-pulse">Insufficient Essences</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Transmutation Mini-Game / Exchange */}
                            <div className="mt-8 pt-8 w-full relative">
                                <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/50">Equivalent Exchange</h3>
                                <p className="text-[10px] font-medium mb-5 text-white/30 leading-relaxed">Burn 3 essences of a kind to forge 1 of the next in sequence.</p>

                                <div className="flex justify-between items-center gap-2">
                                    {ESSENCES.map((e, index) => {
                                        const nextInSequence = index === ESSENCES.length - 1 ? ESSENCES[0].key : ESSENCES[index + 1].key;
                                        const hasEnough = userEssences[e.key] >= 3;

                                        return (
                                            <button
                                                key={e.key}
                                                disabled={!hasEnough}
                                                onClick={() => handleTransmute(e.key, nextInSequence)}
                                                className="flex-1 py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group overflow-hidden"
                                                style={{
                                                    background: hasEnough ? `${e.accent}15` : 'rgba(255,255,255,0.02)',
                                                    border: hasEnough ? `1px solid ${e.accent}30` : '1px solid rgba(255,255,255,0.05)',
                                                }}
                                            >
                                                {hasEnough && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                <e.icon className="w-4 h-4" style={{ color: hasEnough ? e.accent : 'rgba(255,255,255,0.2)' }} />
                                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: hasEnough ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                                                    {e.label.slice(0, 3)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Cinematic Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            className="absolute inset-0 bg-black/90"
                            onClick={() => setShowSuccess(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative z-10 max-w-sm w-full rounded-3xl p-10 text-center overflow-hidden"
                            style={{
                                background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                boxShadow: '0 0 100px rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            {/* Epic Background Elements */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-[40px]"
                            />

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-24 h-24 mx-auto mb-6 relative z-10"
                            >
                                <div className="absolute inset-0 bg-red-500/20 rounded-2xl rotate-45 border border-red-500/50 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Trophy className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                </div>
                            </motion.div>

                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight relative z-10">Artifact Forged</h3>
                            <p className="text-sm font-medium mb-8 text-red-200/80 relative z-10">
                                The energies have coalesced perfectly. Added to your Soulbound arsenal.
                            </p>

                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-4 rounded-xl text-sm font-black text-white transition-all transform hover:scale-[1.02] active:scale-95 relative z-10 overflow-hidden group"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                Ascend Further
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlchemyLab;
