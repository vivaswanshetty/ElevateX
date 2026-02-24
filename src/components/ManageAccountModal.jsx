import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Trash2, Shield, Key, AlertTriangle, Lock, ChevronRight, Mail, User, Calendar } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmModal from './ConfirmModal';

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all
    placeholder:text-white/25`;
const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
};
const inputFocusStyle = { borderColor: 'rgba(239,68,68,0.50)', boxShadow: '0 0 0 3px rgba(239,68,68,0.08)' };

// ── Section header ────────────────────────────────────────────────────────────
const SectionLabel = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {label}
        </span>
    </div>
);

// ── Row ───────────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span className="text-sm font-bold text-white capitalize">{value || '—'}</span>
    </div>
);

const ManageAccountModal = ({ isOpen, onClose, user, onDeleteAccount, onChangePassword, onTogglePrivacy, onChangeEmail, deleteLoading, passwordLoading }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isPrivacyConfirmOpen, setIsPrivacyConfirmOpen] = useState(false);
    const [pendingPrivacyValue, setPendingPrivacyValue] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    useEffect(() => { if (user?.email) setNewEmail(user.email); }, [user]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleDeleteConfirm = async () => { await onDeleteAccount(); setIsDeleteModalOpen(false); };
    const handlePrivacyToggle = (v) => { setPendingPrivacyValue(v); setIsPrivacyConfirmOpen(true); };
    const handlePrivacyConfirm = () => onTogglePrivacy(pendingPrivacyValue);

    const handleEmailSave = async () => {
        if (!newEmail || newEmail === user.email) { setIsEditingEmail(false); return; }
        setEmailLoading(true);
        try { await onChangeEmail(newEmail); setIsEditingEmail(false); }
        catch (e) { console.error('Failed to update email', e); }
        finally { setEmailLoading(false); }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A';

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[150]"
                            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                        />
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                className="max-w-lg w-full rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <Settings className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-white">Manage Account</h2>
                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Configure your account settings</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                        style={{ color: 'rgba(255,255,255,0.40)' }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-7">
                                    {/* ── Account Information ── */}
                                    <div>
                                        <SectionLabel icon={User} label="Account Information" />
                                        <div className="rounded-xl overflow-hidden"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div className="px-4">
                                                <InfoRow label="Username" value={user?.name} />
                                                <InfoRow label="Member Since" value={memberSince} />
                                            </div>

                                            {/* Email row */}
                                            <div className="px-4 py-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</span>
                                                    {!isEditingEmail && (
                                                        <button onClick={() => setIsEditingEmail(true)}
                                                            className="text-xs font-black transition-colors hover:text-white"
                                                            style={{ color: '#ef4444' }}>
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                                {isEditingEmail ? (
                                                    <div className="flex gap-2 mt-1">
                                                        <input
                                                            type="email" value={newEmail}
                                                            onChange={e => setNewEmail(e.target.value)}
                                                            onFocus={() => setEmailFocused(true)}
                                                            onBlur={() => setEmailFocused(false)}
                                                            className={inputCls}
                                                            style={{ ...inputStyle, ...(emailFocused ? inputFocusStyle : {}) }}
                                                        />
                                                        <button onClick={handleEmailSave} disabled={emailLoading}
                                                            className="px-3 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                                                            style={{ background: '#ef4444' }}>
                                                            {emailLoading ? '...' : 'Save'}
                                                        </button>
                                                        <button onClick={() => { setIsEditingEmail(false); setNewEmail(user?.email || ''); }}
                                                            disabled={emailLoading}
                                                            className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/5 disabled:opacity-50"
                                                            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-white">{user?.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Privacy ── */}
                                    <div>
                                        <SectionLabel icon={Lock} label="Privacy" />
                                        <div className="flex items-center justify-between p-4 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-0.5">Private Account</div>
                                                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                    Only approved followers can see your profile
                                                </div>
                                            </div>
                                            {/* Custom toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handlePrivacyToggle(!user?.isPrivate)}
                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0"
                                                style={{
                                                    background: user?.isPrivate ? '#ef4444' : 'rgba(255,255,255,0.12)',
                                                    border: '1px solid rgba(255,255,255,0.10)',
                                                }}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${user?.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Security ── */}
                                    <div>
                                        <SectionLabel icon={Key} label="Security" />
                                        <button
                                            onClick={() => setIsChangePasswordOpen(true)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5 group"
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white">Change Password</div>
                                                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Update your account password</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: 'rgba(255,255,255,0.30)' }} />
                                        </button>
                                    </div>

                                    {/* ── Danger Zone ── */}
                                    <div>
                                        <SectionLabel icon={AlertTriangle} label="Danger Zone" />
                                        <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                            <div className="mb-3">
                                                <h4 className="text-sm font-black text-red-400 mb-1">Delete Account</h4>
                                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                                    Permanently delete your account and all associated data. This cannot be undone.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsDeleteModalOpen(true)}
                                                className="w-full py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                            >
                                                <Trash2 className="w-4 h-4" />
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
                title={pendingPrivacyValue ? 'Make Account Private?' : 'Make Account Public?'}
                message={
                    pendingPrivacyValue
                        ? 'When private, only approved followers can see your posts and profile.'
                        : 'When public, anyone can see your posts and profile without approval.'
                }
                confirmText={pendingPrivacyValue ? 'Make Private' : 'Make Public'}
                isDestructive={false}
            />
        </>
    );
};

export default ManageAccountModal;
