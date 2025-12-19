import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, Sparkles, Zap, Brain, Flame, Lock, Info, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RELICS = [
    {
        id: 'focus-lens',
        name: 'Luminous Focus Lens',
        tier: 'Epic',
        bonus: '+5% XP from Focus tasks',
        recipe: { focus: 5, creativity: 1, discipline: 2 },
        color: 'from-blue-400 to-cyan-500'
    },
    {
        id: 'creative-spark',
        name: 'Eternal Creative Spark',
        tier: 'Legendary',
        bonus: '+10% Coins from Projects',
        recipe: { focus: 2, creativity: 8, discipline: 0 },
        color: 'from-amber-400 to-orange-500'
    },
    {
        id: 'iron-will',
        name: 'Vessel of Iron Will',
        tier: 'Rare',
        bonus: '-10% Duel cooldown',
        recipe: { focus: 3, creativity: 0, discipline: 5 },
        color: 'from-slate-400 to-zinc-600'
    },
    {
        id: 'void-mirror',
        name: 'Echoing Void Mirror',
        tier: 'Epic',
        bonus: '+15% XP for Night sessions',
        recipe: { focus: 4, creativity: 4, discipline: 4 },
        color: 'from-indigo-600 to-purple-900'
    },
    {
        id: 'synergy-prism',
        name: 'Prism of Synergy',
        tier: 'Rare',
        bonus: '+2 XP to Duel teammates',
        recipe: { focus: 1, creativity: 3, discipline: 2 },
        color: 'from-pink-400 to-rose-600'
    }
];

