import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Target, Brain, Scan, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { getAIMatches } from '../api/matches';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { useAuth } from '../context/AuthContext';

const AIMatching = () => {
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Minimum scan time for effect
                const startTime = Date.now();

                const data = await getAIMatches();

                const elapsedTime = Date.now() - startTime;
                const minTime = 2500; // 2.5s scanning effect

                if (elapsedTime < minTime) {
                    await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
                }

                setMatches(data);
                setScanning(false);
            } catch (err) {
                console.error("Match fetch failed", err);
                setError("Failed to analyze ecosystem. Please try again.");
                setScanning(false);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchMatches();
        } else {
            setLoading(false);
            setScanning(false);
        }
    }, [currentUser]);

    const handleRetry = () => {
        setLoading(true);
        setScanning(true);
        setError(null);
        // ... re-trigger effect by some means, or just call fetchMatches logic again. 
        // Simplest is to reload page or force re-mount, but let's just do:
        window.location.reload();
    };

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Login Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Our AI needs to analyze your profile to find the perfect opportunities for you.
                    </p>
                    <a href="/login" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold">
                        Login to ElevateX
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-[#050505] relative overflow-hidden pb-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-sm font-bold uppercase tracking-wider mb-6"
                    >
                        <Cpu className="w-4 h-4" /> Neural Match V1.0
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6"
                    >
                        AI Job Matcher
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400"
                    >
                        Scanning thousands of tasks to find the ones that match your unique skill DNA.
                    </motion.p>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {scanning ? (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div className="relative w-32 h-32 mb-8">
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-pink-500/20"
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-t-4 border-pink-500"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="w-12 h-12 text-pink-500" />
                                    </div>

                                    {/* Scanning Radar Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-pink-500/10 rounded-full"
                                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Analyzing Ecosystem...</h3>
                                <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
                                    <ScanningText text="Parsing your bio vectors..." delay={0} />
                                    <ScanningText text="Comparing with open opportunities..." delay={1} />
                                    <ScanningText text="Calculating compatibility scores..." delay={2} />
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Analysis Failed</h3>
                                <p className="text-gray-400 mb-8">{error}</p>
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw className="w-4 h-4" /> Retry Scan
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {matches.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {matches.map((task, index) => (
                                            <motion.div
                                                key={task._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => setSelectedTaskId(task._id)}
                                                className="relative group"
                                            >
                                                {/* Match Score Badge */}
                                                <div className="absolute -top-4 -right-4 z-20 flex flex-col items-center">
                                                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 border-4 border-[#050505] group-hover:rotate-12 transition-transform">
                                                        {task.matchScore > 100 ? 99 : Math.min(99, Math.round(task.matchScore * 5))}%
                                                    </div>
                                                </div>

                                                <TaskCard task={task} />

                                                {/* Match Reason Overlay */}
                                                {task.matchReasons && task.matchReasons.length > 0 && (
                                                    <div className="mt-3 px-4">
                                                        <div className="text-xs font-mono text-pink-500 flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3" />
                                                            MATCH: {task.matchReasons[0]}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 max-w-lg mx-auto">
                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Scan className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">No High Matches Found</h3>
                                        <p className="text-gray-400 mb-8">
                                            We couldn't find tasks that strongly match your profile keywords. Try adding more details to your <strong>Bio</strong>, <strong>Work History</strong>, or <strong>Education</strong>.
                                        </p>
                                        <a href="/profile" className="text-pink-500 hover:text-pink-400 font-bold underline">
                                            Update Profile &rarr;
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

const ScanningText = ({ text, delay }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delay * 800);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <span className={`transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
            {text}
        </span>
    );
};

export default AIMatching;
