import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Twitter, Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const columns = [
        {
            title: 'Product',
            links: [
                { name: 'About', to: '/about' },
                { name: 'Blog', to: '/blog' },
                { name: "FAQ's", to: '/faq' },
                { name: 'Contact', to: '/contact' },
            ],
        },
        {
            title: 'Platform',
            links: [
                { name: 'Explore', to: '/explore' },
                { name: 'Leaderboard', to: '/leaderboard' },
                { name: 'Duels', to: '/duel' },
                { name: 'Alchemy Lab', to: '/alchemy' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', to: '/privacy' },
                { name: 'Terms of Service', to: '/terms' },
                { name: 'Cookie Policy', to: '/cookies' },
            ],
        },
    ];

    const socials = [
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:hello@elevatex.app', label: 'Email' },
    ];

    return (
        <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Top divider glow */}
            <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }} />

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Main grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
                            <div className="relative flex items-center justify-center w-8 h-8 transition-all group-hover:scale-110">
                                <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 70%)' }} />
                                <Zap className="w-5 h-5 relative z-10" style={{ color: '#ef4444', filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.8))' }} fill="#ef4444" />
                            </div>
                            <span className="text-base font-black tracking-tight text-white">ElevateX</span>
                        </Link>
                        <p className="text-sm font-light leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            The productivity platform that rewards your ambition with real value.
                        </p>
                        <div className="flex items-center gap-2">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {columns.map(({ title, links }) => (
                        <div key={title}>
                            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                {title}
                            </p>
                            <ul className="space-y-3">
                                {links.map(({ name, to }) => (
                                    <li key={name}>
                                        <Link
                                            to={to}
                                            className="text-sm font-light transition-colors"
                                            style={{ color: 'rgba(255,255,255,0.55)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                                        >
                                            {name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.40)' }}>
                        © {new Date().getFullYear()} ElevateX. All rights reserved.
                    </p>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                        Back to top
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
