import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, Zap, LogOut, Trophy,
    Home, Compass, Swords, PlusCircle, Rss, Users, Bell, BellRing,
    MessageSquare, Beaker, Globe, Crown, Search, Brain, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import api from '../api/axios';
import usePushNotifications from '../hooks/usePushNotifications';

// ── Bottom dock links ──────────────────────────────────────────────────────────
const DOCK_LINKS_LOGGED_IN = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Create', path: '/create', icon: PlusCircle },
    { name: 'Feed', path: '/feed', icon: Rss },
    { name: 'Chat', path: '/chat', icon: MessageSquare, badgeKey: 'message' },
];
const DOCK_LINKS_LOGGED_OUT = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Rankings', path: '/leaderboard', icon: Trophy },
    { name: 'Feed', path: '/feed', icon: Rss },
    { name: 'Search', path: '/search', icon: Search },
];

const Navbar = () => {
    const { currentUser, logout, getUserProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const location = useLocation();
    const userProfile = getUserProfile();
    const menuRef = React.useRef(null);
    const { isSubscribed, isLoading: pushLoading, requestPermission, unsubscribe } = usePushNotifications();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 30000);
            window.addEventListener('messages-read', fetchUnreadCounts);
            window.addEventListener('activity-updated', fetchUnreadCounts);
            return () => {
                clearInterval(interval);
                window.removeEventListener('messages-read', fetchUnreadCounts);
                window.removeEventListener('activity-updated', fetchUnreadCounts);
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
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NETWORK_CHANGED') {
                if (retryCount < 1) setTimeout(() => fetchUnreadCounts(retryCount + 1), 2000);
                return;
            }
            if (retryCount === 0) console.warn('Unable to fetch unread counts:', error.message);
        }
    };

    useEffect(() => { setIsOpen(false); }, [location]);
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);
    useEffect(() => {
        if (isOpen && menuRef.current) menuRef.current.scrollTop = 0;
    }, [isOpen]);

    const handleLogoClick = (e) => {
        if (location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Feed', path: '/feed', icon: Rss },
        { name: 'Explore', path: '/explore', icon: Compass },
        { name: 'AI Matching', path: '/aimatching', icon: Brain },
        { name: 'Community', path: '/community', icon: Users },
        { name: 'Find Users', path: '/search', icon: Search },
        { name: 'Resonance Room', path: '/resonance', icon: Globe },
        { name: 'Duels', path: '/duel', icon: Swords },
        { name: 'Alchemy Lab', path: '/alchemy', icon: Beaker },
        { name: 'Create Task', path: '/create', icon: PlusCircle },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Activity', path: '/activity', icon: Bell },
        { name: 'Messages', path: '/chat', icon: MessageSquare },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
        { name: 'Subscription', path: '/subscription', icon: Crown },
    ];

    const topBarLinks = currentUser ? [
        { name: 'Rankings', path: '/leaderboard', icon: Trophy, tooltip: 'Global Leaderboard' },
        { name: 'Activity', path: '/activity', icon: Bell, badge: unreadCount, tooltip: 'Notifications' },
        { name: 'Find Users', path: '/search', icon: Search, tooltip: 'Search for people' },
        { name: 'AI Match', path: '/aimatching', icon: Brain, tooltip: 'AI-powered task matching' },
    ] : [
        { name: 'Community', path: '/community', icon: Users, tooltip: 'Join the community' },
        { name: 'AI Match', path: '/aimatching', icon: Brain, tooltip: 'AI-powered task matching' },
    ];

    const isActive = (path) => location.pathname === path;
    const dockLinks = currentUser ? DOCK_LINKS_LOGGED_IN : DOCK_LINKS_LOGGED_OUT;
    const getBadge = (link) => {
        if (link.badgeKey === 'activity') return unreadCount;
        if (link.badgeKey === 'message') return unreadMessageCount;
        return 0;
    };

    return (
        <>
            {/* ════════════════════════════════════════
                TOP BAR — slightly taller, richer feel
            ════════════════════════════════════════ */}
            <motion.nav
                className="fixed top-0 left-0 w-full z-[100]"
                style={{
                    background: scrolled
                        ? 'rgba(4,4,4,0.96)'
                        : 'rgba(4,4,4,0.75)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: scrolled
                        ? '1px solid rgba(255,255,255,0.07)'
                        : '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.4s, border-color 0.4s',
                }}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Subtle red glow line at very bottom of nav */}
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '40%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.25), transparent)',
                    opacity: scrolled ? 1 : 0,
                    transition: 'opacity 0.4s',
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* ── Left: hamburger + logo ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle Menu"
                            style={{
                                width: '38px', height: '38px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isOpen
                                    ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X style={{ width: '16px', height: '16px' }} /></motion.div>
                                    : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu style={{ width: '16px', height: '16px' }} /></motion.div>
                                }
                            </AnimatePresence>
                        </button>

                        {/* Logo */}
                        <Link to="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}
                            className="group"
                        >
                            <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s' }} className="group-hover:scale-110">
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)' }} />
                                <Zap style={{ width: '20px', height: '20px', color: '#ef4444', fill: '#ef4444', filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.9))', position: 'relative', zIndex: 1 }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>ElevateX</span>
                            </div>
                        </Link>
                    </div>

                    {/* ── Right: top-bar icon links + avatar ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        {/* Desktop icon links with labels (hidden on mobile) */}
                        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '3px' }}>
                            {topBarLinks.map(link => {
                                const active = isActive(link.path);
                                return (
                                    <div key={link.name} style={{ position: 'relative' }} className="group">
                                        <Link
                                            to={link.path}
                                            style={{
                                                position: 'relative',
                                                height: '34px',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '0 11px',
                                                borderRadius: '10px', textDecoration: 'none',
                                                background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${active ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.07)'}`,
                                                color: active ? '#ef4444' : 'rgba(255,255,255,0.4)',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'; } }}
                                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; } }}
                                        >
                                            <link.icon style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                                            <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
                                                {link.name}
                                            </span>
                                            {(link.badge ?? 0) > 0 && (
                                                <span style={{
                                                    minWidth: '16px', height: '16px', borderRadius: '8px', padding: '0 3px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '9px', fontWeight: 900, color: '#fff',
                                                    background: '#ef4444', marginLeft: '2px',
                                                }}>
                                                    {link.badge > 9 ? '9+' : link.badge}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none" style={{
                                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                            marginTop: '8px', padding: '5px 10px',
                                            background: 'rgba(10,10,10,0.95)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '8px',
                                            fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                                            whiteSpace: 'nowrap',
                                            transition: 'opacity 0.15s',
                                            zIndex: 200,
                                        }}>
                                            {link.tooltip || link.name}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Divider */}
                            <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.06)', margin: '0 5px' }} />
                        </div>

                        {/* Push Notification Bell — shown when logged in */}
                        {currentUser && (
                            <div style={{ position: 'relative' }} className="group">
                                <button
                                    onClick={() => isSubscribed ? unsubscribe() : requestPermission()}
                                    disabled={pushLoading}
                                    title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
                                    style={{
                                        width: '38px', height: '38px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '12px',
                                        background: isSubscribed ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isSubscribed ? 'rgba(239,68,68,0.28)' : 'rgba(255,255,255,0.08)'}`,
                                        color: isSubscribed ? '#ef4444' : 'rgba(255,255,255,0.40)',
                                        cursor: pushLoading ? 'wait' : 'pointer',
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={e => { if (!isSubscribed) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}
                                    onMouseLeave={e => { if (!isSubscribed) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; } }}
                                >
                                    {isSubscribed
                                        ? <BellRing style={{ width: '15px', height: '15px' }} />
                                        : <Bell style={{ width: '15px', height: '15px' }} />
                                    }
                                    {isSubscribed && (
                                        <span style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            background: '#ef4444',
                                            boxShadow: '0 0 0 2px rgba(4,4,4,0.96)',
                                        }} />
                                    )}
                                </button>
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 pointer-events-none" style={{
                                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                    marginTop: '8px', padding: '5px 10px',
                                    background: 'rgba(10,10,10,0.95)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                                    whiteSpace: 'nowrap',
                                    transition: 'opacity 0.15s',
                                    zIndex: 200,
                                }}>
                                    {isSubscribed ? 'Notifications ON' : 'Enable Notifications'}
                                </div>
                            </div>
                        )}

                        {/* Avatar / Login */}
                        {currentUser ? (
                            <Link
                                to="/profile"
                                title="Profile"
                                style={{
                                    width: '38px', height: '38px',
                                    borderRadius: '12px', overflow: 'hidden',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    display: 'block', transition: 'border-color 0.2s',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                <img src={userProfile?.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                style={{
                                    padding: '0 16px', height: '38px',
                                    borderRadius: '12px',
                                    background: 'rgba(239,68,68,0.12)',
                                    border: '1px solid rgba(239,68,68,0.28)',
                                    color: '#ef4444',
                                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    letterSpacing: '0.01em',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.28)'; }}
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* ════════════════════════════════════════
                BOTTOM DOCK — polished pill nav
            ════════════════════════════════════════ */}
            <motion.div
                style={{
                    position: 'fixed',
                    bottom: '36px',
                    left: 0, right: 0,
                    zIndex: 99,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none',      // let the inner pill capture events
                }}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Pill container */}
                <div style={{
                    pointerEvents: 'all',
                    display: 'flex', alignItems: 'center',
                    gap: '2px',
                    padding: '5px 6px',
                    background: 'rgba(10,10,10,0.92)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '22px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                }}>
                    {dockLinks.map((link) => {
                        const active = isActive(link.path);
                        const badge = getBadge(link);
                        const Icon = link.icon;
                        const isCreate = link.path === '/create';

                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                title={link.name}
                                style={{
                                    position: 'relative',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '4px',
                                    /* Every item: identical fixed width & padding */
                                    width: '58px',
                                    paddingTop: '9px',
                                    paddingBottom: '9px',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    color: active
                                        ? (isCreate ? '#fff' : '#ef4444')
                                        : 'rgba(255,255,255,0.38)',
                                    transition: 'color 0.18s',
                                }}
                                onMouseEnter={e => {
                                    if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                                }}
                                onMouseLeave={e => {
                                    if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                                }}
                            >
                                {/* Single animated active background — same shape/size for every item */}
                                {active && (
                                    <motion.div
                                        layoutId="dock-active"
                                        style={{
                                            position: 'absolute', inset: 0,
                                            borderRadius: '16px',
                                            background: isCreate
                                                ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                                                : 'rgba(239,68,68,0.11)',
                                            border: `1px solid ${isCreate
                                                ? 'rgba(239,68,68,0.55)'
                                                : 'rgba(239,68,68,0.22)'}`,
                                            boxShadow: isCreate
                                                ? '0 4px 18px rgba(220,38,38,0.32)'
                                                : 'none',
                                        }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                    />
                                )}

                                {/* Badge */}
                                {badge > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '4px', right: '9px',
                                        minWidth: '14px', height: '14px',
                                        borderRadius: '7px', padding: '0 3px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '8px', fontWeight: 900, color: '#fff',
                                        background: '#ef4444',
                                        border: '1.5px solid #0a0a0a',
                                        zIndex: 2,
                                    }}>
                                        {badge > 9 ? '9+' : badge}
                                    </span>
                                )}

                                {/* Icon — identical size for every item */}
                                <Icon style={{
                                    position: 'relative', zIndex: 1,
                                    width: '17px', height: '17px',
                                    strokeWidth: active ? 2.2 : 1.7,
                                    transition: 'stroke-width 0.18s',
                                }} />

                                {/* Label */}
                                <span style={{
                                    position: 'relative', zIndex: 1,
                                    fontSize: '9px',
                                    fontWeight: active ? 700 : 500,
                                    letterSpacing: '0.02em',
                                    lineHeight: 1,
                                    transition: 'font-weight 0.18s',
                                }}>
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>

            {/* ════════════════════════════════════════
                HAMBURGER DRAWER
            ════════════════════════════════════════ */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.22 }}
                                onClick={() => setIsOpen(false)}
                                style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
                            />

                            <motion.div
                                ref={menuRef}
                                initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '-100%' }}
                                transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 }}
                                style={{
                                    position: 'fixed', top: 0, left: 0,
                                    height: '100dvh', width: '100%', maxWidth: '340px',
                                    zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                                    background: '#080808',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: '8px 0 40px rgba(0,0,0,0.5)',
                                }}
                            >
                                {/* Drawer ambient glow */}
                                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

                                {/* Drawer header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ position: 'relative', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 70%)' }} />
                                            <Zap style={{ width: '18px', height: '18px', color: '#ef4444', fill: '#ef4444', filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.8))', position: 'relative', zIndex: 1 }} />
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>ElevateX</span>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                                    >
                                        <X style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>

                                {/* User card */}
                                <div style={{ padding: '16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {currentUser ? (
                                        <>
                                            <Link to="/profile" onClick={() => setIsOpen(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', textDecoration: 'none', padding: '8px', borderRadius: '14px', transition: 'background 0.2s' }}
                                                className="group"
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <img src={userProfile?.avatar} alt="avatar" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.name || 'User'}</p>
                                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.email || ''}</p>
                                                </div>
                                                <div style={{ color: 'rgba(239,68,68,0.5)', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </Link>

                                            {/* Stats */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                                                {[
                                                    { label: 'Coins', value: userProfile?.coins || 0, to: '/wallet' },
                                                    { label: 'XP', value: userProfile?.xp || 0, to: '/leaderboard' },
                                                    { label: 'Level', value: Math.floor((userProfile?.xp || 0) / 500) + 1, to: '/leaderboard' },
                                                ].map(({ label, value, to }) => (
                                                    <Link key={label} to={to} onClick={() => setIsOpen(false)}
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px',
                                                            borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s',
                                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                    >
                                                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>{value.toLocaleString()}</span>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { setIsOpen(false); setShowAuthModal(true); }}
                                            style={{
                                                width: '100%', padding: '14px',
                                                borderRadius: '14px', border: '1px solid rgba(239,68,68,0.25)',
                                                background: 'rgba(239,68,68,0.1)',
                                                color: '#ef4444', fontSize: '14px', fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                        >
                                            Login / Sign Up
                                        </button>
                                    )}
                                </div>

                                {/* Nav links list */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
                                    {navLinks.map((link, i) => {
                                        const active = isActive(link.path);
                                        const hasBadge = link.path === '/activity' ? unreadCount : link.path === '/chat' ? unreadMessageCount : 0;
                                        return (
                                            <motion.div
                                                key={link.name}
                                                initial={{ x: -16, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.035, duration: 0.28 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    onClick={() => setIsOpen(false)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '10px 12px', borderRadius: '12px', marginBottom: '2px',
                                                        textDecoration: 'none', transition: 'all 0.18s',
                                                        background: active ? 'rgba(239,68,68,0.08)' : 'transparent',
                                                        borderLeft: `2px solid ${active ? 'rgba(239,68,68,0.45)' : 'transparent'}`,
                                                        paddingLeft: '14px',
                                                    }}
                                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '10px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0, transition: 'all 0.18s',
                                                        background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                                                        color: active ? '#ef4444' : 'rgba(255,255,255,0.55)',
                                                    }}>
                                                        <link.icon style={{ width: '15px', height: '15px' }} />
                                                    </div>
                                                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)', transition: 'color 0.18s' }}>
                                                        {link.name}
                                                    </span>
                                                    {hasBadge > 0 && (
                                                        <span style={{
                                                            fontSize: '9px', fontWeight: 900,
                                                            padding: '2px 6px', borderRadius: '6px',
                                                            color: '#fff', background: 'rgba(239,68,68,0.35)',
                                                        }}>
                                                            {hasBadge > 9 ? '9+' : hasBadge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Drawer footer */}
                                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {currentUser ? (
                                        <button
                                            onClick={() => { logout(); setIsOpen(false); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                width: '100%', padding: '11px 14px', borderRadius: '12px',
                                                border: '1px solid rgba(252,165,165,0.1)',
                                                background: 'rgba(252,165,165,0.04)',
                                                color: 'rgba(252,165,165,0.55)', fontSize: '13px', fontWeight: 600,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,165,165,0.09)'; e.currentTarget.style.color = 'rgba(252,165,165,0.85)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(252,165,165,0.04)'; e.currentTarget.style.color = 'rgba(252,165,165,0.55)'; }}
                                        >
                                            <LogOut style={{ width: '15px', height: '15px' }} />
                                            Sign Out
                                        </button>
                                    ) : (
                                        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                                            © {new Date().getFullYear()} ElevateX
                                        </p>
                                    )}
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
