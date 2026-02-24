import React from 'react';
import { ArrowLeft, Calendar, User, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const blogPosts = [
    { id: 1, title: 'The Future of Collaborative Work: How ElevateX is Changing the Game', excerpt: 'Discover how our platform is revolutionizing the way people connect, collaborate, and complete tasks in the digital age.', author: 'Sarah Johnson', date: 'Nov 25, 2025', category: 'Platform Updates', emoji: '🚀', readTime: '5 min read', color: '#ef4444' },
    { id: 2, title: '10 Tips to Maximize Your Earnings on ElevateX', excerpt: 'Expert strategies to help you stand out, win more tasks, and boost your coin balance on the platform.', author: 'Michael Chen', date: 'Nov 22, 2025', category: 'Tips & Tricks', emoji: '💰', readTime: '7 min read', color: '#f97316' },
    { id: 3, title: 'Building Your Profile: Best Practices for Success', excerpt: 'Learn how to create a compelling profile that attracts task creators and showcases your unique skills.', author: 'Emma Williams', date: 'Nov 20, 2025', category: 'Guides', emoji: '✨', readTime: '6 min read', color: '#6366f1' },
    { id: 4, title: 'Community Spotlight: Success Stories from Top Users', excerpt: 'Meet the achievers who have transformed their ElevateX journey into remarkable success stories.', author: 'David Park', date: 'Nov 18, 2025', category: 'Community', emoji: '🌟', readTime: '8 min read', color: '#eab308' },
    { id: 5, title: 'Understanding the ElevateX Coin Economy', excerpt: 'A deep dive into how our virtual currency works and how to make the most of it.', author: 'Lisa Anderson', date: 'Nov 15, 2025', category: 'Features', emoji: '🪙', readTime: '4 min read', color: '#10b981' },
    { id: 6, title: 'New Feature Alert: Productivity Duels Are Here!', excerpt: 'Challenge your peers and showcase your skills in our exciting new competitive feature.', author: 'James Rodriguez', date: 'Nov 12, 2025', category: 'Product News', emoji: '⚔️', readTime: '3 min read', color: '#8b5cf6' },
];

const Blog = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen py-20 px-6" style={{ background: '#050505' }}>
            <div className="max-w-6xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                        <Zap className="w-3 h-3" fill="currentColor" /> ElevateX Blog
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-4">Insights & <span style={{ color: '#ef4444' }}>Stories</span></h1>
                    <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>Insights, tips, and stories from the ElevateX community</p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                            className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = `${post.color}30`}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            {/* Banner */}
                            <div className="h-40 flex items-center justify-center text-6xl relative overflow-hidden" style={{ background: `${post.color}10` }}>
                                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${post.color}15 0%, transparent 70%)` }} />
                                <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{post.emoji}</span>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background: `${post.color}15`, color: post.color, border: `1px solid ${post.color}25` }}>
                                        {post.category}
                                    </span>
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{post.readTime}</span>
                                </div>

                                <h3 className="text-sm font-bold mb-2 text-white leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">{post.title}</h3>
                                <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{post.excerpt}</p>

                                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            <User className="w-3 h-3" /> {post.author}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            <Calendar className="w-3 h-3" /> {post.date}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: post.color }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-16 text-center rounded-2xl p-12"
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
                >
                    <h2 className="text-2xl font-bold mb-3 text-white">Stay Tuned for More!</h2>
                    <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>We're constantly publishing new content to help you succeed on ElevateX.</p>
                    <button
                        className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    >
                        Subscribe to Newsletter
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Blog;
