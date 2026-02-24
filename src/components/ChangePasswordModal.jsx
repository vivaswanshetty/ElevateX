import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const inputBase = `w-full py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/25`;
const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' };
const inputFocus = { borderColor: 'rgba(239,68,68,0.50)', boxShadow: '0 0 0 3px rgba(239,68,68,0.08)' };

const PasswordField = ({ label, value, onChange, show, onToggle, disabled, placeholder }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`${inputBase} pl-11 pr-11`}
                    style={{ ...inputStyle, ...(focused ? inputFocus : {}) }}
                />
                <button type="button" onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.30)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

const Rule = ({ met, label }) => (
    <div className="flex items-center gap-2 text-xs">
        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${met ? 'bg-emerald-400' : 'bg-white/15'}`} />
        <span className={`transition-colors ${met ? 'text-emerald-400' : ''}`} style={!met ? { color: 'rgba(255,255,255,0.35)' } : {}}>
            {label}
        </span>
    </div>
);

const ChangePasswordModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!currentPassword || !newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
        if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) { setError('Password must contain uppercase, lowercase, and a number'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        onConfirm(currentPassword, newPassword);
    };

    const handleClose = () => {
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setError(''); setShowCurrent(false); setShowNew(false); setShowConfirm(false);
        onClose();
    };

    const rules = [
        { met: newPassword.length >= 6, label: 'At least 6 characters' },
        { met: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
        { met: /[a-z]/.test(newPassword), label: 'One lowercase letter' },
        { met: /\d/.test(newPassword), label: 'One number' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[200]"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    />
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="max-w-md w-full rounded-2xl overflow-hidden"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <Key className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-white">Change Password</h2>
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Update your account password</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} disabled={loading}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                    style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                            className="px-4 py-3 rounded-xl text-sm text-red-400"
                                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <PasswordField
                                    label="Current Password" value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    show={showCurrent} onToggle={() => setShowCurrent(p => !p)}
                                    disabled={loading} placeholder="Enter current password"
                                />

                                <div>
                                    <PasswordField
                                        label="New Password" value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        show={showNew} onToggle={() => setShowNew(p => !p)}
                                        disabled={loading} placeholder="Enter new password"
                                    />
                                    {/* Rules */}
                                    {newPassword && (
                                        <div className="mt-3 space-y-1.5 pl-1">
                                            {rules.map(r => <Rule key={r.label} {...r} />)}
                                        </div>
                                    )}
                                </div>

                                <PasswordField
                                    label="Confirm New Password" value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    show={showConfirm} onToggle={() => setShowConfirm(p => !p)}
                                    disabled={loading} placeholder="Confirm new password"
                                />

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={handleClose} disabled={loading}
                                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 disabled:opacity-50"
                                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.20)' }}>
                                        {loading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                                        ) : (
                                            <><CheckCircle className="w-4 h-4" />Update Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
