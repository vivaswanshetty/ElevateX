import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Twitter, Github, Linkedin, Mail, Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const quickLinks = [
        { name: 'About', to: '/about' },
        { name: 'Blog', to: '/blog' },
        { name: 'FAQ\'s', to: '/faq' },
        { name: 'Contact', to: '/contact' }
    ];

    const legal = [
        { name: 'Privacy', to: '/privacy' },
        { name: 'Terms', to: '/terms' }
    ];

    const socials = [
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
        { name: 'GitHub', icon: Github, href: 'https://github.com' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
        { name: 'Email', icon: Mail, href: 'mailto:hello@elevatex.com' }
    ];

    return (
        <footer className="relative py-16 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 border-t border-gray-200/30 dark:border-gray-800/30 transition-colors duration-300 overflow-hidden">
            {/* Background Decoration */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.05, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.05, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"
            />

            <div className="container mx-auto px-6 relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 group relative"
                            onClick={scrollToTop}
                        >
                            {/* Logo Icon Container */}
                            <motion.div
                                className="relative flex items-center justify-center"
                                whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 400 }}
                            >
                                {/* Simple glow behind icon */}
                                <div className="absolute inset-0 bg-red-600/50 rounded-full blur-md group-hover:bg-red-600/70 transition-all duration-300" />

                                {/* Metallic Icon - True Red */}
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        scale: [1, 1.03, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Zap
                                        className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_0_12px_rgba(220,38,38,0.9)]"
                                        style={{
                                            pointerEvents: 'none',
                                            fill: 'url(#metallic-red-gradient-footer)',
                                            color: '#dc2626'
                                        }}
                                    />
                                    {/* SVG gradient definition */}
                                    <svg width="0" height="0" className="absolute">
                                        <defs>
                                            <linearGradient id="metallic-red-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#ee0000" />
                                                <stop offset="25%" stopColor="#ff3333" />
                                                <stop offset="50%" stopColor="#ff0000" />
                                                <stop offset="75%" stopColor="#cc0000" />
                                                <stop offset="100%" stopColor="#ee0000" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </motion.div>
                            </motion.div>


                            {/* Logo Text - Metallic with Red Glow on Hover */}
                            <div className="relative overflow-hidden">
                                {/* Light mode - dark metallic base */}
                                <motion.span
                                    className="text-xl sm:text-2xl font-black tracking-tight dark:hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 20%, #1a1a1a 40%, #6a6a6a 60%, #1a1a1a 80%, #4a4a4a 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        textShadow: '0 1px 2px rgba(255,255,255,0.1)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ElevateX
                                </motion.span>

                                {/* Light mode - red metallic overlay on hover */}
                                <motion.span
                                    className="absolute inset-0 text-xl sm:text-2xl font-black tracking-tight dark:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 20%, #f87171 40%, #ef4444 60%, #dc2626 80%, #b91c1c 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        textShadow: '0 0 8px rgba(239,68,68,0.3)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ElevateX
                                </motion.span>

                                {/* Dark mode - silver metallic base */}
                                <motion.span
                                    className="text-xl sm:text-2xl font-black tracking-tight hidden dark:inline"
                                    style={{
                                        background: 'linear-gradient(135deg, #e8e8e8 0%, #ffffff 20%, #c0c0c0 40%, #ffffff 60%, #e8e8e8 80%, #d0d0d0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ElevateX
                                </motion.span>

                                {/* Dark mode - red metallic overlay on hover */}
                                <motion.span
                                    className="absolute inset-0 text-xl sm:text-2xl font-black tracking-tight hidden dark:inline opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: 'linear-gradient(135deg, #f87171 0%, #fca5a5 20%, #f87171 40%, #fca5a5 60%, #f87171 80%, #ef4444 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        textShadow: '0 0 10px rgba(248,113,113,0.4)',
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ElevateX
                                </motion.span>

                                {/* Shimmer effect on hover */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
                            The skill marketplace for the new generation. Earn rewards, level up, and connect with opportunities worldwide.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socials.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-sm hover:shadow-lg"
                                    title={social.name}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Subtle Gradient Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200/30 dark:via-gray-700/30 to-transparent mb-8" />

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        © 2025 ElevateX™. Built with
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        and ambition.
                    </p>

                    {/* Scroll to Top Button */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scrollToTop}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        Back to Top
                        <ArrowUp className="w-4 h-4" />
                    </motion.button>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
