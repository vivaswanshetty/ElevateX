import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Bell, Shield, Save, Check, Eye, EyeOff, Clock, CheckCheck, Palette, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

// ─── Wallpaper definitions ────────────────────────────────────────────────────
export const WALLPAPERS = {
    default: {
        label: 'Default',
        preview: 'bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20',
        chatBg: 'bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20',
        color: '#818cf8'
    },
    midnight: {
        label: 'Midnight',
        preview: 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900',
        chatBg: 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900',
        color: '#334155'
    },
    ocean: {
        label: 'Ocean',
        preview: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
        chatBg: 'bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-indigo-600/30 dark:from-cyan-900/40 dark:via-blue-900/40 dark:to-indigo-900/40',
        color: '#0ea5e9'
    },
    sunset: {
        label: 'Sunset',
        preview: 'bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600',
        chatBg: 'bg-gradient-to-br from-orange-400/30 via-rose-500/30 to-pink-600/30 dark:from-orange-900/40 dark:via-rose-900/40 dark:to-pink-900/40',
        color: '#f97316'
    },
    forest: {
        label: 'Forest',
        preview: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
        chatBg: 'bg-gradient-to-br from-emerald-400/30 via-green-500/30 to-teal-600/30 dark:from-emerald-900/40 dark:via-green-900/40 dark:to-teal-900/40',
        color: '#10b981'
    },
    galaxy: {
        label: 'Galaxy',
        preview: 'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800',
        chatBg: 'bg-gradient-to-br from-violet-600/30 via-purple-700/30 to-indigo-800/30 dark:from-violet-900/50 dark:via-purple-900/50 dark:to-indigo-900/50',
        color: '#7c3aed'
    },
    rose: {
        label: 'Rose',
        preview: 'bg-gradient-to-br from-pink-300 via-rose-400 to-red-500',
        chatBg: 'bg-gradient-to-br from-pink-300/30 via-rose-400/30 to-red-500/30 dark:from-pink-900/40 dark:via-rose-900/40 dark:to-red-900/40',
        color: '#f43f5e'
    },
    sand: {
        label: 'Sand',
        preview: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-300',
        chatBg: 'bg-gradient-to-br from-yellow-200/40 via-amber-300/40 to-orange-300/40 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-orange-900/30',
        color: '#f59e0b'
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none flex-shrink-0"
        style={{
            background: enabled ? '#ef4444' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.10)',
        }}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const SelectInput = ({ value, onChange, options }) => {
    const [focused, setFocused] = useState(false);
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block w-full rounded-xl py-2 pl-3 pr-8 text-sm text-white outline-none transition-all appearance-none"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${focused ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.10)'}`,
                boxShadow: focused ? '0 0 0 3px rgba(239,68,68,0.07)' : 'none',
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#111] text-white">{opt.label}</option>
            ))}
        </select>
    );
};

// ─── Wallpaper picker ─────────────────────────────────────────────────────────
const WallpaperPicker = ({ value, onChange }) => (
    <div className="grid grid-cols-4 gap-2.5 mt-4">
        {Object.entries(WALLPAPERS).map(([key, wp]) => (
            <button
                key={key}
                onClick={() => onChange(key)}
                className="relative h-14 rounded-xl overflow-hidden transition-all hover:scale-105"
                style={{
                    border: value === key ? `2px solid ${wp.color}` : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: value === key ? `0 0 12px ${wp.color}40` : 'none',
                }}
            >
                <div className={`absolute inset-0 ${wp.preview}`} />
                {value === key && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.30)' }}>
                        <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                )}
                <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold text-white drop-shadow">
                    {wp.label}
                </span>
            </button>
        ))}
    </div>
);

