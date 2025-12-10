import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Edit2, Camera, MapPin, Link as LinkIcon, Briefcase, GraduationCap, Github, Linkedin, Twitter, Globe, Award, Coins, Layers, Calendar, Settings, Heart, MessageCircle, Trash2, Code, Sparkles, Zap, Coffee, Music, Sun, Cloud, Flag, Bookmark, Compass, Rocket, Smile, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { changePassword as apiChangePassword } from '../api/auth';
import AuthModal from '../components/AuthModal';
import EditProfileModal from '../components/EditProfileModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ManageAccountModal from '../components/ManageAccountModal';
import UserListModal from '../components/UserListModal';
import UserProfileModal from '../components/UserProfileModal';
import api from '../api/axios';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
    const { currentUser, getUserProfile, updateUser, deleteAccount } = useAuth();
    const { tasks } = useData();
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
    const [listModal, setListModal] = useState({
        isOpen: false,
        title: '',
        users: [],
        loading: false
    });
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });
    const [myPosts, setMyPosts] = useState([]);
    const [myInteractions, setMyInteractions] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingInteractions, setLoadingInteractions] = useState(false);
    const user = getUserProfile();

    // Read tab from URL on mount or when location changes
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['overview', 'tasks', 'posts', 'interactions'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        } else if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [searchParams, location.state]);

    // Scroll to post if returning from SinglePost
    useEffect(() => {
        const scrollToPostId = searchParams.get('scrollTo');

        if (scrollToPostId && activeTab && !loadingPosts && !loadingInteractions) {
            // Wait for the DOM to update with the posts
            const scrollTimeout = setTimeout(() => {
                const element = document.getElementById(`post-${scrollToPostId}`);

                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Remove scrollTo param after successful scroll
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

    // Update URL when tab changes
    useEffect(() => {
        const currentScrollTo = searchParams.get('scrollTo');
        const newParams = new URLSearchParams();

        if (activeTab !== 'overview') {
            newParams.set('tab', activeTab);
        }

        // Preserve scrollTo parameter if it exists
        if (currentScrollTo) {
            newParams.set('scrollTo', currentScrollTo);
        }

        setSearchParams(newParams, { replace: true });
    }, [activeTab, searchParams, setSearchParams]);

    useEffect(() => {
        if (activeTab === 'posts') fetchMyPosts();
        if (activeTab === 'interactions') fetchMyInteractions();
    }, [activeTab]);

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Please login to view your profile</h2>
                <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold transition-transform hover:scale-105">
                    Login
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                updateUser(currentUser.name, { avatar: ev.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (updatedData) => {
        updateUser(currentUser.name, updatedData);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            setIsManageAccountOpen(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to delete account", error);
            alert("Failed to delete account. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChangePassword = async (currentPassword, newPassword) => {
        setIsChangingPassword(true);
        try {
            await apiChangePassword(currentPassword, newPassword);
            showToast('success', '🔒 Password updated successfully! Your account is now more secure.');
            setIsManageAccountOpen(false);
        } catch (error) {
            console.error("Failed to change password", error);
            showToast('error', error.response?.data?.message || "Failed to change password. Please try again.");
            throw error; // Re-throw to keep modal open
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleChangeEmail = async (newEmail) => {
        try {
            await updateUser(currentUser.name, { email: newEmail });
            showToast('success', '📧 Email updated successfully!');
        } catch (error) {
            console.error("Failed to update email", error);
            showToast('error', error.response?.data?.message || "Failed to update email.");
            throw error;
        }
    };

    const SocialIcon = ({ platform }) => {
        switch (platform) {
            case 'github': return <Github className="w-5 h-5" />;
            case 'linkedin': return <Linkedin className="w-5 h-5" />;
            case 'twitter': return <Twitter className="w-5 h-5" />;
            default: return <Globe className="w-5 h-5" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const handlePrivacyToggle = async (isPrivate) => {
        try {
            await updateUser(currentUser.name, { isPrivate });
        } catch (error) {
            console.error("Failed to update privacy settings", error);
            alert("Failed to update privacy settings. Please try again.");
        }
    };



    const fetchMyPosts = async () => {
        if (!currentUser) return;
        setLoadingPosts(true);
        try {
            const response = await api.get(`/posts/user/${currentUser._id}`);
            setMyPosts(response.data);
        } catch (error) {
            console.error('Error fetching my posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchMyInteractions = async () => {
        if (!currentUser) return;
        setLoadingInteractions(true);
        try {
            const response = await api.get('/posts/interactions');
            setMyInteractions(response.data);
        } catch (error) {
            console.error('Error fetching interactions:', error);
        } finally {
            setLoadingInteractions(false);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await api.put(`/posts/${postId}/like`);
            // Update both lists
            setMyPosts(prev => prev.map(p => p._id === postId ? response.data : p));
            setMyInteractions(prev => {
                // If unliked and it was only in interactions because of like, remove it?
                // For simplicity, just update the post data. 
                // If the user unlikes, it should probably disappear from "Interactions" if they also didn't comment.
                // But for now, let's just update the data.
                return prev.map(p => p._id === postId ? response.data : p);
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const handleDeletePost = (postId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/posts/${postId}`);
                    setMyPosts(prev => prev.filter(p => p._id !== postId));
                    showToast('cleared', 'Post deleted successfully');
                } catch (error) {
                    console.error('Error deleting post:', error);
                    showToast('error', 'Failed to delete post');
                }
            }
        });
    };

    const handleDeleteComment = (postId, commentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
                    setMyInteractions(prev => prev.map(p => p._id === postId ? response.data : p));
                    setMyPosts(prev => prev.map(p => p._id === postId ? response.data : p));
                    showToast('cleared', 'Comment deleted successfully');
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    showToast('error', 'Failed to delete comment');
                }
            }
        });
    };

    const fetchList = async (type) => {
        if (!currentUser) return;
        setListModal({ isOpen: true, title: type === 'followers' ? 'Followers' : 'Following', users: [], loading: true });
        try {
            const response = await api.get(`/users/${currentUser._id}/${type}`);
            setListModal(prev => ({ ...prev, users: response.data, loading: false }));
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            setListModal(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-20">
            {/* Banner Section */}
            <div className="pt-32 pb-40 min-h-[350px] bg-gradient-to-r from-red-700 via-rose-600 to-orange-600 relative overflow-hidden flex items-center justify-center">
                {/* Animated Background Graphics */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            x: [0, 50, 0],
                            y: [0, 30, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500/30 to-transparent rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [0, -60, 0],
                            x: [0, -30, 0],
                            y: [0, 50, 0]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 to-transparent rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            y: [0, -40, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
                    />
                </div>

                {/* Doodle Pattern Overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { Icon: Code, top: '10%', left: '10%' },
                        { Icon: Sparkles, top: '20%', left: '80%' },
                        { Icon: Zap, top: '60%', left: '15%' },
                        { Icon: Coffee, top: '80%', left: '70%' },
                        { Icon: Music, top: '15%', left: '40%' },
                        { Icon: Sun, top: '75%', left: '30%' },
                        { Icon: Cloud, top: '30%', left: '60%' },
                        { Icon: Flag, top: '50%', left: '90%' },
                        { Icon: Bookmark, top: '40%', left: '5%' },
                        { Icon: Compass, top: '85%', left: '50%' },
                        { Icon: Rocket, top: '5%', left: '90%' },
                        { Icon: Smile, top: '90%', left: '10%' },
                        { Icon: Cpu, top: '45%', left: '75%' },
                        { Icon: Globe, top: '25%', left: '25%' },
                        { Icon: Layers, top: '55%', left: '40%' },
                    ].map(({ Icon, top, left }, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/40"
                            style={{ top, left }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.4, 0.8, 0.4],
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        >
                            <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
                        </motion.div>
                    ))}
                </div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="container mx-auto px-6 -mt-32 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid lg:grid-cols-12 gap-8"
                >
                    {/* Left Sidebar */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-[#111] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6 group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.name}
                                        className="relative w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-gray-200 dark:bg-gray-800"
                                    />
                                    <label className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-lg z-10">
                                        <Camera className="w-4 h-4 text-white" />
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>

                                <h2 className="text-2xl font-bold mb-1 capitalize text-gray-900 dark:text-white">{user.name}</h2>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                                        Level {Math.floor((user.xp || 0) / 500) + 1}
                                    </span>
                                </div>

                                {user.bio && (
                                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">{user.bio}</p>
                                )}

                                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                    <div
                                        onClick={() => navigate('/leaderboard')}
                                        className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:scale-105 transition-transform"
                                    >
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.xp || 0}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">XP Earned</div>
                                    </div>
                                    <div
                                        onClick={() => navigate('/wallet')}
                                        className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:scale-105 transition-transform"
                                    >
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.coins || 0}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Coins</div>
                                    </div>
                                </div>

                                {/* Social Stats */}
                                <div className="flex gap-6 mb-6 justify-center text-sm">
                                    <button
                                        onClick={() => fetchList('followers')}
                                        className="text-center hover:opacity-70 transition-opacity"
                                    >
                                        <span className="font-bold text-gray-900 dark:text-white block text-lg">{user.followers?.length || 0}</span>
                                        <span className="text-gray-500 dark:text-gray-400">Followers</span>
                                    </button>
                                    <button
                                        onClick={() => fetchList('following')}
                                        className="text-center hover:opacity-70 transition-opacity"
                                    >
                                        <span className="font-bold text-gray-900 dark:text-white block text-lg">{user.following?.length || 0}</span>
                                        <span className="text-gray-500 dark:text-gray-400">Following</span>
                                    </button>
                                </div>

                                <div className="space-y-3 w-full">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-full py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-900 dark:text-white transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Edit Profile
                                    </button>

                                    <button
                                        onClick={() => setIsManageAccountOpen(true)}
                                        className="w-full py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" /> Manage Account
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {user.socials && Object.values(user.socials).some(v => v) && (
                            <div className="bg-white dark:bg-[#111] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-white/10">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <LinkIcon className="w-4 h-4 text-indigo-500" /> Socials
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(user.socials).map(([platform, url]) => {
                                        if (!url) return null;
                                        return (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white border border-gray-200 dark:border-white/5"
                                                title={platform}
                                            >
                                                <SocialIcon platform={platform} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Content */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Link to="/leaderboard" className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer group">
                                <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                                    <Award className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor((user.xp || 0) / 500) + 1}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-yellow-500 transition-colors">Current Level</div>
                                </div>
                            </Link>
                            <Link to="/explore" className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer group">
                                <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                    <Layers className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{myTasks.length}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-indigo-500 transition-colors">Tasks Posted</div>
                                </div>
                            </Link>
                            <Link to="/wallet" className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer group">
                                <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                    <Coins className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.coins || 0}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-green-500 transition-colors">Total Earnings</div>
                                </div>
                            </Link>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden min-h-[400px]">
                            <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto">
                                {['overview', 'tasks', 'posts', 'interactions'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 px-4 text-sm font-bold text-center transition-colors relative capitalize whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-white" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-8"
                                        >
                                            {/* Work Experience */}
                                            <div>
                                                <h3 className="font-bold mb-6 flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                                                    <Briefcase className="w-5 h-5 text-indigo-500" /> Work Experience
                                                </h3>
                                                {user.work?.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {user.work.map((job) => (
                                                            <div key={job.id} className="relative pl-6 border-l-2 border-gray-200 dark:border-white/10 group">
                                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#111] border-2 border-indigo-500 group-hover:scale-125 transition-transform"></div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{job.role}</h4>
                                                                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 font-medium">{job.company}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" /> {job.duration}
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                                        No work experience added yet.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Education */}
                                            <div>
                                                <h3 className="font-bold mb-6 flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                                                    <GraduationCap className="w-5 h-5 text-indigo-500" /> Education
                                                </h3>
                                                {user.education?.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {user.education.map((edu) => (
                                                            <div key={edu.id} className="relative pl-6 border-l-2 border-gray-200 dark:border-white/10 group">
                                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#111] border-2 border-indigo-500 group-hover:scale-125 transition-transform"></div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{edu.degree}</h4>
                                                                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 font-medium">{edu.school}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" /> {edu.year}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                                        No education details added yet.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'tasks' && (
                                        <motion.div
                                            key="tasks"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            {myTasks.length === 0 ? (
                                                <div className="text-center text-gray-500 dark:text-gray-400 py-10">No tasks posted yet</div>
                                            ) : (
                                                myTasks.map(task => (
                                                    <div
                                                        key={task._id}
                                                        onClick={() => setSelectedTaskId(task._id)}
                                                        className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">{task.category} • {task.sub}</div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.status === 'open' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                                task.status === 'completed' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                                    'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                                                }`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                                            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                                                                <Coins className="w-4 h-4 text-yellow-500" /> {task.coins}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'posts' && (
                                        <motion.div
                                            key="posts"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {loadingPosts ? (
                                                <div className="text-center py-10">Loading posts...</div>
                                            ) : myPosts.length === 0 ? (
                                                <div className="text-center text-gray-500 dark:text-gray-400 py-10">No posts yet</div>
                                            ) : (
                                                myPosts.map(post => (
                                                    <div
                                                        id={`post-${post._id}`}
                                                        key={post._id}
                                                        onClick={() => navigate(`/post/${post._id}`, { state: { from: 'profile', activeTab, postId: post._id } })}
                                                        className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`} className="w-10 h-10 rounded-full object-cover" />
                                                                <div>
                                                                    <div className="font-bold dark:text-white">{post.author?.name}</div>
                                                                    <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeletePost(post._id);
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        <p className="mb-4 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                                                        {post.image && (
                                                            <img src={post.image} alt="Post" className="w-full rounded-lg mb-4 max-h-80 object-cover" />
                                                        )}
                                                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <Heart className="w-4 h-4" /> {post.likes?.length || 0}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'interactions' && (
                                        <motion.div
                                            key="interactions"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {loadingInteractions ? (
                                                <div className="text-center py-10">Loading interactions...</div>
                                            ) : myInteractions.length === 0 ? (
                                                <div className="text-center text-gray-500 dark:text-gray-400 py-10">No interactions yet</div>
                                            ) : (
                                                myInteractions.map(post => (
                                                    <div
                                                        id={`post-${post._id}`}
                                                        key={post._id}
                                                        onClick={() => navigate(`/post/${post._id}`, { state: { from: 'profile', activeTab, postId: post._id } })}
                                                        className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all"
                                                    >
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`} className="w-10 h-10 rounded-full object-cover" />
                                                            <div>
                                                                <div className="font-bold dark:text-white">{post.author?.name}</div>
                                                                <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <p className="mb-4 dark:text-gray-300 line-clamp-2">{post.content}</p>

                                                        <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-3">
                                                            {post.likes?.includes(currentUser._id) && (
                                                                <div className="flex items-center justify-between text-sm bg-white dark:bg-black/20 p-3 rounded-lg">
                                                                    <span className="flex items-center gap-2 text-red-500 font-medium">
                                                                        <Heart className="w-4 h-4 fill-current" /> You liked this post
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleLikePost(post._id);
                                                                        }}
                                                                        className="text-gray-500 hover:text-red-500 text-xs font-bold uppercase"
                                                                    >
                                                                        Unlike
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {(post.comments || []).filter(c => c?.user?._id === currentUser?._id).map(comment => (
                                                                <div key={comment._id} className="flex items-center justify-between bg-white dark:bg-black/20 p-3 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageCircle className="w-4 h-4 text-gray-400" />
                                                                        <span className="dark:text-gray-300 text-sm">{comment.text}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteComment(post._id, comment._id);
                                                                        }}
                                                                        className="text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
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
                    </motion.div>
                </motion.div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={handleSaveProfile}
            />

            <ManageAccountModal
                isOpen={isManageAccountOpen}
                onClose={() => setIsManageAccountOpen(false)}
                user={user}
                onDeleteAccount={handleDeleteAccount}
                onChangePassword={handleChangePassword}
                onTogglePrivacy={handlePrivacyToggle}
                onChangeEmail={handleChangeEmail}
                deleteLoading={isDeleting}
                passwordLoading={isChangingPassword}
            />

            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

            <UserListModal
                isOpen={listModal.isOpen}
                onClose={() => setListModal(prev => ({ ...prev, isOpen: false }))}
                title={listModal.title}
                users={listModal.users}
                loading={listModal.loading}
                onUserClick={(user) => setSelectedUser(user)}
            />

            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onFollowChange={() => {
                        // Refresh current user profile if needed, or just let the modal handle its own state
                        getUserProfile();
                    }}
                />
            )}

            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDestructive={confirmModal.isDestructive}
            />
        </div>
    );
};

export default Profile;
