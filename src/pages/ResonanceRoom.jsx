import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Globe, Share2, Sparkles } from 'lucide-react';
import { io } from 'socket.io-client';

const ResonanceRoom = () => {
    const canvasRef = useRef(null);
    const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 50) + 120);
    const [harmonyLevel, setHarmonyLevel] = useState(65);
    const [resonanceEvents, setResonanceEvents] = useState([
        { id: 1, user: 'Sarah', task: 'Design Sprint', timestamp: '07:23:16 PM' },
        { id: 2, user: 'Alex', task: 'Deep Work', timestamp: '07:23:12 PM' },
    ]);

    // Socket.io initialization
    useEffect(() => {
        const socket = io('http://localhost:5001', {
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('🔗 Connected to Resonance Stream');
        });

        socket.on('resonance_event', (data) => {
            console.log('✨ Resonance Wave Received:', data);

            // Add to feed
            setResonanceEvents(prev => [
                {
                    id: Date.now(),
                    user: data.user,
                    task: data.task,
                    timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                },
                ...prev.slice(0, 4)
            ]);

            // Visual pulse in harmony level
            setHarmonyLevel(prev => Math.min(100, prev + 2));
            setActiveUsers(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const particles = [];
        const particleCount = 40;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.color = `hsla(${220 + Math.random() * 60}, 70%, 70%, ${Math.random() * 0.5 + 0.2})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const drawResonanceLines = () => {
            ctx.lineWidth = 0.5;
            const maxDist = 120;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < maxDist * maxDist) {
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / maxDist) * 0.5})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
            grad.addColorStop(0, '#0a0a1a');
            grad.addColorStop(1, '#000000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawResonanceLines();
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-purple-500/30">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="relative z-10 w-full h-full min-h-screen flex flex-col p-6 pt-24 pointer-events-none">
                <header className="flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl pointer-events-auto"
                    >
                        <div className="flex items-center gap-3 text-purple-400 mb-2 font-bold tracking-widest uppercase text-xs">
                            <Globe size={16} />
                            Collective Consciousness
                        </div>
                        <h1 className="text-4xl font-black text-white">Resonance Chamber</h1>
                        <p className="text-slate-400 text-sm mt-1">Real-time synchronization of human effort.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-2 gap-4 pointer-events-auto"
                    >
                        <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl text-center">
                            <div className="text-purple-400 mb-1"><Users size={20} className="mx-auto" /></div>
                            <div className="text-2xl font-black text-white">{activeUsers}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Active Souls</div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl text-center">
                            <div className="text-blue-400 mb-1"><Zap size={20} className="mx-auto" /></div>
                            <div className="text-2xl font-black text-white">{Math.round(harmonyLevel)}%</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Harmony Index</div>
                        </div>
                    </motion.div>
                </header>

                <main className="flex-grow flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-purple-500/20 blur-[120px] rounded-full" />
                        <Zap size={200} className="text-white/10 relative z-10" />
                    </motion.div>
                </main>

                <footer className="flex justify-between items-end">
                    <div className="w-80 pointer-events-auto">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Latest Harmonizations</div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {resonanceEvents.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                        className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-xl"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                            {event.user[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">
                                                <span className="text-purple-400">{event.user}</span> synchronized <span className="text-blue-400">{event.task}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500">{event.timestamp}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 pointer-events-auto max-w-xs"
                    >
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
                            <Sparkles size={14} />
                            Resonance Insight
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Complete a task within 30 seconds of another user to trigger a <span className="text-white font-bold">Resonance Wave</span> (+2 XP for all participants).
                        </p>
                    </motion.div>
                </footer>
            </div>

            <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
        </div>
    );
};

export default ResonanceRoom;
