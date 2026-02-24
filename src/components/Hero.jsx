import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

    const blob1X = useTransform(springX, [-1, 1], [-40, 40]);
    const blob1Y = useTransform(springY, [-1, 1], [-40, 40]);
    const blob2X = useTransform(springX, [-1, 1], [30, -30]);
    const blob2Y = useTransform(springY, [-1, 1], [30, -30]);

    useEffect(() => {
        const handleMove = (e) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            mouseX.set((e.clientX / w - 0.5) * 2);
            mouseY.set((e.clientY / h - 0.5) * 2);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    const stats = [
        { value: '120+', label: 'Members' },
        { value: '98%', label: 'Success' },
        { value: '20+', label: 'Tasks Done' },
    ];

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#050505' }}
        >
            {/* ── Noise texture overlay ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px 128px',
                }}
            />

            {/* ── Ambient gradient blobs ── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    width: 800,
                    height: 800,
                    top: '-20%',
                    left: '-15%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.09) 0%, transparent 65%)',
                    x: blob1X,
                    y: blob1Y,
                }}
            />
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    width: 700,
                    height: 700,
                    bottom: '-20%',
                    right: '-15%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)',
                    x: blob2X,
                    y: blob2Y,
                }}
            />

            {/* ── Subtle grid ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                    `,
                    backgroundSize: '72px 72px',
                    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
                }}
            />

            {/* ── Horizontal rule top ── */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── Main content ── */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-36 pb-24 flex flex-col items-center text-center">

                {/* Live pill */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2.5 mb-12 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                    </span>
                    <span className="text-[11px] font-medium text-white/40 tracking-[0.18em] uppercase">
                        The Future of Skill Exchange
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="mb-8"
                >
                    <h1
                        className="font-black leading-[0.88] tracking-[-0.04em] text-white"
                        style={{ fontSize: 'clamp(4rem, 12vw, 9.5rem)' }}
                    >
                        <span className="block">Elevate</span>
                        <span
                            className="block"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 45%, #a855f7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Your Skills.
                        </span>
                    </h1>
                </motion.div>

                {/* Sub */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.22 }}
                    className="max-w-lg text-base md:text-lg leading-relaxed mb-14 font-light"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                    A gamified micro-task marketplace. Post tasks, complete gigs,
                    and earn real rewards — all in one place.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.34 }}
                    className="flex flex-col sm:flex-row items-center gap-3 mb-24"
                >
                    {/* Primary */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/explore')}
                        className="relative group flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                            boxShadow: '0 0 0 1px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.2)',
                        }}
                    >
                        <span className="relative z-10">Explore Tasks</span>
                        <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                        />
                    </motion.button>

                    {/* Secondary */}
                    <motion.button
                        whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.40)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/create')}
                        className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all"
                        style={{
                            color: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.03)',
                        }}
                    >
                        Post a Task
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </motion.button>
                </motion.div>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="w-full max-w-md h-px mb-10"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
                />

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex items-center gap-12 sm:gap-20"
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 + i * 0.08 }}
                            className="text-center"
                        >
                            <div
                                className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-0.5"
                            >
                                {s.value}
                            </div>
                            <div
                                className="text-[10px] tracking-[0.2em] uppercase font-medium"
                                style={{ color: 'rgba(255,255,255,0.22)' }}
                            >
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* ── Bottom vignette ── */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
            />
        </section>
    );
};

export default Hero;
