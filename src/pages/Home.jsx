import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import { useData } from '../context/DataContext';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';

const BG = '#050505';

const Home = () => {
    const { tasks, loading } = useData();
    const navigate = useNavigate();
    const recentTasks = tasks
        .filter(task => task.status !== 'Completed' && task.status !== 'completed')
        .slice(0, 3);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const TaskSkeleton = () => (
        <div
            className="rounded-2xl p-5 h-[260px] flex flex-col gap-3 animate-pulse"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
            <div className="flex justify-between items-start">
                <div className="h-4 w-2/3 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-14 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="space-y-2 flex-1">
                <div className="h-3 w-full rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-3 w-5/6 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-3 w-3/4 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
            <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="h-6 w-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-6 w-16 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
        </div>
    );

    return (
        <>
            <SEO
                title="Home"
                description="Join ElevateX, the premier gamified freelance marketplace. Use your skills to complete tasks, earn crypto rewards, and level up your professional profile."
            />
            <div style={{ background: BG }}>
                <Hero />

                {/* ────────────────────────────────────────
                    LIVE TASKS
                ──────────────────────────────────────── */}
                <section className="relative py-28 px-6">
                    {/* Top rule */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
                    />

                    <div className="container mx-auto max-w-6xl">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#ef4444' }} />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#ef4444' }} />
                                    </span>
                                    <span
                                        className="text-[10px] font-semibold tracking-[0.22em] uppercase"
                                        style={{ color: 'rgba(239,68,68,0.75)' }}
                                    >
                                        Live Now
                                    </span>
                                </div>
                                <h2
                                    className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight"
                                >
                                    Open<br />Opportunities
                                </h2>
                            </div>

                            <Link
                                to="/explore"
                                className="group hidden md:inline-flex items-center gap-2 text-sm font-medium transition-all"
                                style={{ color: 'rgba(255,255,255,0.60)' }}
                            >
                                <span className="group-hover:text-white transition-colors">View all tasks</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform group-hover:text-white" />
                            </Link>
                        </motion.div>

                        {/* Cards */}
                        <div className="grid md:grid-cols-3 gap-4 min-h-[280px]">
                            {loading ? (
                                <>
                                    <TaskSkeleton />
                                    <TaskSkeleton />
                                    <TaskSkeleton />
                                </>
                            ) : recentTasks.length > 0 ? (
                                recentTasks.map((task, index) => (
                                    <motion.div
                                        key={task._id}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.45, delay: index * 0.08 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -5 }}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedTaskId(task._id)}
                                    >
                                        <div
                                            className="relative overflow-hidden rounded-2xl transition-all duration-300"
                                            style={{
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                boxShadow: 'none',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)';
                                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {index === 0 && (
                                                <div
                                                    className="absolute top-3 right-3 z-10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
                                                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                                >
                                                    Hot
                                                </div>
                                            )}
                                            <TaskCard task={{ ...task, description: task.description, price: task.coins + ' Coins', rating: 5.0, xp: 100 }} />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div
                                    className="col-span-3 text-center py-20 text-sm"
                                    style={{ color: 'rgba(255,255,255,0.40)' }}
                                >
                                    No live tasks at the moment.
                                </div>
                            )}
                        </div>

                        {/* Mobile CTA */}
                        <div className="mt-10 md:hidden text-center">
                            <Link
                                to="/explore"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
                                style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                View All Tasks
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ────────────────────────────────────────
                    FINAL CTA
                ──────────────────────────────────────── */}
                <section className="relative py-36 px-6 overflow-hidden">
                    {/* Top rule */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
                    />

                    {/* Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(239,68,68,0.07) 0%, transparent 100%)',
                        }}
                    />

                    <div className="relative z-10 max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            {/* Label */}
                            <p
                                className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-8"
                                style={{ color: 'rgba(255,255,255,0.50)' }}
                            >
                                Get Started
                            </p>

                            {/* Heading */}
                            <h2
                                className="font-black tracking-tight text-white leading-[0.9] mb-6"
                                style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
                            >
                                Ready to{' '}
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Elevate?
                                </span>
                            </h2>

                            {/* Sub */}
                            <p
                                className="text-base leading-relaxed mb-12 max-w-md mx-auto font-light"
                                style={{ color: 'rgba(255,255,255,0.55)' }}
                            >
                                Join a growing community of skilled individuals earning real rewards.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/create')}
                                    className="relative group flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                        boxShadow: '0 0 0 1px rgba(239,68,68,0.3), 0 12px 40px rgba(239,68,68,0.2)',
                                    }}
                                >
                                    <span className="relative z-10">Post Your First Task</span>
                                    <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/explore')}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
                                    style={{
                                        color: 'rgba(255,255,255,0.4)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.03)',
                                    }}
                                >
                                    Browse Opportunities
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </>
    );
};

export default Home;
