import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const [focused, setFocused] = useState(false);
    const isConfirmed = confirmText.toLowerCase() === 'delete';

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => { setConfirmText(''); onClose(); };

    const consequences = [
        'Your profile and personal information',
        'All your tasks and applications',
        'Your transaction history and coins',
        'All associated data (cannot be recovered)',
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[200]"
                        style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
                    />
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="max-w-md w-full rounded-2xl overflow-hidden"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(239,68,68,0.20)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5"
                                style={{ borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-white">Delete Account</h2>
                                        <p className="text-xs text-red-400/70">This action is permanent and irreversible</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} disabled={loading}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                    style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Warning box */}
                                <div className="p-4 rounded-xl space-y-3"
                                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <p className="text-xs font-black uppercase tracking-widest text-red-400">
                                        The following will be permanently deleted:
                                    </p>
                                    <ul className="space-y-2">
                                        {consequences.map(c => (
                                            <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                                <span className="text-red-500 mt-0.5 flex-shrink-0">×</span>
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Confirm input */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                        Type <span className="text-red-400">DELETE</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        placeholder="Type DELETE"
                                        disabled={loading}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 disabled:opacity-50"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${focused ? 'rgba(239,68,68,0.50)' : 'rgba(255,255,255,0.10)'}`,
                                            boxShadow: focused ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button onClick={handleClose} disabled={loading}
                                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 disabled:opacity-50"
                                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => isConfirmed && onConfirm()}
                                        disabled={!isConfirmed || loading}
                                        className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{ background: isConfirmed ? '#ef4444' : 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.30)' }}>
                                        {loading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                                        ) : (
                                            <><Trash2 className="w-4 h-4" />Delete Account</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DeleteAccountModal;
