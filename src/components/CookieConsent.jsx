import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cookie, X, ShieldCheck, ChevronRight } from 'lucide-react';

const CookieConsent = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => setShow(true), 1800);
        }
    }, []);

    const accept = () => { localStorage.setItem('cookieConsent', 'accepted'); setShow(false); };
    const decline = () => { localStorage.setItem('cookieConsent', 'declined'); setShow(false); };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 32, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    style={{
                        position: 'fixed',
                        // sits above the dock+ticker (92px total from bottom)
                        bottom: '104px',
                        right: '16px',
                        left: '16px',
                        maxWidth: '400px',
                        marginLeft: 'auto',
                        zIndex: 9990,
                    }}
                >
                    {/* Card */}
                    <div style={{
                        background: '#0d0d0d',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                        position: 'relative',
                    }}>
                        {/* Top red accent line */}
                        <div style={{
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), rgba(220,38,38,0.8), rgba(239,68,68,0.6), transparent)',
                        }} />

                        {/* Ambient glow */}
                        <div style={{
                            position: 'absolute', top: '-50px', right: '-50px',
                            width: '150px', height: '150px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        <div style={{ padding: '20px 20px 20px' }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Cookie style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                                            Cookie Preferences
                                        </h3>
                                        <ShieldCheck style={{ width: '13px', height: '13px', color: '#22c55e', flexShrink: 0 }} />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
                                        We use cookies to enhance your experience.{' '}
                                        <Link
                                            to="/privacy"
                                            onClick={decline}
                                            style={{ color: 'rgba(239,68,68,0.7)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
                                        >
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </div>

                                {/* Close */}
                                <button
                                    onClick={decline}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '9px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                >
                                    <X style={{ width: '12px', height: '12px' }} />
                                </button>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '14px' }} />

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={accept}
                                    style={{
                                        flex: 1, padding: '10px 12px',
                                        borderRadius: '12px', border: 'none', cursor: 'pointer',
                                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                        color: '#ffffff', fontSize: '12px', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        boxShadow: '0 4px 16px rgba(239,68,68,0.25)',
                                        transition: 'all 0.2s', letterSpacing: '0.01em',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.35)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.25)'; }}
                                >
                                    Accept All
                                    <ChevronRight style={{ width: '13px', height: '13px' }} />
                                </button>

                                <button
                                    onClick={decline}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px', cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600,
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
