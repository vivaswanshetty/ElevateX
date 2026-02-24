import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, UserPlus, CheckCircle, Bell, BellOff, Briefcase,
    Trash2, MailCheck, ChevronRight, Clock, Inbox, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import TaskDetailModal from '../components/TaskDetailModal';
import AuthModal from '../components/AuthModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TYPE_CONFIG = {
    follow: { icon: UserPlus, color: 'rgba(96,165,250,0.7)', label: 'Follow' },
    follow_accept: { icon: UserPlus, color: 'rgba(96,165,250,0.7)', label: 'Follow' },
    follow_request: { icon: UserPlus, color: 'rgba(251,146,60,0.7)', label: 'Request' },
    like: { icon: Heart, color: 'rgba(251,113,133,0.7)', label: 'Like' },
    comment: { icon: MessageCircle, color: 'rgba(74,222,128,0.7)', label: 'Comment' },
    task_complete: { icon: CheckCircle, color: 'rgba(250,204,21,0.7)', label: 'Task' },
    task_assign: { icon: CheckCircle, color: 'rgba(250,204,21,0.7)', label: 'Task' },
    task_apply: { icon: Briefcase, color: 'rgba(167,139,250,0.7)', label: 'Task' },
};

const getConfig = (type) => TYPE_CONFIG[type] || { icon: Bell, color: 'rgba(156,163,175,0.6)', label: 'Activity' };

const getActivityMessage = (type) => {
    switch (type) {
        case 'follow': return 'started following you';
        case 'follow_request': return 'requested to follow you';
        case 'follow_accept': return 'accepted your follow request';
        case 'like': return 'liked your post';
        case 'comment': return 'commented on your post';
        case 'task_complete': return 'completed your task';
        case 'task_assign': return 'assigned you to a task';
        case 'task_apply': return 'applied for your task';
        default: return 'interacted with you';
    }
};

