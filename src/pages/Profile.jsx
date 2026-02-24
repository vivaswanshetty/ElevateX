import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Edit2, Camera, Link as LinkIcon, Briefcase, GraduationCap, Github, Linkedin, Twitter, Globe, Award, Coins, Layers, Calendar, Settings, Heart, MessageCircle, Trash2, Bookmark, ImageIcon, Users, TrendingUp, Crown, Share2, BadgeCheck, Zap, Star, Trophy, Wallet, LayoutGrid, ArrowUpRight, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { changePassword as apiChangePassword } from '../api/auth';
import AuthModal from '../components/AuthModal';
import EditProfileModal from '../components/EditProfileModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ManageAccountModal from '../components/ManageAccountModal';
import UserListModal from '../components/UserListModal';
import UserProfileModal from '../components/UserProfileModal';
import EditTaskModal from '../components/EditTaskModal';
import api from '../api/axios';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const getLevelTitle = (level) => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Achiever';
    if (level < 35) return 'Expert';
    if (level < 50) return 'Master';
    return 'Legend';
};

const getLevelColor = (level) => {
    if (level < 5) return 'from-gray-400 to-gray-500';
    if (level < 10) return 'from-green-400 to-emerald-500';
    if (level < 20) return 'from-blue-400 to-indigo-500';
    if (level < 35) return 'from-purple-400 to-violet-500';
    if (level < 50) return 'from-orange-400 to-amber-500';
    return 'from-yellow-400 to-orange-500';
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return `${baseUrl.replace('/api', '')}${path}`;
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Thin divider
const HR = () => <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />;

const Profile = () => {
    const { currentUser, getUserProfile, updateUser, deleteAccount } = useAuth();
    const { tasks, deleteTask, loading } = useData();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isManageAccountOpen, setIsManageAccountOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [listModal, setListModal] = useState({ isOpen: false, title: '', users: [], loading: false });
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, isDestructive: false });
    const [myPosts, setMyPosts] = useState([]);
    const [myInteractions, setMyInteractions] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingInteractions, setLoadingInteractions] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [bannerUrl, setBannerUrl] = useState(null);
    const bannerInputRef = useRef();
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    const user = getUserProfile();

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['overview', 'tasks', 'posts', 'saved', 'interactions'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        } else if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        const savedBanner = localStorage.getItem(`profile_banner_${currentUser?._id}`);
        if (savedBanner) setBannerUrl(savedBanner);
    }, [searchParams, location.state]);

    useEffect(() => {
        const scrollToPostId = searchParams.get('scrollTo');
        if (scrollToPostId && activeTab && !loadingPosts && !loadingInteractions) {
            const scrollTimeout = setTimeout(() => {
                const element = document.getElementById(`post-${scrollToPostId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('scrollTo');
                        setSearchParams(newParams, { replace: true });
                    }, 500);
                }
            }, 300);
            return () => clearTimeout(scrollTimeout);
        }
    }, [searchParams, activeTab, loadingPosts, loadingInteractions, myPosts.length, myInteractions.length, setSearchParams]);

    useEffect(() => {
        const currentScrollTo = searchParams.get('scrollTo');
        const newParams = new URLSearchParams();
        if (activeTab !== 'overview') newParams.set('tab', activeTab);
        if (currentScrollTo) newParams.set('scrollTo', currentScrollTo);
        setSearchParams(newParams, { replace: true });
    }, [activeTab, searchParams, setSearchParams]);

    useEffect(() => {
        if (activeTab === 'posts') fetchMyPosts();
        if (activeTab === 'interactions') fetchMyInteractions();
        if (activeTab === 'saved') fetchSavedPosts();
    }, [activeTab]);

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#050505' }}>
                <p className="text-white font-bold text-xl">Please log in to view your profile</p>
                <button onClick={() => setShowAuth(true)}
                    className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.25)' }}>
                    Log In
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </div>
        );
    }

    const myTasks = tasks ? tasks.filter(t => {
        if (!t || !currentUser) return false;
        const creatorId = t.createdBy?._id || t.createdBy;
        return String(creatorId) === String(currentUser._id);
    }) : [];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { updateUser(currentUser.name, { avatar: ev.target.result }); };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (updatedData) => { updateUser(currentUser.name, updatedData); };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try { await deleteAccount(); setIsManageAccountOpen(false); navigate('/'); }
        catch (error) { console.error('Failed to delete account', error); alert('Failed to delete account.'); }
        finally { setIsDeleting(false); }
    };

    const handleChangePassword = async (currentPassword, newPassword) => {
        setIsChangingPassword(true);
        try {
            await apiChangePassword(currentPassword, newPassword);
            showToast('success', 'Password updated successfully!');
            setIsManageAccountOpen(false);
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to change password.');
            throw error;
        } finally { setIsChangingPassword(false); }
    };

    const handleChangeEmail = async (newEmail) => {
        try { await updateUser(currentUser.name, { email: newEmail }); showToast('success', 'Email updated!'); }
        catch (error) { showToast('error', error.response?.data?.message || 'Failed to update email.'); throw error; }
    };

    const SocialIcon = ({ platform }) => {
        switch (platform) {
            case 'github': return <Github className="w-4 h-4" />;
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            case 'twitter': return <Twitter className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const handlePrivacyToggle = async (isPrivate) => {
        try { await updateUser(currentUser.name, { isPrivate }); }
        catch (error) { console.error('Failed to update privacy', error); }
    };

    const fetchMyPosts = async () => {
        if (!currentUser) return;
        setLoadingPosts(true);
        try { const r = await api.get(`/posts/user/${currentUser._id}`); setMyPosts(r.data); }
        catch (e) { console.error(e); } finally { setLoadingPosts(false); }
    };

    const fetchMyInteractions = async () => {
        if (!currentUser) return;
        setLoadingInteractions(true);
        try { const r = await api.get('/posts/interactions'); setMyInteractions(r.data); }
        catch (e) { console.error(e); } finally { setLoadingInteractions(false); }
    };

    const fetchSavedPosts = async () => {
        if (!currentUser) return;
        setLoadingSaved(true);
        try {
            const saved = JSON.parse(localStorage.getItem(`saved_posts_${currentUser._id}`) || '[]');
            if (saved.length > 0) {
                const results = await Promise.allSettled(saved.map(id => api.get(`/posts/${id}`)));
                setSavedPosts(results.filter(r => r.status === 'fulfilled').map(r => r.value.data));
            } else { setSavedPosts([]); }
        } catch (e) { console.error(e); } finally { setLoadingSaved(false); }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setBannerUrl(ev.target.result); localStorage.setItem(`profile_banner_${currentUser._id}`, ev.target.result); };
        reader.readAsDataURL(file);
    };

    const handleLikePost = async (postId) => {
        try {
            const r = await api.put(`/posts/${postId}/like`);
            setMyPosts(prev => prev.map(p => p._id === postId ? r.data : p));
            setMyInteractions(prev => prev.map(p => p._id === postId ? r.data : p));
        } catch (e) { console.error(e); }
    };

    const showToast = (type, message) => setToast({ type, message });

    const handleDeletePost = (postId) => {
        setConfirmModal({
            isOpen: true, title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete', isDestructive: true,
            onConfirm: async () => {
                try { await api.delete(`/posts/${postId}`); setMyPosts(prev => prev.filter(p => p._id !== postId)); showToast('cleared', 'Post deleted'); }
                catch (e) { showToast('error', 'Failed to delete post'); }
            }
        });
    };

    const handleDeleteComment = (postId, commentId) => {
        setConfirmModal({
            isOpen: true, title: 'Delete Comment', message: 'Delete this comment?',
            confirmText: 'Delete', isDestructive: true,
            onConfirm: async () => {
                try {
                    const r = await api.delete(`/posts/${postId}/comment/${commentId}`);
                    setMyInteractions(prev => prev.map(p => p._id === postId ? r.data : p));
                    setMyPosts(prev => prev.map(p => p._id === postId ? r.data : p));
                    showToast('cleared', 'Comment deleted');
                } catch (e) { showToast('error', 'Failed to delete comment'); }
            }
        });
    };

    const fetchList = async (type) => {
        if (!currentUser) return;
        setListModal({ isOpen: true, title: type === 'followers' ? 'Followers' : 'Following', users: [], loading: true });
        try {
            const r = await api.get(`/users/${currentUser._id}/${type}`);
            setListModal(prev => ({ ...prev, users: r.data, loading: false }));
        } catch (e) { setListModal(prev => ({ ...prev, loading: false })); }
    };

    const handleEditTask = (e, task) => { e.stopPropagation(); setTaskToEdit(task); setIsEditTaskOpen(true); };

    const handleDeleteTask = (e, taskId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true, title: 'Delete Task',
            message: 'Delete this task? Coins locked in escrow will be refunded to your wallet.',
            confirmText: 'Delete Task', isDestructive: true,
            onConfirm: async () => {
                try { await deleteTask(taskId); showToast('cleared', 'Task deleted'); }
                catch (e) { showToast('error', e || 'Failed to delete task'); }
            }
        });
    };

    const level = Math.floor((user?.xp || 0) / 500) + 1;
    const levelTitle = getLevelTitle(level);
    const xpInLevel = (user?.xp || 0) % 500;
    const xpProgress = (xpInLevel / 500) * 100;

    const subPlan = user.subscription?.plan || 'free';
    const isPremium = subPlan === 'pro' || subPlan === 'elite';

    // ── Tab config ──
    const TABS = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'tasks', label: 'Tasks', icon: Layers },
        { id: 'posts', label: 'Posts', icon: ImageIcon },
        { id: 'saved', label: 'Saved', icon: Bookmark },
        { id: 'interactions', label: 'Activity', icon: Heart },
    ];

    // ── Stat cards ──
    const STATS = [
        { label: 'Level', value: level, sub: levelTitle, to: '/leaderboard', icon: Trophy, accent: '#f59e0b', glow: 'rgba(245,158,11,0.12)' },
        { label: 'Tasks Posted', value: myTasks.length, sub: 'all time', to: '/explore', icon: LayoutGrid, accent: '#818cf8', glow: 'rgba(129,140,248,0.12)' },
        { label: 'Coins', value: user.coins || 0, sub: 'balance', to: '/wallet', icon: Coins, accent: '#34d399', glow: 'rgba(52,211,153,0.12)' },
        { label: 'Plan', value: subPlan.charAt(0).toUpperCase() + subPlan.slice(1), sub: isPremium ? 'Active' : 'Upgrade', to: '/subscription', icon: Crown, accent: isPremium ? '#ef4444' : 'rgba(255,255,255,0.35)', glow: isPremium ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)' },
    ];

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>
            <EditTaskModal isOpen={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} task={taskToEdit} />

            {/* ── Banner ── */}
            <div className="pt-16 h-[220px] relative overflow-hidden group">
                {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0d0d0d 0%, #111 50%, #0a0a0a 100%)' }}>
                        {/* Subtle red radial glow — matches app aesthetic */}
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(239,68,68,0.07) 0%, transparent 70%)' }} />
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    </div>
                )}
                {/* Banner upload */}
                <label className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white"
                    style={{ background: 'rgba(0,0,0,0.60)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
                    <ImageIcon className="w-3.5 h-3.5" /> Change Banner
                    <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                </label>
                <div className="h-[220px]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-12 gap-6">

                    {/* ── Left Sidebar ── */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Profile card */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="p-6 flex flex-col items-center text-center">

                                {/* Avatar */}
                                <div className="relative mb-5 group/av">
                                    <div className="w-28 h-28 rounded-full overflow-hidden"
                                        style={{ border: '2px solid rgba(239,68,68,0.35)', boxShadow: '0 0 0 4px rgba(239,68,68,0.07)' }}>
                                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                            alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                                        style={{ background: '#ef4444', border: '2px solid #050505' }}>
                                        <Camera className="w-3.5 h-3.5 text-white" />
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>

                                {/* Name + badges */}
                                <h2 className="text-xl font-black text-white capitalize mb-2">{user.name}</h2>
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                                    {/* Level badge */}
                                    <span className="px-2.5 py-1 rounded-full text-xs font-black"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }}>
                                        Lv {level} · {levelTitle}
                                    </span>
                                    {/* Plan badge */}
                                    <Link to="/subscription"
                                        className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 transition-all hover:scale-105"
                                        style={isPremium
                                            ? { background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' }
                                        }>
                                        <Crown className="w-3 h-3" />
                                        {subPlan === 'pro' ? 'Pro' : subPlan === 'elite' ? 'Elite' : 'Free'}
                                    </Link>
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>{user.bio}</p>
                                )}

                                <HR />

                                {/* XP progress */}
                                <div className="w-full mt-5 mb-5">
                                    <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                        <span>{xpInLevel} XP</span>
                                        <span>500 XP to Lv {level + 1}</span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
                                    </div>
                                </div>

                                <HR />

                                {/* Followers / Following */}
                                <div className="flex gap-8 my-5">
                                    <button onClick={() => fetchList('followers')} className="text-center group/fl">
                                        <span className="block text-xl font-black text-white group-hover/fl:text-red-400 transition-colors">{user.followers?.length || 0}</span>
                                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Followers</span>
                                    </button>
                                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }} />
                                    <button onClick={() => fetchList('following')} className="text-center group/fw">
                                        <span className="block text-xl font-black text-white group-hover/fw:text-red-400 transition-colors">{user.following?.length || 0}</span>
                                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Following</span>
                                    </button>
                                </div>

                                <HR />

                                {/* Action buttons */}
                                <div className="w-full space-y-2 mt-5">
                                    <button onClick={() => setIsEditModalOpen(true)}
                                        className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.20)' }}>
                                        <Edit2 className="w-4 h-4" /> Edit Profile
                                    </button>
                                    <button onClick={() => setIsManageAccountOpen(true)}
                                        className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 flex items-center justify-center gap-2"
                                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.60)' }}>
                                        <Settings className="w-4 h-4" /> Manage Account
                                    </button>
                                    <button onClick={() => navigate('/chat-settings')}
                                        className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 flex items-center justify-center gap-2"
                                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.60)' }}>
                                        <MessageCircle className="w-4 h-4" /> Chat Settings
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social links */}
                        {user.socials && Object.values(user.socials).some(v => v) && (
                            <div className="rounded-2xl p-5" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>Links</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(user.socials).map(([platform, url]) => {
                                        if (!url) return null;
                                        return (
                                            <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                                                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}
                                                title={platform}>
                                                <SocialIcon platform={platform} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Content ── */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {STATS.map(({ label, value, sub, to, icon: Icon, accent, glow }) => (
                                <Link key={label} to={to}
                                    className="p-4 rounded-2xl flex flex-col gap-3 transition-all hover:scale-[1.03] group relative overflow-hidden"
                                    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}40`}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                                    {/* Glow blob on hover */}
                                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                                        style={{ background: glow }} />
                                    {/* Icon box */}
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: glow, border: `1px solid ${accent}25` }}>
                                        <Icon className="w-4 h-4" style={{ color: accent }} />
                                    </div>
                                    {/* Value */}
                                    <div>
                                        <div className="text-2xl font-black text-white leading-none mb-1">{value}</div>
                                        <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.40)' }}>{label}</div>
                                    </div>
                                    {/* Sub + arrow */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</span>
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Tabs + content */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {/* Tab bar */}
                            <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {TABS.map(({ id, label, icon: Icon }) => (
                                    <button key={id} onClick={() => setActiveTab(id)}
                                        className="flex-1 py-4 px-3 text-xs font-bold text-center transition-colors relative whitespace-nowrap flex flex-col items-center gap-1.5 min-w-[80px]"
                                        style={{ color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                                        <Icon className="w-4 h-4" />
                                        {label}
                                        {activeTab === id && (
                                            <motion.div layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-px"
                                                style={{ background: '#ef4444' }} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab content */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">

                                    {/* ── Overview ── */}
                                    {activeTab === 'overview' && (
                                        <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">

                                            {/* Work Experience */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-5">
                                                    <Briefcase className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
                                                    <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Work Experience</h3>
                                                </div>
                                                {user.work?.length > 0 ? (
                                                    <div className="space-y-5">
                                                        {user.work.map((job) => (
                                                            <div key={job.id} className="relative pl-5"
                                                                style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                                                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full"
                                                                    style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />
                                                                <h4 className="font-black text-white">{job.role}</h4>
                                                                <p className="text-sm font-semibold mt-0.5" style={{ color: '#ef4444' }}>{job.company}</p>
                                                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                    <Calendar className="w-3 h-3" /> {job.duration}
                                                                </p>
                                                                {job.desc && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>{job.desc}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-8 text-center rounded-xl text-sm" style={{ border: '1px dashed rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}>
                                                        No work experience added yet.
                                                    </div>
                                                )}
                                            </div>

                                            <HR />

                                            {/* Education */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-5">
                                                    <GraduationCap className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
                                                    <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Education</h3>
                                                </div>
                                                {user.education?.length > 0 ? (
                                                    <div className="space-y-5">
                                                        {user.education.map((edu) => (
                                                            <div key={edu.id} className="relative pl-5"
                                                                style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                                                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full"
                                                                    style={{ background: 'rgba(255,255,255,0.25)' }} />
                                                                <h4 className="font-black text-white">{edu.degree}</h4>
                                                                <p className="text-sm font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{edu.school}</p>
                                                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                    <Calendar className="w-3 h-3" /> {edu.year}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-8 text-center rounded-xl text-sm" style={{ border: '1px dashed rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}>
                                                        No education details added yet.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Relics */}
                                            {user.relics?.length > 0 && (
                                                <>
                                                    <HR />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-5">
                                                            <Star className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
                                                            <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>Relics</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {user.relics.map((relic, i) => (
                                                                <div key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.60)' }}>
                                                                    {relic.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── Tasks ── */}
                                    {activeTab === 'tasks' && (
                                        <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                                            {loading ? (
                                                <div className="py-10 text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>Loading tasks…</div>
                                            ) : myTasks.length === 0 ? (
                                                <div className="py-16 text-center">
                                                    <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No tasks posted yet</p>
                                                </div>
                                            ) : (
                                                myTasks.map(task => (
                                                    <div key={task._id} onClick={() => setSelectedTaskId(task._id)}
                                                        className="p-4 rounded-xl cursor-pointer transition-all group hover:bg-white/[0.02]"
                                                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-black text-white group-hover:text-red-400 transition-colors">{task.title}</h4>
                                                                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{task.category} · {task.sub}</p>
                                                            </div>
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-black capitalize"
                                                                style={{
                                                                    background: task.status === 'open' ? 'rgba(34,197,94,0.10)' : task.status === 'completed' ? 'rgba(59,130,246,0.10)' : 'rgba(250,204,21,0.10)',
                                                                    color: task.status === 'open' ? '#4ade80' : task.status === 'completed' ? '#60a5fa' : '#fbbf24',
                                                                    border: `1px solid ${task.status === 'open' ? 'rgba(34,197,94,0.20)' : task.status === 'completed' ? 'rgba(59,130,246,0.20)' : 'rgba(250,204,21,0.20)'}`,
                                                                }}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{new Date(task.createdAt).toLocaleDateString()}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center gap-1 text-sm font-black text-white">
                                                                    <Coins className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} /> {task.coins}
                                                                </span>
                                                                <button onClick={(e) => handleEditTask(e, task)}
                                                                    className="px-2.5 py-1 text-xs font-bold rounded-lg transition-colors hover:bg-white/10"
                                                                    style={{ color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                                <button onClick={(e) => handleDeleteTask(e, task._id)}
                                                                    className="px-2.5 py-1 text-xs font-bold rounded-lg transition-colors hover:bg-red-500/10"
                                                                    style={{ color: 'rgba(239,68,68,0.60)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── Posts ── */}
                                    {activeTab === 'posts' && (
                                        <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                            {loadingPosts ? (
                                                <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}</div>
                                            ) : myPosts.length === 0 ? (
                                                <div className="py-16 text-center">
                                                    <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
                                                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>No posts yet</p>
                                                    <button onClick={() => navigate('/feed')}
                                                        className="px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
                                                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                                                        Create your first post
                                                    </button>
                                                </div>
                                            ) : (
                                                myPosts.map(post => (
                                                    <div id={`post-${post._id}`} key={post._id}
                                                        className="rounded-xl overflow-hidden transition-all"
                                                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                                            <div className="flex items-center gap-3">
                                                                <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                                                                    className="w-8 h-8 rounded-full object-cover" alt="" style={{ border: '1px solid rgba(255,255,255,0.10)' }} />
                                                                <div>
                                                                    <p className="font-bold text-sm text-white capitalize">{post.author?.name}</p>
                                                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTimeAgo(post.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}
                                                                className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                                                                style={{ color: 'rgba(255,255,255,0.30)' }}
                                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {post.content && <p className="px-4 pb-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{post.content}</p>}
                                                        {post.image && (
                                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                {post.image.match(/\.(mp4|webm|ogg)$/i)
                                                                    ? <video src={getImageUrl(post.image)} controls className="w-full max-h-72 object-cover" />
                                                                    : <img src={getImageUrl(post.image)} alt="Post" className="w-full max-h-72 object-cover" />}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <button onClick={() => handleLikePost(post._id)}
                                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                                                style={{ color: post.likes?.includes(currentUser._id) ? '#ef4444' : 'rgba(255,255,255,0.35)' }}>
                                                                <Heart className={`w-4 h-4 ${post.likes?.includes(currentUser._id) ? 'fill-red-500' : ''}`} />
                                                                {post.likes?.length || 0}
                                                            </button>
                                                            <button onClick={() => navigate('/feed', { state: { highlightPost: post._id } })}
                                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                                                style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0}
                                                            </button>
                                                            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/feed?postId=${post._id}`); showToast('success', 'Link copied!'); }}
                                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                                                style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                <Share2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── Saved ── */}
                                    {activeTab === 'saved' && (
                                        <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                            {loadingSaved ? (
                                                <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}</div>
                                            ) : savedPosts.length === 0 ? (
                                                <div className="py-16 text-center">
                                                    <Bookmark className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
                                                    <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.30)' }}>No saved posts yet</p>
                                                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.20)' }}>Bookmark posts from the feed to see them here</p>
                                                    <button onClick={() => navigate('/feed')}
                                                        className="px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
                                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                        Browse Feed
                                                    </button>
                                                </div>
                                            ) : (
                                                savedPosts.map(post => (
                                                    <div key={post._id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                                            <div className="flex items-center gap-3">
                                                                <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                                                                    className="w-8 h-8 rounded-full object-cover" alt="" />
                                                                <div>
                                                                    <p className="font-bold text-sm text-white capitalize">{post.author?.name}</p>
                                                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTimeAgo(post.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => {
                                                                const saved = JSON.parse(localStorage.getItem(`saved_posts_${currentUser._id}`) || '[]');
                                                                localStorage.setItem(`saved_posts_${currentUser._id}`, JSON.stringify(saved.filter(id => id !== post._id)));
                                                                setSavedPosts(prev => prev.filter(p => p._id !== post._id));
                                                                showToast('success', 'Removed from saved');
                                                            }} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}
                                                                title="Remove from saved">
                                                                <Bookmark className="w-4 h-4 fill-current" />
                                                            </button>
                                                        </div>
                                                        {post.content && <p className="px-4 pb-3 text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.70)' }}>{post.content}</p>}
                                                        {post.image && <img src={getImageUrl(post.image)} alt="Post" className="w-full max-h-48 object-cover" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />}
                                                        <div className="flex items-center gap-4 px-4 py-2.5 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                                                            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes?.length || 0}</span>
                                                            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments?.length || 0}</span>
                                                            <button onClick={() => navigate(`/feed?postId=${post._id}`)}
                                                                className="ml-auto font-bold transition-colors hover:text-white">
                                                                View in Feed →
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── Interactions ── */}
                                    {activeTab === 'interactions' && (
                                        <motion.div key="interactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                            {loadingInteractions ? (
                                                <div className="py-10 text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>Loading…</div>
                                            ) : myInteractions.length === 0 ? (
                                                <div className="py-16 text-center">
                                                    <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.12)' }} />
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No interactions yet</p>
                                                </div>
                                            ) : (
                                                myInteractions.map(post => (
                                                    <div id={`post-${post._id}`} key={post._id}
                                                        onClick={() => navigate(`/post/${post._id}`, { state: { from: 'profile', activeTab, postId: post._id } })}
                                                        className="rounded-xl p-5 cursor-pointer transition-all hover:bg-white/[0.02]"
                                                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                                                                className="w-9 h-9 rounded-full object-cover" alt="" style={{ border: '1px solid rgba(255,255,255,0.10)' }} />
                                                            <div>
                                                                <p className="font-bold text-sm text-white">{post.author?.name}</p>
                                                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{post.content}</p>
                                                        <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                            {post.likes?.includes(currentUser._id) && (
                                                                <div className="flex items-center justify-between text-sm p-2.5 rounded-lg"
                                                                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                                                    <span className="flex items-center gap-2 text-xs font-bold" style={{ color: '#f87171' }}>
                                                                        <Heart className="w-3.5 h-3.5 fill-current" /> You liked this
                                                                    </span>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleLikePost(post._id); }}
                                                                        className="text-xs font-bold transition-colors hover:text-white"
                                                                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                        Unlike
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {(post.comments || []).filter(c => c?.user?._id === currentUser?._id).map(comment => (
                                                                <div key={comment._id} className="flex items-center justify-between p-2.5 rounded-lg"
                                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageCircle className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                                                                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{comment.text}</span>
                                                                    </div>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteComment(post._id, comment._id); }}
                                                                        className="transition-colors hover:text-red-400"
                                                                        style={{ color: 'rgba(255,255,255,0.25)' }}>
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Modals ── */}
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
            <ManageAccountModal isOpen={isManageAccountOpen} onClose={() => setIsManageAccountOpen(false)} user={user}
                onDeleteAccount={handleDeleteAccount} onChangePassword={handleChangePassword}
                onTogglePrivacy={handlePrivacyToggle} onChangeEmail={handleChangeEmail}
                deleteLoading={isDeleting} passwordLoading={isChangingPassword} />
            {selectedTaskId && <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
            <UserListModal isOpen={listModal.isOpen} onClose={() => setListModal(prev => ({ ...prev, isOpen: false }))}
                title={listModal.title} users={listModal.users} loading={listModal.loading}
                onUserClick={(user) => setSelectedUser(user)} />
            {selectedUser && (
                <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)}
                    onFollowChange={() => getUserProfile()} />
            )}
            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message}
                confirmText={confirmModal.confirmText} isDestructive={confirmModal.isDestructive} />
        </div>
    );
};

export default Profile;
