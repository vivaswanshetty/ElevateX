import React from 'react';
import { ArrowLeft, Target, Users, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
    const navigate = useNavigate();

    const values = [
        { icon: Target, title: 'Mission-Driven', color: '#ef4444', description: 'Empowering individuals to achieve more through collaborative task completion and skill development.' },
        { icon: Users, title: 'Community First', color: '#6366f1', description: 'Building a vibrant ecosystem where everyone can contribute, learn, and grow together.' },
        { icon: Zap, title: 'Innovation', color: '#f97316', description: 'Leveraging cutting-edge technology to create seamless and engaging user experiences.' },
        { icon: Award, title: 'Excellence', color: '#eab308', description: 'Committed to delivering high-quality solutions that exceed expectations every time.' },
    ];

    const stats = [
        { value: '10K+', label: 'Active Users' },
        { value: '50K+', label: 'Tasks Completed' },
        { value: '100K+', label: 'Coins Earned' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-6" style={{ background: '#050505' }}>
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                        <Zap className="w-3 h-3" fill="currentColor" /> Our Story
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                        About <span style={{ color: '#ef4444' }}>ElevateX</span>
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        A revolutionary platform that connects task creators with skilled doers, fostering collaboration and productivity in a gamified environment.
                    </p>
                </motion.div>

                {/* Story Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-2xl p-8 md:p-12 mb-12"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <h2 className="text-2xl font-bold mb-6 text-white">Our Story</h2>
                    <div className="space-y-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <p>ElevateX was born from a simple observation: talented individuals often struggle to find meaningful opportunities to showcase their skills, while others need help completing tasks that fall outside their expertise.</p>
                        <p>We envisioned a platform that bridges this gap — a space where anyone can post tasks they need help with, and skilled individuals can apply to complete them for rewards. What started as an idea has grown into a thriving community of doers, creators, and collaborators.</p>
                        <p>Today, ElevateX stands as a testament to the power of collaboration, combining gamification, social features, and cutting-edge technology to create an ecosystem where everyone wins.</p>
                    </div>
                </motion.div>

                {/* Values Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-8 text-center text-white">Our Core Values</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        {values.map((value, i) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                                    className="rounded-xl p-6 group hover:scale-[1.02] transition-all"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${value.color}15` }}>
                                            <Icon className="w-5 h-5" style={{ color: value.color }} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold mb-1 text-white">{value.title}</h3>
                                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{value.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-2xl p-12 text-center"
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
                >
                    <h2 className="text-2xl font-bold mb-10 text-white">ElevateX By The Numbers</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {stats.map((s, i) => (
                            <div key={i} className="group hover:scale-110 transition-transform">
                                <div className="text-5xl font-black mb-2" style={{ color: '#ef4444' }}>{s.value}</div>
                                <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
