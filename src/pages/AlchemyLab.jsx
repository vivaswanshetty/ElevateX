import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, Sparkles, Zap, Brain, Flame, Lock, Info, Trophy } from 'lucide-react';

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
    }
];

const AlchemyLab = () => {
    const [userEssences, setUserEssences] = useState({ focus: 3, creativity: 2, discipline: 1 }); // Demo state
    const [selectedRelic, setSelectedRelic] = useState(null);
    const [isCrafting, setIsCrafting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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
        <div className="min-h-screen pt-32 pb-12 px-4 bg-slate-950 text-white selection:bg-purple-500/30">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
                    >
                        <Zap size={14} />
                        Focus Alchemy Lab
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-slate-400"
                    >
                        Transmute Your Efforts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-slate-400 max-w-2xl mx-auto"
                    >
                        Combine the psychic essences harvested from your productivity sessions to forge powerful artifacts.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inventory & Recipes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Essence Inventory */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'Focus', icon: Brain, count: userEssences.focus, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                { name: 'Creativity', icon: Sparkles, count: userEssences.creativity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                                { name: 'Discipline', icon: Flame, count: userEssences.discipline, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                            ].map((essence, idx) => (
                                <motion.div
                                    key={essence.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className={`${essence.bg} border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2`}
                                >
                                    <essence.icon className={essence.color} size={24} />
                                    <span className="text-2xl font-bold">{essence.count}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">{essence.name}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Relic Recipes */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Lock size={18} className="text-slate-500" />
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
                                            ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relic.color} flex items-center justify-center mb-4`}>
                                            <Trophy size={24} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">{relic.name}</h3>
                                        <p className="text-sm text-slate-400 mb-4">{relic.bonus}</p>

                                        <div className="flex gap-4">
                                            {Object.entries(relic.recipe).map(([type, cost]) => (
                                                cost > 0 && (
                                                    <div key={type} className="flex items-center gap-1.5">
                                                        <div className={`w-2 h-2 rounded-full ${type === 'focus' ? 'bg-blue-400' :
                                                            type === 'creativity' ? 'bg-purple-400' : 'bg-orange-400'
                                                            }`} />
                                                        <span className={`text-xs font-medium ${userEssences[type] < cost ? 'text-red-400' : 'text-slate-300'}`}>
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
                        <div className="sticky top-24 bg-white/5 border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-8">Alchemy Cauldron</h2>

                            <div className="relative w-48 h-48 mb-8">
                                {/* Cauldron Base */}
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full animate-pulse" />
                                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-full" />

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
                                                <Zap size={64} className="text-amber-400" />
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1] }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="absolute inset-0 blur-xl bg-amber-400/50 rounded-full"
                                                />
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
                                            <motion.div key="empty" className="text-slate-500 flex flex-col items-center gap-2">
                                                <Lock size={32} />
                                                <span className="text-sm">Select Blueprint</span>
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
                                        <div className="text-left bg-black/20 rounded-xl p-4 border border-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-400 uppercase tracking-tighter">Requirements</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedRelic.tier === 'Legendary' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {selectedRelic.tier}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(selectedRelic.recipe).map(([type, cost]) => cost > 0 && (
                                                    <div key={type} className="flex justify-between items-center text-sm">
                                                        <span className="capitalize text-slate-300">{type}</span>
                                                        <span className={userEssences[type] >= cost ? 'text-green-400' : 'text-red-400'}>
                                                            {userEssences[type]}/{cost}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCraft}
                                            disabled={!canCraft(selectedRelic) || isCrafting}
                                            className={`w-full py-4 rounded-xl font-bold transition-all ${canCraft(selectedRelic) && !isCrafting
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isCrafting ? 'Transmuting...' : 'Start Alchemy'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowSuccess(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-sm w-full relative z-10 text-center shadow-2xl shadow-purple-500/20"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                                <Sparkles size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Relic Forged!</h3>
                            <p className="text-slate-400 mb-6 font-medium">
                                The {selectedRelic?.name} has been added to your Soulbound collection.
                            </p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
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
