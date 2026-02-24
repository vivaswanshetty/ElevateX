import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Globe, Sparkles, Radio, Activity, Target, TrendingUp } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

/* ─── animated counter ───────────────────────────────── */
const Counter = ({ value, suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(value / 40);
        const t = setInterval(() => {
            start = Math.min(start + step, value);
            setDisplay(start);
            if (start >= value) clearInterval(t);
        }, 30);
        return () => clearInterval(t);
    }, [value]);
    return <>{display.toLocaleString()}{suffix}</>;
};

const ResonanceRoom = () => {
    const { theme } = useAuth();
    const canvasRef = useRef(null);
    const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 50) + 120);
    const [harmonyLevel, setHarmonyLevel] = useState(65);
    const [tasksDone, setTasksDone] = useState(428);
    const [resonanceEvents, setResonanceEvents] = useState([
        { id: 1, user: 'Sarah K.', task: 'UI Design Sprint', timestamp: '11:07 PM', type: 'sync' },
        { id: 2, user: 'Alex M.', task: 'Deep Work Session', timestamp: '11:06 PM', type: 'wave' },
        { id: 3, user: 'Priya N.', task: 'Code Review', timestamp: '11:05 PM', type: 'sync' },
    ]);

    /* ── Socket ─────────────────────────────────────── */
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', { withCredentials: true });
        socket.on('resonance_event', (data) => {
            setResonanceEvents(prev => [
                {
                    id: Date.now(),
                    user: data.user, task: data.task, type: 'sync',
                    timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 4),
            ]);
            setHarmonyLevel(prev => Math.min(100, prev + 2));
            setTasksDone(prev => prev + 1);
        });
        socket.on('online_users', setActiveUsers);
        return () => socket.disconnect();
    }, []);

    /* ── Ripples ─────────────────────────────────────── */
    const [ripples, setRipples] = useState([]);
    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setRipples(prev => [...prev, { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top, radius: 0, opacity: 1 }]);
    };

    /* ── Canvas animation ────────────────────────────── */
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let raf;
        const particles = [];

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.8 + 0.5;
                this.hue = 0 + Math.random() * 20;   // red family
                this.a = Math.random() * 0.45 + 0.15;
            }
            constructor() { this.reset(); }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.a})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < 55; i++) { const p = new Particle(); p.reset(); particles.push(p); }

        const drawLines = () => {
            const maxD = 130;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < maxD * maxD) {
                        const a = (1 - Math.sqrt(d2) / maxD) * 0.18;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(239,68,68,${a})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dark radial bg
            const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
            g.addColorStop(0, '#0d0505');
            g.addColorStop(1, '#050505');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();

            // Draw ripples
            setRipples(prev => {
                const active = prev.filter(r => r.opacity > 0).map(r => ({ ...r, radius: r.radius + 2.5, opacity: r.opacity - 0.012 }));
                active.forEach(r => {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(239,68,68,${r.opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });
                return active;
            });

            raf = requestAnimationFrame(render);
        };

        render();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
    }, []);

    const harmonyColor = harmonyLevel < 40 ? '#ef4444' : harmonyLevel < 70 ? '#f97316' : '#22c55e';

    return (
        <div style={{ position: 'relative', minHeight: '100dvh', background: '#050505', overflow: 'hidden', fontFamily: 'inherit' }}>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ position: 'absolute', inset: 0, zIndex: 0, cursor: 'crosshair' }}
            />

            {/* CRT scan-line overlay */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.04) 50%)',
                backgroundSize: '100% 4px',
            }} />

            {/* Harmony Surge Banner */}
            <AnimatePresence>
                {harmonyLevel > 80 && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
                        style={{
                            position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 50, pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            padding: '8px 20px', borderRadius: '99px',
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 0 24px rgba(239,68,68,0.2)',
                        }}>
                            <Zap style={{ width: '14px', height: '14px', color: '#ef4444', animation: 'pulse 1s ease-in-out infinite' }} />
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Harmony Surge — 3× Essence Chance Active
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content layer */}
            <div style={{ position: 'relative', zIndex: 10, minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '80px 24px 24px', pointerEvents: 'none' }}>

                {/* ── HEADER ── */}
                <header style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>

                    {/* Left: title block */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                        style={{
                            pointerEvents: 'all',
                            padding: '20px 24px',
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(20px)',
                            maxWidth: '480px',
                            alignSelf: 'flex-start',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <Radio style={{ width: '13px', height: '13px', color: '#ef4444' }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.8)' }}>
                                Collective Consciousness
                            </span>
                            {/* live dot */}
                            <span style={{ position: 'relative', display: 'inline-flex', marginLeft: '4px' }}>
                                <span style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(239,68,68,0.5)', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-flex' }} />
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>LIVE</span>
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 8px' }}>
                            Resonance<br />
                            <span style={{
                                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>Chamber</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                            Real-time synchronization of human effort.<br />
                            <span style={{ color: 'rgba(255,255,255,0.25)' }}>Click anywhere on the field to emit a resonance wave.</span>
                        </p>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', pointerEvents: 'all' }}
                    >
                        {[
                            { label: 'Active Souls', value: activeUsers, suffix: '', icon: Users, color: '#ef4444' },
                            { label: 'Harmony Index', value: harmonyLevel, suffix: '%', icon: Activity, color: harmonyColor },
                            { label: 'Tasks Resonated', value: tasksDone, suffix: '', icon: Target, color: '#a855f7' },
                        ].map(({ label, value, suffix, icon: Icon, color }) => (
                            <div key={label} style={{
                                padding: '14px 18px', borderRadius: '16px',
                                background: 'rgba(255,255,255,0.025)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(16px)',
                                minWidth: '130px', textAlign: 'center',
                            }}>
                                <Icon style={{ width: '16px', height: '16px', color, margin: '0 auto 6px', display: 'block' }} />
                                <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
                                    <Counter value={value} suffix={suffix} />
                                </div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </header>

                {/* ── CENTER: pulsing core ── */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        {/* outer rings */}
                        {[180, 130, 90].map((sz, i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.06 + i * 0.02, 1], opacity: [0.06, 0.14, 0.06] }}
                                transition={{ duration: 3.5 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                                style={{
                                    position: 'absolute',
                                    width: `${sz * 2}px`, height: `${sz * 2}px`,
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(239,68,68,0.4)',
                                }}
                            />
                        ))}
                        {/* core icon */}
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
                            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Zap style={{ width: '120px', height: '120px', color: 'rgba(239,68,68,0.18)' }} />
                        </motion.div>
                    </div>
                </div>

                {/* ── FOOTER panels ── */}
                <footer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', pointerEvents: 'all' }}>

                    {/* Live Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                        style={{
                            padding: '18px 20px',
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Radio style={{ width: '10px', height: '10px', color: '#ef4444' }} />
                            Latest Harmonizations
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <AnimatePresence>
                                {resonanceEvents.map((ev) => (
                                    <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, x: -16, scale: 0.96 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 16, scale: 0.96 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 12px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div style={{
                                            width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.4))',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 900, color: '#ef4444',
                                        }}>
                                            {ev.user[0]}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <span style={{ color: '#ef4444' }}>{ev.user}</span>
                                                {ev.type === 'wave' ? ' triggered wave · ' : ' synced · '}
                                                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{ev.task}</span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{ev.timestamp}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Collective Goal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
                        style={{
                            padding: '18px 20px',
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Target style={{ width: '10px', height: '10px', color: '#a855f7' }} />
                            Collective Soul Goal
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Global Resonance</span>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ef4444' }}>{tasksDone}/500</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (tasksDone / 500) * 100)}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                style={{
                                    height: '100%', borderRadius: '99px',
                                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                                    boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55, margin: 0 }}>
                            Reach 500 resonated tasks globally to unlock the{' '}
                            <span style={{ color: '#fff', fontWeight: 700 }}>Celestial Forge</span>{' '}
                            for 2 hours — 3× Essence drop rate for all.
                        </p>
                    </motion.div>

                    {/* Resonance Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                        style={{
                            padding: '18px 20px',
                            background: 'rgba(239,68,68,0.04)',
                            border: '1px solid rgba(239,68,68,0.12)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Sparkles style={{ width: '13px', height: '13px', color: '#ef4444' }} />
                            <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.7)' }}>
                                Resonance Insight
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 14px' }}>
                            Complete a task within{' '}
                            <span style={{ color: '#fff', fontWeight: 700 }}>30 seconds</span>{' '}
                            of another user to trigger a{' '}
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>Resonance Wave</span>{' '}
                            — granting +2 XP to all participants.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                            <TrendingUp style={{ width: '12px', height: '12px', color: '#22c55e' }} />
                            Harmony currently at <span style={{ color: harmonyColor, fontWeight: 700, marginLeft: '4px' }}>{harmonyLevel}%</span>
                        </div>
                    </motion.div>
                </footer>
            </div>
        </div>
    );
};

export default ResonanceRoom;
