import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmed = confirmText.toLowerCase() === 'delete';

    // Prevent body scroll when modal is open
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

    const handleConfirm = () => {
        if (isConfirmed) {
            onConfirm();
        }
    };

    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-white/10"
                        >
                            {/* Header with red accent */}
                            <div className="bg-gradient-to-br from-red-600 to-rose-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Delete Account</h2>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                        <p className="text-red-600 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5" />
                                            Warning: This action is irreversible!
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Deleting your account will permanently remove:
                                        </p>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span className="text-sm">Your profile and personal information</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span className="text-sm">All your tasks and applications</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span className="text-sm">Your transaction history and coins</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span className="text-sm">All associated data (cannot be recovered)</span>
                                        </li>
                                    </ul>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                                            Type <span className="text-red-600 dark:text-red-400">DELETE</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder="Type DELETE"
                                            disabled={loading}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!isConfirmed || loading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                Delete Account
                                            </>
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
