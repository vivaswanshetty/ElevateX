import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register, loginAsGuest } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formKey, setFormKey] = useState(Date.now()); // Key to force form reset

    // Clear form when modal opens or when switching between login/register
    useEffect(() => {
        if (isOpen) {
            // Force complete form reset by changing key
            setFormKey(Date.now());
            setName('');
            setEmail('');
            setPassword('');
            setError('');
            setShowPassword(false);
        }
    }, [isOpen, isLogin]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (password.length < 6) {
                    setError('Password must be at least 6 characters long');
                    setLoading(false);
                    return;
                }
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                    setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
            }
            // Clear form and close
            setName('');
            setEmail('');
            setPassword('');
            setError('');
            onClose();
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        loginAsGuest();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 md:pt-16 p-4 overflow-y-auto" style={{ isolation: 'isolate' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
                        style={{ zIndex: 9998 }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 my-8"
                        style={{
                            zIndex: 9999,
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Decorative background elements - Red/Orange Theme */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center z-[160] rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative mb-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center shadow-lg shadow-red-500/20 border border-gray-200 dark:border-white/10 relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                />

                                <Zap
                                    className="w-10 h-10 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                    style={{
                                        fill: 'url(#auth-metallic-red-gradient)',
                                        color: '#dc2626'
                                    }}
                                />
                                {/* SVG Gradient Definition for the Logo */}
                                <svg width="0" height="0" className="absolute">
                                    <defs>
                                        <linearGradient id="auth-metallic-red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ee0000" />
                                            <stop offset="25%" stopColor="#ff3333" />
                                            <stop offset="50%" stopColor="#ff0000" />
                                            <stop offset="75%" stopColor="#cc0000" />
                                            <stop offset="100%" stopColor="#ee0000" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {isLogin ? 'Welcome Back' : 'Join ElevateX'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isLogin
                                    ? 'Enter your credentials to access your account'
                                    : 'Start your journey with the ultimate task platform'
                                }
                            </p>
                        </div>

                        <form key={formKey} onSubmit={handleSubmit} className="space-y-5 relative" autoComplete="off">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1"
                                    >
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 outline-none input-glow"
                                                required={!isLogin}
                                                minLength={2}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                            At least 2 characters
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 outline-none input-glow"
                                        required
                                    />
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                        Valid email format required
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 outline-none input-glow"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <div className="mt-2 ml-1 space-y-1">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            <span className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                At least 6 characters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                One uppercase letter
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                One lowercase letter
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            <span className={/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                One number
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isLogin && (
                                <div className="text-right">
                                    <Link
                                        to="/forgot-password"
                                        onClick={onClose}
                                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleGuest}
                                    className="w-full py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:scale-[1.01]"
                                >
                                    Continue as Guest
                                </button>

                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
