import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Trash2, Shield, Key, AlertTriangle, Lock } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmModal from './ConfirmModal';

const ManageAccountModal = ({ isOpen, onClose, user, onDeleteAccount, onChangePassword, onTogglePrivacy, onChangeEmail, deleteLoading, passwordLoading }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isPrivacyConfirmOpen, setIsPrivacyConfirmOpen] = useState(false);
    const [pendingPrivacyValue, setPendingPrivacyValue] = useState(false);

    // Email Edit State
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    useEffect(() => {
        if (user?.email) {
            setNewEmail(user.email);
        }
    }, [user]);

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

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        await onDeleteAccount();
        setIsDeleteModalOpen(false);
    };

    const handlePrivacyToggle = (newValue) => {
        setPendingPrivacyValue(newValue);
        setIsPrivacyConfirmOpen(true);
    };

    const handlePrivacyConfirm = () => {
        onTogglePrivacy(pendingPrivacyValue);
    };

    const handleEmailSave = async () => {
        if (!newEmail || newEmail === user.email) {
            setIsEditingEmail(false);
            return;
        }

        setEmailLoading(true);
        try {
            await onChangeEmail(newEmail);
            setIsEditingEmail(false);
        } catch (error) {
            console.error("Failed to update email", error);
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                        />
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sticky top-0 z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                <Settings className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Manage Account</h2>
                                                <p className="text-white/80 text-sm">Configure your account settings</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Account Information */}
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                        {/* ... existing account info ... */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Account Information</h3>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/10 last:border-0 sticky top-0">
                                                <span className="text-gray-600 dark:text-gray-400">Username:</span>
                                                <span className="font-medium text-gray-900 dark:text-white capitalize">{user?.name}</span>
                                            </div>

                                            <div className="py-2 border-b border-gray-200 dark:border-white/10">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                                    {!isEditingEmail && (
                                                        <button
                                                            onClick={() => setIsEditingEmail(true)}
                                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                                {isEditingEmail ? (
                                                    <div className="flex gap-2 mt-2">
                                                        <input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                        <button
                                                            onClick={handleEmailSave}
                                                            disabled={emailLoading}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {emailLoading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingEmail(false);
                                                                setNewEmail(user?.email || '');
                                                            }}
                                                            disabled={emailLoading}
                                                            className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-gray-900 dark:text-white block">{user?.email}</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {user?.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Privacy Settings */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Privacy</h3>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">Private Account</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Only people you approve can see your photos and videos.
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={user?.isPrivate || false}
                                                    onChange={(e) => handlePrivacyToggle(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Security Settings */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Security</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <button
                                                className="w-full p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-left transition-all group"
                                                onClick={() => setIsChangePasswordOpen(true)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            Change Password
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Update your account password
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-400 dark:text-gray-500">→</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Danger Zone</h3>
                                        </div>
                                        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                            <div className="mb-3">
                                                <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">Delete Account</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Permanently delete your account and all associated data. This action cannot be undone.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleDeleteClick}
                                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Delete My Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                onConfirm={onChangePassword}
                loading={passwordLoading}
            />

            <ConfirmModal
                isOpen={isPrivacyConfirmOpen}
                onClose={() => setIsPrivacyConfirmOpen(false)}
                onConfirm={handlePrivacyConfirm}
                title={pendingPrivacyValue ? '🔒 Make Account Private?' : '🌐 Make Account Public?'}
                message={
                    pendingPrivacyValue
                        ? 'When your account is private, only people you approve can see your posts and profile. New followers will need to send a request.'
                        : 'When your account is public, anyone can see your posts and profile without needing approval to follow you.'
                }
                confirmText={pendingPrivacyValue ? 'Make Private' : 'Make Public'}
                isDestructive={false}
            />
        </>
    );
};

export default ManageAccountModal;