const AlchemyLab = () => {
    const { theme } = useAuth();
    const [userEssences, setUserEssences] = useState({ focus: 3, creativity: 2, discipline: 1 }); // Demo state
    const [selectedRelic, setSelectedRelic] = useState(null);
    const [isCrafting, setIsCrafting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const isDark = theme === 'dark';

    const handleTransmute = (fromType, toType) => {
        if (userEssences[fromType] < 3) return;

        setUserEssences(prev => ({
            ...prev,
            [fromType]: prev[fromType] - 3,
            [toType]: prev[toType] + 1
        }));
    };

    const handleCraft = () => {
        if (!selectedRelic) return;

        setIsCrafting(true);

        // Simulate crafting delay
        setTimeout(() => {
            setIsCrafting(false);
            setShowSuccess(true);
            // In a real app, this would be an API call
            setUserEssences(prev => ({
                focus: prev.focus - selectedRelic.recipe.focus,
                creativity: prev.creativity - selectedRelic.recipe.creativity,
                discipline: prev.discipline - selectedRelic.recipe.discipline,
            }));

            setTimeout(() => setShowSuccess(false), 3000);
        }, 2000);
    };

    const canCraft = (relic) => {
        return userEssences.focus >= relic.recipe.focus &&
            userEssences.creativity >= relic.recipe.creativity &&
            userEssences.discipline >= relic.recipe.discipline;
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 selection:bg-purple-500/30">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4"
                    >
                        <Zap size={14} />
                        Focus Alchemy Lab
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-700 to-slate-800 dark:from-white dark:via-purple-100 dark:to-slate-400"
                    >
                        Transmute Your Efforts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"
                    >
                        Combine the psychic essences harvested from your productivity sessions to forge powerful artifacts.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inventory & Recipes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Essence Inventory */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { name: 'Focus', icon: Brain, count: userEssences.focus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-400/10', border: 'border-blue-100 dark:border-white/5' },
                                { name: 'Creativity', icon: Sparkles, count: userEssences.creativity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-400/10', border: 'border-purple-100 dark:border-white/5' },
                                { name: 'Discipline', icon: Flame, count: userEssences.discipline, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-400/10', border: 'border-orange-100 dark:border-white/5' },
                            ].map((essence, idx) => (
                                <motion.div
                                    key={essence.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className={`${essence.bg} ${essence.border} border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 shadow-sm dark:shadow-none`}
                                >
                                    <essence.icon className={essence.color} size={32} />
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{essence.count}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">{essence.name} Essences</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Relic Recipes */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Lock size={22} className="text-slate-400 dark:text-slate-500" />
                                Available Blueprints
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {RELICS.map((relic, idx) => (
                                    <motion.div
                                        key={relic.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedRelic(relic)}
                                        className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedRelic?.id === relic.id
                                            ? 'bg-white dark:bg-white/10 border-purple-500 shadow-xl shadow-purple-500/10'
                                            : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 active:border-purple-300'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relic.color} flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                                            <Trophy size={24} className="text-white" />
                                        </div>
                                        <h3 className="font-black text-lg mb-1 text-slate-900 dark:text-white">{relic.name}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">{relic.bonus}</p>

                                        <div className="flex gap-4">
                                            {Object.entries(relic.recipe).map(([type, cost]) => (
                                                cost > 0 && (
                                                    <div key={type} className="flex items-center gap-1.5">
                                                        <div className={`w-2 h-2 rounded-full ${type === 'focus' ? 'bg-blue-500' :
                                                            type === 'creativity' ? 'bg-purple-500' : 'bg-orange-500'
                                                            }`} />
                                                        <span className={`text-xs font-bold ${userEssences[type] < cost ? 'text-red-500' : 'text-slate-500 dark:text-slate-300'}`}>
                                                            {userEssences[type]}/{cost}
                                                        </span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Transmutation Chamber */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center flex flex-col items-center shadow-2xl shadow-slate-200 dark:shadow-none">
                            <h2 className="text-2xl font-black mb-8 text-slate-900 dark:text-white">Alchemy Cauldron</h2>

                            <div className="relative w-48 h-48 mb-8">
                                {/* Cauldron Base */}
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full animate-pulse" />
                                <div className="absolute inset-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-full" />

                                {/* Slot or crafting animation */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {isCrafting ? (
                                            <motion.div
                                                key="crafting"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                                                exit={{ scale: 1.5, opacity: 0 }}
                                                transition={{ duration: 2, ease: "easeInOut" }}
                                                className="relative"
                                            >
                                                <Zap size={64} className="text-amber-500 dark:text-amber-400" />
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.3, 0.6, 0.3],
                                                        rotate: [0, 180, 360]
                                                    }}
                                                    transition={{ repeat: Infinity, duration: 3 }}
                                                    className="absolute inset-0 blur-2xl bg-gradient-to-tr from-purple-500 via-blue-500 to-amber-400 rounded-full"
                                                />
                                                {/* Bubbles */}
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            y: [-20, -100],
                                                            x: [0, (i - 2) * 20],
                                                            opacity: [0, 1, 0],
                                                            scale: [0, 1, 0]
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 1 + Math.random(),
                                                            delay: Math.random() * 2
                                                        }}
                                                        className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-500/30 dark:bg-white/20 rounded-full blur-sm"
                                                    />
                                                ))}
                                            </motion.div>
                                        ) : selectedRelic ? (
                                            <motion.div
                                                key="selected"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedRelic.color} flex items-center justify-center shadow-2xl shadow-purple-500/50`}
                                            >
                                                <Trophy size={48} className="text-white" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="empty" className="text-slate-300 dark:text-slate-500 flex flex-col items-center gap-2">
                                                <Lock size={32} />
                                                <span className="text-sm font-bold">Select Blueprint</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedRelic && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="w-full space-y-6"
                                    >
                                        <div className="text-left bg-slate-50 dark:bg-black/20 rounded-2xl p-5 border border-slate-200 dark:border-white/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Requirements</span>
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${selectedRelic.tier === 'Legendary' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                    selectedRelic.tier === 'Epic' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                                                    {selectedRelic.tier}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {Object.entries(selectedRelic.recipe).map(([type, cost]) => cost > 0 && (
                                                    <div key={type} className="flex justify-between items-center text-sm">
                                                        <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">{type}</span>
                                                        <span className={`font-bold ${userEssences[type] >= cost ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                            {userEssences[type]}/{cost}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCraft}
                                            disabled={!canCraft(selectedRelic) || isCrafting}
                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-tighter transition-all ${canCraft(selectedRelic) && !isCrafting
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-inner'
                                                }`}
                                        >
                                            {isCrafting ? 'Transmuting...' : 'Start Alchemy'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* New Transmution Exchange */}
                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 w-full">
                                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Essence Exchange</h3>
                                <p className="text-[10px] text-slate-500 font-medium mb-4">Trade 3 of any essence to receive 1 of another.</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['focus', 'creativity', 'discipline'].map(type => (
                                        <button
                                            key={type}
                                            disabled={userEssences[type] < 3}
                                            onClick={() => handleTransmute(type, type === 'discipline' ? 'focus' : type === 'focus' ? 'creativity' : 'discipline')}
                                            className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 dark:disabled:opacity-30 disabled:opacity-50 transition-all font-black uppercase tracking-tighter"
                                        >
                                            Trade {type.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md"
                            onClick={() => setShowSuccess(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-purple-500/20 dark:border-purple-500/30 rounded-[2.5rem] p-10 max-w-md w-full relative z-10 text-center shadow-3xl"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
                                <Sparkles size={48} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter">Relic Forged!</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 font-bold leading-relaxed">
                                The <span className="text-purple-600 dark:text-purple-400">{selectedRelic?.name}</span> has been added to your Soulbound collection.
                            </p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-4 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Continue Crafting
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlchemyLab;
