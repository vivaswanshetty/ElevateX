import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ─── tiny helpers ────────────────────────────────────── */
const has6 = (p) => p.length >= 6;
const hasUC = (p) => /[A-Z]/.test(p);
const hasLC = (p) => /[a-z]/.test(p);
const hasNum = (p) => /\d/.test(p);

const strength = (p) => [has6(p), hasUC(p), hasLC(p), hasNum(p)].filter(Boolean).length;

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

/* ─── Input field wrapper ─────────────────────────────── */
const Field = ({ label, icon: Icon, error, children }) => (
    <div className="space-y-1.5">
        <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
            {label}
        </label>
        <div className="relative group">{children}</div>
        {error && (
            <p style={{ fontSize: '11px', color: '#f87171', paddingLeft: '4px' }}>{error}</p>
        )}
    </div>
);

const inputStyle = {
    width: '100%',
    padding: '12px 44px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
};

/* ─── Main Component ──────────────────────────────────── */
const AuthModal = ({ isOpen, onClose }) => {
    const { login, register, loginAsGuest } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const formKey = useRef(Date.now());

    // reset on open / tab switch
    useEffect(() => {
        if (isOpen) {
            formKey.current = Date.now();
            setName(''); setEmail(''); setPassword('');
            setError(''); setShowPassword(false); setFocusedField(null);
        }
    }, [isOpen, isLogin]);

    // lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!has6(password) || !hasUC(password) || !hasLC(password) || !hasNum(password)) {
                    setError('Password must be ≥6 chars with uppercase, lowercase & number.');
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
            }
            setName(''); setEmail(''); setPassword(''); setError('');
            onClose();
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => { loginAsGuest(); onClose(); };
    const switchMode = () => setIsLogin(v => !v);

    const pw_strength = strength(password);
    const fieldFocus = (name) => ({ onFocus: () => setFocusedField(name), onBlur: () => setFocusedField(null) });
    const dynInput = (field) => ({
        ...inputStyle,
        borderColor: focusedField === field ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)',
        boxShadow: focusedField === field ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
        background: focusedField === field ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
        paddingRight: field === 'password' ? '44px' : '16px',
    });

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 99999, isolation: 'isolate' }}
                >
                    {/* ── Backdrop ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    />

                    {/* ── Modal Card ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 24 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-[420px] overflow-hidden"
                        style={{
                            background: '#0d0d0d',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '24px',
                            boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Ambient orbs ── */}
                        <div style={{
                            position: 'absolute', top: '-80px', right: '-80px',
                            width: '220px', height: '220px',
                            background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
                            pointerEvents: 'none', borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-60px', left: '-60px',
                            width: '180px', height: '180px',
                            background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
                            pointerEvents: 'none', borderRadius: '50%',
                        }} />

                        {/* ── Top red accent bar ── */}
                        <div style={{
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent 0%, #ef4444 40%, #dc2626 60%, transparent 100%)',
                        }} />

                        <div style={{ padding: '32px 32px 28px' }}>

                            {/* ── Close ── */}
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute', top: '20px', right: '20px',
                                    width: '32px', height: '32px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    color: 'rgba(255,255,255,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                            >
                                <X style={{ width: '14px', height: '14px' }} />
                            </button>

                            {/* ── Logo + heading ── */}
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '16px' }}>
                                    {/* outer ring pulse */}
                                    <motion.div
                                        animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.3, 0.15] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            position: 'absolute', inset: '-8px',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
                                        }}
                                    />
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '20px',
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative',
                                    }}>
                                        <Zap
                                            style={{
                                                width: '28px', height: '28px',
                                                color: '#ef4444', fill: '#ef4444',
                                                filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.7))',
                                            }}
                                        />
                                    </div>
                                </div>

                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                                    {isLogin ? 'Welcome back' : 'Join ElevateX'}
                                </h2>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.40)', fontWeight: 400 }}>
                                    {isLogin
                                        ? 'Sign in to your account to continue'
                                        : 'Start your journey on the ultimate task platform'}
                                </p>
                            </div>

                            {/* ── Tab switcher ── */}
                            <div style={{
                                display: 'flex', gap: '4px', padding: '4px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '14px',
                                marginBottom: '24px',
                            }}>
                                {['Sign In', 'Sign Up'].map((label, i) => {
                                    const active = isLogin ? i === 0 : i === 1;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => setIsLogin(i === 0)}
                                            style={{
                                                flex: 1, padding: '9px',
                                                borderRadius: '10px',
                                                fontSize: '13px', fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.25s',
                                                border: 'none',
                                                background: active ? 'rgba(239,68,68,0.15)' : 'transparent',
                                                color: active ? '#ef4444' : 'rgba(255,255,255,0.35)',
                                                boxShadow: active ? 'inset 0 0 0 1px rgba(239,68,68,0.25)' : 'none',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ── Error banner ── */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -8, height: 0 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '12px 14px',
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '12px',
                                            marginBottom: '16px',
                                            fontSize: '12px', color: '#fca5a5',
                                        }}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Form ── */}
                            <form key={formKey.current} onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Name field (register only) */}
                                <AnimatePresence>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Field label="Full Name">
                                                <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: focusedField === 'name' ? '#ef4444' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Your full name"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    style={dynInput('name')}
                                                    required={!isLogin}
                                                    minLength={2}
                                                    {...fieldFocus('name')}
                                                />
                                            </Field>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email */}
                                <Field label="Email Address">
                                    <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: focusedField === 'email' ? '#ef4444' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={dynInput('email')}
                                        required
                                        {...fieldFocus('email')}
                                    />
                                </Field>

                                {/* Password */}
                                <Field label="Password">
                                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: focusedField === 'password' ? '#ef4444' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={dynInput('password')}
                                        required
                                        {...fieldFocus('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{
                                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                                            color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                    >
                                        {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                                    </button>

                                    {/* Password strength bar (register only) */}
                                    <AnimatePresence>
                                        {!isLogin && password.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                style={{ marginTop: '10px' }}
                                            >
                                                {/* 4-segment bar */}
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} style={{
                                                            flex: 1, height: '3px', borderRadius: '2px',
                                                            background: i <= pw_strength ? STRENGTH_COLOR[pw_strength] : 'rgba(255,255,255,0.08)',
                                                            transition: 'background 0.3s',
                                                        }} />
                                                    ))}
                                                </div>
                                                {/* Checklist */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                                                    {[
                                                        { check: has6(password), label: '6+ characters' },
                                                        { check: hasUC(password), label: 'Uppercase' },
                                                        { check: hasLC(password), label: 'Lowercase' },
                                                        { check: hasNum(password), label: 'Number' },
                                                    ].map(({ check, label }) => (
                                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <div style={{
                                                                width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                                                                background: check ? '#22c55e' : 'rgba(255,255,255,0.15)',
                                                                transition: 'background 0.2s',
                                                            }} />
                                                            <span style={{ fontSize: '10px', color: check ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
                                                                {label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Field>

                                {/* Forgot password */}
                                <AnimatePresence>
                                    {isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ textAlign: 'right', marginTop: '-8px' }}
                                        >
                                            <Link
                                                to="/forgot-password"
                                                onClick={onClose}
                                                style={{ fontSize: '12px', color: 'rgba(239,68,68,0.7)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
                                            >
                                                Forgot password?
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={!loading ? { scale: 1.015 } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                    style={{
                                        width: '100%', padding: '14px',
                                        background: loading
                                            ? 'rgba(239,68,68,0.3)'
                                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: '#ffffff',
                                        fontSize: '14px', fontWeight: 700,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: loading ? 'none' : '0 4px 24px rgba(239,68,68,0.3)',
                                        transition: 'box-shadow 0.2s, background 0.2s',
                                        letterSpacing: '0.02em',
                                        marginTop: '4px',
                                    }}
                                >
                                    {loading ? (
                                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    ) : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <ArrowRight style={{ width: '16px', height: '16px' }} />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* ── Divider ── */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.06em' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            </div>

                            {/* ── Guest button ── */}
                            <button
                                onClick={handleGuest}
                                style={{
                                    width: '100%', padding: '13px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '14px',
                                    color: 'rgba(255,255,255,0.45)',
                                    fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                            >
                                <Shield style={{ width: '14px', height: '14px' }} />
                                Continue as Guest
                            </button>

                            {/* ── Switch mode ── */}
                            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    onClick={switchMode}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#ef4444', fontWeight: 700, cursor: 'pointer',
                                        fontSize: '13px', transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                                >
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AuthModal;
