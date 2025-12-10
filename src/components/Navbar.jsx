import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Wallet, LogOut, User, Sun, Moon, Search, Coins, Home, Compass, Swords, PlusCircle, Trophy, Rss, Users, Bell, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import api from '../api/axios';

const Navbar = () => {
    const { currentUser, logout, getUserProfile, theme, toggleTheme } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const location = useLocation();
    const userProfile = getUserProfile();
    const menuRef = React.useRef(null); // Added menuRef

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20); // Changed threshold to 20 and used setIsScrolled
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch unread activity and message count
    useEffect(() => {
        if (currentUser) {
            fetchUnreadCounts();
            // Poll every 5 seconds for new messages and activities (reduced for better responsiveness)
            const interval = setInterval(fetchUnreadCounts, 5000);

            // Listen for instant updates
            const handleMessagesRead = () => fetchUnreadCounts();
            const handleActivityUpdated = () => fetchUnreadCounts();

            window.addEventListener('messages-read', handleMessagesRead);
            window.addEventListener('activity-updated', handleActivityUpdated);

            return () => {
                clearInterval(interval);
                window.removeEventListener('messages-read', handleMessagesRead);
                window.removeEventListener('activity-updated', handleActivityUpdated);
            };
        }
    }, [currentUser]);

    const fetchUnreadCounts = async (retryCount = 0) => {
        try {
            const [activityRes, messageRes] = await Promise.all([
                api.get('/activities/unread-count'),
                api.get('/messages/unread/count')
            ]);
            setUnreadCount(activityRes.data.count);
            setUnreadMessageCount(messageRes.data.count);
        } catch (error) {
            // Only log errors that aren't network-related or if retry attempts exhausted
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NETWORK_CHANGED') {
                // Silently retry once for network errors
                if (retryCount < 1) {
                    setTimeout(() => fetchUnreadCounts(retryCount + 1), 2000);
                }
                // Don't log network errors to avoid console spam
                return;
            }

            // Log other types of errors only once
            if (retryCount === 0) {
                console.warn('Unable to fetch unread counts:', error.message);
            }
        }
    };

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Prevent body scroll when hamburger menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset menu scroll position when opening
    useEffect(() => {
        if (isOpen && menuRef.current) {
            menuRef.current.scrollTop = 0;
        }
    }, [isOpen]);

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Feed', path: '/feed', icon: Rss },
        { name: 'Explore', path: '/explore', icon: Compass },
        { name: 'Find Users', path: '/search', icon: Users },
        { name: 'Duels', path: '/duel', icon: Swords },
        { name: 'Create Task', path: '/create', icon: PlusCircle },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Activity', path: '/activity', icon: Bell },
        { name: 'Messages', path: '/chat', icon: MessageSquare },
    ];

    const menuVariants = {
        closed: {
            x: "-100%",
            transition: {
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
            }
        },
        open: {
            x: "0%",
            transition: {
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
            }
        }
    };

    const linkVariants = {
        closed: { x: -50, opacity: 0 },
        open: (i) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 24
            }
        })
    };

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${scrolled
                    ? 'bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.08] shadow-xl shadow-black/[0.03] dark:shadow-black/40'
                    : 'bg-gradient-to-b from-white/85 to-white/50 dark:from-black/85 dark:to-black/50 backdrop-blur-xl'
                    }`}
                style={{ pointerEvents: 'auto' }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Animated Top Border Gradient */}
                <motion.div
                    className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
                    animate={{
                        opacity: scrolled ? [0.4, 0.9, 0.4] : 0.3,
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" }
                    }}
                />

                <div className="container mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center" style={{ position: 'relative' }}>
                    <div className="flex items-center gap-3 sm:gap-4" style={{ pointerEvents: 'auto', zIndex: 101 }}>
                        {/* Menu Toggle Button */}
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                            className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/[0.02] hover:from-red-50 hover:to-orange-50 dark:hover:from-red-500/10 dark:hover:to-orange-500/10 text-gray-900 dark:text-white transition-all duration-300 relative group border border-gray-200/50 dark:border-white/[0.08] hover:border-red-300/50 dark:hover:border-red-500/30 shadow-sm hover:shadow-md"
                            aria-label="Toggle Menu"
                            style={{ pointerEvents: 'auto', cursor: 'pointer', touchAction: 'manipulation' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                                <motion.div
                                    animate={{
                                        rotate: isOpen ? 180 : 0,
                                        opacity: isOpen ? 0 : 1,
                                        scale: isOpen ? 0.5 : 1
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <Menu className="w-full h-full" />
                                </motion.div>
                                <motion.div
                                    animate={{
                                        rotate: isOpen ? 0 : -180,
                                        opacity: isOpen ? 1 : 0,
                                        scale: isOpen ? 1 : 0.5
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <X className="w-full h-full" />
                                </motion.div>
                            </div>
                            {/* Hover glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"
                                style={{
                                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
                                }}
                            />
                        </motion.button>

                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 sm:gap-2.5 group relative"
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                            onClick={handleLogoClick}
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
                                            fill: 'url(#metallic-red-gradient)',
                                            color: '#dc2626'
                                        }}
                                    />
                                    {/* SVG gradient definition */}
                                    <svg width="0" height="0" className="absolute">
                                        <defs>
                                            <linearGradient id="metallic-red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 sm:gap-3 relative" style={{ pointerEvents: 'auto', zIndex: 101 }}>
                        {/* Desktop Navigation Icons */}
                        {/* Desktop Navigation Icons */}
                        {[
                            { name: 'Feed', path: '/feed', icon: Rss },
                            { name: 'Explore', path: '/explore', icon: Compass },
                            { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
                            ...(currentUser ? [
                                { name: 'Create Task', path: '/create', icon: PlusCircle },
                                { name: 'Activity', path: '/activity', icon: Bell, badge: unreadCount, badgeColor: 'red' },
                                { name: 'Messages', path: '/chat', icon: MessageSquare, badge: unreadMessageCount, badgeColor: 'yellow' }
                            ] : [])
                        ].map(link => (
                            <motion.div
                                key={link.name}
                                className="inline-flex relative"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link
                                    to={link.path}
                                    className={`hidden md:flex relative group p-2.5 rounded-xl transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40'
                                        : 'bg-gray-50/50 dark:bg-white/[0.03] hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-150 dark:hover:from-white/[0.08] dark:hover:to-white/[0.05] text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/[0.08] hover:border-red-200/60 dark:hover:border-red-500/20 shadow-sm hover:shadow-md'
                                        }`}
                                    style={{ pointerEvents: 'auto', cursor: 'pointer', touchAction: 'manipulation' }}
                                >
                                    <link.icon className="w-5 h-5" style={{ pointerEvents: 'none' }} />

                                    {/* Badge Logic */}
                                    {link.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-black ${link.badgeColor === 'yellow'
                                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                                : 'bg-gradient-to-br from-red-500 to-red-600'
                                                }`}
                                        >
                                            {link.badge > 9 ? '9+' : link.badge}
                                        </motion.span>
                                    )}

                                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-[200]">
                                        {link.name}
                                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></span>
                                    </span>
                                </Link>
                                {/* Active indicator underline - positioned on wrapper for centering */}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute -bottom-2 left-0 right-0 mx-auto w-4 h-0.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-full shadow-lg shadow-red-500/50"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        ))}

                        {/* Search Button */}
                        <motion.div
                            className="inline-flex relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                to="/search"
                                className={`group p-2.5 rounded-xl transition-all relative ${location.pathname === '/search'
                                    ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40'
                                    : 'bg-gray-50/50 dark:bg-white/[0.03] hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-150 dark:hover:from-white/[0.08] dark:hover:to-white/[0.05] text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/[0.08] hover:border-red-200/60 dark:hover:border-red-500/20 shadow-sm hover:shadow-md'
                                    }`}
                                style={{ pointerEvents: 'auto', cursor: 'pointer', touchAction: 'manipulation' }}
                            >
                                <Search className="w-5 h-5" style={{ pointerEvents: 'none' }} />
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-[200]">
                                    Search
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></span>
                                </span>
                            </Link>
                            {/* Active indicator */}
                            {location.pathname === '/search' && (
                                <motion.div
                                    layoutId="activeNavIndicator"
                                    className="absolute -bottom-2 left-0 right-0 mx-auto w-4 h-0.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-full shadow-lg shadow-red-500/50"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </motion.div>

                        {/* Theme Toggle */}
                        <motion.div
                            className="inline-flex relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTheme();
                                }}
                                className="group p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.03] hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 dark:hover:from-red-500/10 dark:hover:to-orange-500/10 text-gray-700 dark:text-gray-300 transition-all relative border border-gray-200/50 dark:border-white/[0.08] hover:border-red-300/60 dark:hover:border-red-500/30 shadow-sm hover:shadow-md"
                                style={{ pointerEvents: 'auto', cursor: 'pointer', touchAction: 'manipulation' }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" style={{ pointerEvents: 'none' }} /> : <Moon className="w-5 h-5" style={{ pointerEvents: 'none' }} />}
                                </motion.div>
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-[200]">
                                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></span>
                                </span>
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom glow effect when scrolled */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                    animate={{
                        opacity: scrolled ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                />
            </motion.nav>

            {/* Full Screen Menu Overlay - INSANELY ENHANCED - PORTALED */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9998]"
                                style={{ position: 'fixed' }}
                            />
                            <motion.div
                                ref={menuRef}
                                variants={menuVariants}
                                initial="closed"
                                animate="open"
                                exit="closed"
                                className="fixed top-0 left-0 h-screen w-full md:w-[400px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a] z-[9999] shadow-2xl border-r border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
                                style={{
                                    position: 'fixed',
                                    maxHeight: '100vh',
                                    willChange: 'transform',
                                    backfaceVisibility: 'hidden',
                                    WebkitFontSmoothing: 'antialiased'
                                }}
                            >
                                {/* Simplified Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a] z-[-1]" />

                                {/* Close Button - Fixed Top Right */}
                                <motion.button
                                    onClick={() => setIsOpen(false)}
                                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, rotate: 180 }}
                                    transition={{ delay: 0.1 }}
                                    className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 text-gray-900 dark:text-white hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 group shadow-lg z-[100]"
                                    whileHover={{ scale: 1.15, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close Menu"
                                >
                                    <X className="w-5 h-5 transition-transform duration-300" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{
                                            boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)',
                                        }}
                                    />
                                </motion.button>

                                {/* Content Container with Padding */}
                                <div className="flex-1 flex flex-col px-6 pt-20 pb-6 gap-4 overflow-hidden" style={{ contain: 'layout style paint' }}>
                                    {/* User Profile Section - MASSIVELY ENHANCED */}
                                    {currentUser ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl relative overflow-hidden z-20"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {/* Holographic Shimmer Effect */}
                                            <motion.div
                                                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(251,146,60,0.15) 50%, rgba(236,72,153,0.15) 100%)',
                                                    willChange: 'opacity'
                                                }}
                                            />

                                            {/* Glow Aura - Optimized */}
                                            <motion.div
                                                className="absolute inset-0 rounded-3xl blur-2xl -z-10"
                                                animate={{
                                                    opacity: [0.2, 0.4, 0.2],
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))',
                                                    willChange: 'opacity'
                                                }}
                                            />

                                            {/* Clickable Avatar and Name */}
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-4 mb-4 group cursor-pointer relative"
                                            >
                                                <div className="relative">
                                                    <motion.img
                                                        src={userProfile?.avatar}
                                                        alt="avatar"
                                                        className="w-14 h-14 rounded-full border-2 border-gradient-to-r from-pink-500 to-purple-500 group-hover:border-red-400 transition-colors relative z-10"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <motion.h3
                                                        className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 group-hover:from-red-500 group-hover:to-purple-500 transition-all"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        {userProfile?.name || 'User'}
                                                    </motion.h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile?.email || ''}</p>
                                                </div>
                                                {/* Arrow Icon */}
                                                <motion.div
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </motion.div>
                                            </Link>

                                            {/* Enhanced Coins and XP */}
                                            <div className="flex gap-2 relative z-10">
                                                <Link
                                                    to="/wallet"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-500 rounded-xl font-bold text-sm hover:from-yellow-500/30 hover:to-orange-500/30 transition-all shadow-md relative overflow-hidden group"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{
                                                            background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)'
                                                        }}
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                    <Coins className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    {userProfile?.coins || 0}
                                                </Link>
                                                <Link
                                                    to="/leaderboard"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-sm hover:from-purple-500/30 hover:to-pink-500/30 transition-all shadow-md relative overflow-hidden group"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{
                                                            background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent)'
                                                        }}
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                    <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    {userProfile?.xp || 0} XP
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="z-20"
                                        >
                                            <motion.button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setShowAuthModal(true);
                                                }}
                                                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                                <span className="relative z-10">Login / Sign Up</span>
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {/* Navigation Links - CRAZY ENHANCED */}
                                    <div className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden relative z-20 custom-scrollbar pr-1">
                                        <style>{`
                                            .custom-scrollbar::-webkit-scrollbar {
                                                width: 5px;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-track {
                                                background: transparent;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                                background: linear-gradient(to bottom, #ec4899, #8b5cf6);
                                                border-radius: 10px;
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                background: linear-gradient(to bottom, #f43f5e, #a78bfa);
                                            }
                                        `}</style>
                                        {navLinks.map((link, i) => (
                                            <motion.div
                                                key={link.name}
                                                custom={i}
                                                variants={linkVariants}
                                                whileHover={{ x: 10, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden ${location.pathname === link.path
                                                        ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-600 dark:text-red-400 shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-white/5 dark:hover:to-white/10 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                >
                                                    {/* Shine effect on hover */}
                                                    <motion.div
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{
                                                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                                                        }}
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />

                                                    {/* Icon Container */}
                                                    <motion.div
                                                        className={`p-3 rounded-xl transition-all duration-300 relative ${location.pathname === link.path
                                                            ? 'bg-gradient-to-br from-red-500 to-purple-500 text-white scale-110 shadow-lg'
                                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 group-hover:from-red-500/20 group-hover:to-purple-500/20 group-hover:scale-110 group-hover:shadow-md'
                                                            }`}
                                                        whileHover={{ rotate: [0, -10, 10, 0] }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <link.icon className="w-5 h-5" />
                                                        {/* Pulse effect for active */}
                                                        {location.pathname === link.path && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-xl bg-red-500"
                                                                animate={{
                                                                    scale: [1, 1.3, 1],
                                                                    opacity: [0.5, 0, 0.5],
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            />
                                                        )}
                                                    </motion.div>

                                                    <span className="font-bold text-lg flex-1">{link.name}</span>

                                                    {/* Active indicator */}
                                                    {location.pathname === link.path && (
                                                        <motion.div
                                                            layoutId="activeDot"
                                                            className="w-2 h-2 bg-gradient-to-r from-red-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                                                            animate={{
                                                                scale: [1, 1.3, 1],
                                                            }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                    )}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Footer Actions - Enhanced */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="pt-4 border-t border-gray-200 dark:border-white/10 relative z-20"
                                    >
                                        {currentUser && (
                                            <motion.button
                                                onClick={() => {
                                                    logout();
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 group relative overflow-hidden"
                                                whileHover={{ x: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{
                                                        background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent)'
                                                    }}
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span className="font-medium">Logout</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

export default Navbar;