// ─── Activity Card ────────────────────────────────────────────────────────────
const ActivityCard = ({ activity, processingRequests, onAccept, onReject, onViewProfile, onViewTask, onViewPost, onMarkRead }) => {
    const cfg = getConfig(activity.type);
    const Icon = cfg.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40, scale: 0.97 }}
            onClick={() => {
                if (!activity.read) onMarkRead(activity._id);
                if (activity.post) onViewPost(activity.post._id || activity.post);
                else if (activity.task) onViewTask(activity.task._id || activity.task);
                else onViewProfile(activity.actor?._id, activity.actor);
            }}
            className="relative group cursor-pointer transition-all duration-200"
            style={{
                background: activity.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                border: activity.read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(251,146,60,0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = activity.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'; }}
        >
            {/* Unread accent */}
            {!activity.read && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl" style={{ background: 'rgba(251,146,60,0.6)' }} />
            )}

            <div className="flex items-start gap-4 p-4">
                {/* Avatar + badge */}
                <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden" style={{ border: `1px solid ${cfg.color}30` }}>
                        {activity.actor?.avatar ? (
                            <img
                                src={activity.actor.avatar}
                                alt={activity.actor.name}
                                className="w-full h-full object-cover"
                                onClick={e => { e.stopPropagation(); onViewProfile(activity.actor?._id, activity.actor); }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `${cfg.color}15` }}>
                                <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#050505', border: `1px solid ${cfg.color}40` }}>
                        <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="font-bold text-white text-sm capitalize transition-colors"
                                style={{ cursor: 'pointer' }}
                                onClick={e => { e.stopPropagation(); onViewProfile(activity.actor?._id, activity.actor); }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(251,146,60,0.8)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'white'; }}
                            >
                                {activity.actor?.name || 'Someone'}
                            </span>
                            <span className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {getActivityMessage(activity.type)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {!activity.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(251,146,60,0.8)' }} />}
                            <span className="text-[11px] flex items-center gap-1 font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(activity.createdAt)}
                            </span>
                        </div>
                    </div>

                    {activity.comment && (
                        <div className="mt-2 px-3 py-2 rounded-xl text-sm italic line-clamp-2 font-light" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                            "{activity.comment}"
                        </div>
                    )}

                    {activity.post && (
                        <button
                            onClick={e => { e.stopPropagation(); onViewPost(activity.post._id || activity.post); }}
                            className="mt-2 text-xs font-semibold flex items-center gap-1 transition-all"
                            style={{ color: 'rgba(251,146,60,0.6)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(251,146,60,0.9)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(251,146,60,0.6)'; }}
                        >
                            View post <ChevronRight className="w-3 h-3" />
                        </button>
                    )}

                    {activity.type === 'follow_request' && (
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                            {processingRequests[activity.actor?._id] === 'accepted' ? (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: 'rgba(74,222,128,0.7)' }}>✓ Accepted</span>
                            ) : processingRequests[activity.actor?._id] === 'rejected' ? (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.60)' }}>Rejected</span>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onAccept(activity.actor?._id)}
                                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                                        style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.25)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => onReject(activity.actor?._id)}
                                        className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    >
                                        Decline
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 transition-colors" style={{ color: 'rgba(255,255,255,0.1)' }} />
            </div>
        </motion.div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Activity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [followRequests, setFollowRequests] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [toast, setToast] = useState(null);
    const [processingRequests, setProcessingRequests] = useState({});
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        fetchActivities();
        if (user.followRequests) setFollowRequests(user.followRequests);
        if (location.state?.restoreUser) {
            setSelectedUser(location.state.restoreUser);
            window.history.replaceState({ ...window.history.state, restoreUser: null }, '');
        }
    }, [user, location.state]);

    const fetchActivities = async () => {
        try {
            const res = await api.get('/activities');
            setActivities(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleViewProfile = async (userId, initialData = null) => {
        if (initialData) setSelectedUser(initialData);
        try {
            const res = await api.get(`/users/${userId}`);
            setSelectedUser(res.data);
        } catch (e) {
            if (e.response?.status === 404) {
                setToast({ type: 'error', message: 'This user has deleted their account' });
                if (initialData) setSelectedUser(null);
            }
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/activities/${id}/read`);
            setActivities(prev => prev.map(a => a._id === id ? { ...a, read: true } : a));
            window.dispatchEvent(new Event('activity-updated'));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/activities/read-all');
            setActivities(prev => prev.map(a => ({ ...a, read: true })));
            window.dispatchEvent(new Event('activity-updated'));
            setToast({ type: 'success', message: 'All marked as read' });
        } catch (e) { console.error(e); }
    };

    const handleClearConfirm = async () => {
        try {
            await api.delete('/activities/clear-all');
            setActivities([]);
            window.dispatchEvent(new Event('activity-updated'));
            setToast({ type: 'success', message: 'Activity history cleared' });
        } catch (e) {
            setToast({ type: 'error', message: 'Failed to clear activities' });
        }
    };

    const handleAcceptRequest = async (requesterId) => {
        try {
            await api.put(`/users/${requesterId}/accept-request`);
            setProcessingRequests(prev => ({ ...prev, [requesterId]: 'accepted' }));
            setToast({ type: 'success', message: 'Follow request accepted!' });
            setTimeout(() => {
                setFollowRequests(prev => prev.filter(r => r._id !== requesterId));
                setActivities(prev => prev.filter(a => !(a.type === 'follow_request' && a.actor?._id === requesterId)));
                fetchActivities();
            }, 1500);
        } catch (e) {
            if (e.response?.status === 404) {
                setToast({ type: 'error', message: 'User not found' });
                setFollowRequests(prev => prev.filter(r => r._id !== requesterId));
            } else {
                setToast({ type: 'error', message: 'Failed to accept request' });
            }
        }
    };

    const handleRejectRequest = async (requesterId) => {
        try {
            await api.put(`/users/${requesterId}/reject-request`);
            setProcessingRequests(prev => ({ ...prev, [requesterId]: 'rejected' }));
            setToast({ type: 'info', message: 'Request declined' });
            setTimeout(() => {
                setFollowRequests(prev => prev.filter(r => r._id !== requesterId));
                setActivities(prev => prev.filter(a => !(a.type === 'follow_request' && a.actor?._id === requesterId)));
            }, 1500);
        } catch (e) {
            setToast({ type: 'error', message: 'Failed to reject request' });
        }
    };

    const filteredActivities = activities.filter(a => {
        if (filter === 'unread') return !a.read;
        if (filter === 'read') return a.read;
        return true;
    });

    const unreadCount = activities.filter(a => !a.read).length;

    // ── Guest ──
    if (!user) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center px-6" style={{ background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
                        <Bell className="w-9 h-9" style={{ color: 'rgba(251,146,60,0.6)' }} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Activity</h2>
                    <p className="text-sm font-light mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>Login to see your notifications, follow requests, and interactions.</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-3.5 text-white font-bold rounded-xl text-sm transition-all"
                        style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}
                    >
                        Login to View Activity
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251,146,60,0.04) 0%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Notifications
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                Activity
                            </h1>
                            <p className="text-sm font-light mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Stay updated with your interactions
                            </p>
                        </div>

                        {activities.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', color: 'rgba(251,146,60,0.7)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.08)'; }}
                                    >
                                        <MailCheck className="w-3.5 h-3.5" />
                                        Mark all read
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black text-white" style={{ background: 'rgba(251,146,60,0.4)' }}>{unreadCount}</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(252,165,165,0.7)'; e.currentTarget.style.borderColor = 'rgba(252,165,165,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">

                {/* ── Follow Requests ── */}
                <AnimatePresence>
                    {followRequests.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mb-8 p-5 rounded-2xl"
                            style={{ background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.15)' }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4" style={{ color: 'rgba(251,146,60,0.6)' }} />
                                <h2 className="font-bold text-white text-xs uppercase tracking-widest">Follow Requests</h2>
                                <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(251,146,60,0.3)' }}>{followRequests.length}</span>
                            </div>
                            <div className="space-y-3">
                                {followRequests.map(req => (
                                    <motion.div
                                        key={req._id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <img
                                            src={req.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(req.name)}`}
                                            className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                                            alt={req.name}
                                            onClick={() => handleViewProfile(req._id, req)}
                                        />
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewProfile(req._id, req)}>
                                            <p className="font-bold text-white text-sm capitalize truncate">{req.name}</p>
                                            <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>wants to follow you</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {processingRequests[req._id] === 'accepted' ? (
                                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: 'rgba(74,222,128,0.7)' }}>✓ Accepted</span>
                                            ) : processingRequests[req._id] === 'rejected' ? (
                                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.60)' }}>Rejected</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleAcceptRequest(req._id)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all" style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.25)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}>Accept</button>
                                                    <button onClick={() => handleRejectRequest(req._id)} className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>Decline</button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Filter Tabs ── */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                        { id: 'all', label: 'All', count: activities.length },
                        { id: 'unread', label: 'Unread', count: unreadCount },
                        { id: 'read', label: 'Read', count: activities.length - unreadCount },
                    ].map(({ id, label, count }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: filter === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                                color: filter === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {label}
                            {count > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black" style={{
                                    background: filter === id && id === 'unread' ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.06)',
                                    color: filter === id && id === 'unread' ? 'white' : 'rgba(255,255,255,0.5)',
                                }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Activity List ── */}
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.length > 0 ? (
                            filteredActivities.map((activity) => (
                                <ActivityCard
                                    key={activity._id}
                                    activity={activity}
                                    processingRequests={processingRequests}
                                    onAccept={handleAcceptRequest}
                                    onReject={handleRejectRequest}
                                    onViewProfile={handleViewProfile}
                                    onViewTask={id => setSelectedTaskId(id)}
                                    onViewPost={id => navigate(`/post/${id}`)}
                                    onMarkRead={markAsRead}
                                />
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    {filter === 'unread' ? <MailCheck className="w-8 h-8" style={{ color: 'rgba(74,222,128,0.4)' }} /> :
                                        filter === 'read' ? <Inbox className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.50)' }} /> :
                                            <BellOff className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.50)' }} />}
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">
                                    {filter === 'unread' ? 'All caught up!' : filter === 'read' ? 'No read notifications' : 'No activity yet'}
                                </h3>
                                <p className="text-sm font-light max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    {filter === 'unread' ? 'You have no unread notifications right now.' :
                                        filter === 'read' ? "Notifications you've read will appear here." :
                                            'When you interact with others, updates will appear here.'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Modals ── */}
            <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearConfirm}
                title="Clear All Activities?"
                message="This action cannot be undone. All your activity history will be permanently deleted."
                confirmText="Yes, Clear All"
                isDestructive={true}
            />
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default Activity;