// ─── Live chat preview ────────────────────────────────────────────────────────
const ChatPreview = ({ wallpaper, readReceipts }) => {
    const wp = WALLPAPERS[wallpaper] || WALLPAPERS.default;
    return (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* fake header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex-shrink-0" />
                <div>
                    <div className="text-sm font-bold text-white">Alex Johnson</div>
                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Preview</div>
                </div>
            </div>
            {/* fake messages */}
            <div className={`p-4 space-y-3 min-h-[130px] ${wp.chatBg}`}>
                <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%]"
                        style={{ background: 'rgba(0,0,0,0.60)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
                        <p className="text-sm text-white">Hey! How are you? 👋</p>
                        <p className="text-[10px] text-right mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>10:30 AM</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%]"
                        style={{ background: 'rgba(42,42,42,0.90)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                        <p className="text-sm text-white">I'm great, thanks! 🔥</p>
                        <div className="text-[10px] text-right mt-0.5 flex items-center justify-end gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            10:31 AM
                            {readReceipts && <CheckCheck className="w-3 h-3 inline" style={{ color: '#ef4444' }} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
    >
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-black text-white">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
    </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ChatSettings = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [saved, setSaved] = useState(false);

    const defaultSettings = {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        showOnlineStatus: true,
        readReceipts: true,
        messageNotifications: true,
        groupNotifications: true,
        mediaAutoDownload: 'wifi',
        chatWallpaper: 'default'
    };

    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        if (user?.chatSettings) setSettings(prev => ({ ...prev, ...user.chatSettings }));
    }, [user]);

    const updateSetting = (key, value) => { setSettings(prev => ({ ...prev, [key]: value })); setSaved(false); };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUser(user.name, { chatSettings: settings });
            setSaved(true);
            setToast({ type: 'success', message: 'Chat settings saved successfully.' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to save settings. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const privacyItems = [
        {
            id: 'lastSeen', label: 'Last Seen', icon: Clock,
            description: 'Control who can see when you were last active',
            type: 'select',
            options: [{ value: 'everyone', label: 'Everyone' }, { value: 'contacts', label: 'My Contacts' }, { value: 'nobody', label: 'Nobody' }]
        },
        {
            id: 'profilePhoto', label: 'Profile Photo Visibility', icon: Eye,
            description: 'Control who can see your profile picture',
            type: 'select',
            options: [{ value: 'everyone', label: 'Everyone' }, { value: 'contacts', label: 'My Contacts' }, { value: 'nobody', label: 'Nobody' }]
        },
        { id: 'showOnlineStatus', label: 'Online Status', icon: Eye, description: 'Show others when you are active', type: 'toggle' },
        { id: 'readReceipts', label: 'Read Receipts', icon: CheckCheck, description: "Show double ticks when you've read a message", type: 'toggle' },
    ];

    const notifItems = [
        { id: 'messageNotifications', label: 'Message Notifications', icon: Bell, description: 'Get notified when you receive new messages', type: 'toggle' },
        { id: 'groupNotifications', label: 'Group Notifications', icon: Bell, description: 'Get notified for group messages', type: 'toggle' },
    ];

    const storageItems = [
        {
            id: 'mediaAutoDownload', label: 'Media Auto-Download', icon: Database,
            description: 'Automatically download photos and videos',
            type: 'select',
            options: [{ value: 'always', label: 'Always (Mobile & Wi-Fi)' }, { value: 'wifi', label: 'Wi-Fi Only' }, { value: 'never', label: 'Never' }]
        }
    ];

    const SettingRow = ({ item }) => (
        <div className="flex items-center justify-between gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.30)' }} />
                <div>
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.description}</div>
                </div>
            </div>
            <div className="flex-shrink-0">
                {item.type === 'toggle' ? (
                    <Toggle enabled={settings[item.id]} onChange={val => updateSetting(item.id, val)} />
                ) : (
                    <div className="w-40">
                        <SelectInput value={settings[item.id]} onChange={val => updateSetting(item.id, val)} options={item.options} />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-24 pt-24 px-4 sm:px-6 lg:px-8" style={{ background: '#050505' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/5"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Chat Settings</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Customize your messaging experience</p>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {/* ── Wallpaper ── */}
                    <SectionCard icon={Palette} title="Chat Wallpaper" delay={0}>
                        <ChatPreview wallpaper={settings.chatWallpaper} readReceipts={settings.readReceipts} />
                        <WallpaperPicker value={settings.chatWallpaper} onChange={v => updateSetting('chatWallpaper', v)} />
                    </SectionCard>

                    {/* ── Privacy ── */}
                    <SectionCard icon={Shield} title="Privacy" delay={0.05}>
                        <div className="-mt-2">
                            {privacyItems.map(item => <SettingRow key={item.id} item={item} />)}
                        </div>
                    </SectionCard>

                    {/* ── Notifications ── */}
                    <SectionCard icon={Bell} title="Notifications" delay={0.10}>
                        <div className="-mt-2">
                            {notifItems.map(item => <SettingRow key={item.id} item={item} />)}
                        </div>
                    </SectionCard>

                    {/* ── Data & Storage ── */}
                    <SectionCard icon={Database} title="Data & Storage" delay={0.15}>
                        <div className="-mt-2">
                            {storageItems.map(item => <SettingRow key={item.id} item={item} />)}
                        </div>
                    </SectionCard>

                    {/* Save button */}
                    <div className="flex justify-end pt-2 pb-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-3 rounded-xl text-sm font-black text-white flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={saved
                                ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.20)' }
                                : { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.20)' }
                            }
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                            ) : saved ? (
                                <><Check className="w-4 h-4" />Saved!</>
                            ) : (
                                <><Save className="w-4 h-4" />Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ChatSettings;
