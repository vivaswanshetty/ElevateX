import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserMinus, Briefcase, Linkedin, Twitter, Github, ExternalLink, TrendingUp, Award, MessageSquare, Clock, MapPin, Calendar, Star, Zap, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserListModal from './UserListModal';
import Toast from './Toast';

const UserProfileModal = ({ user: initialUser, onClose, onFollowChange }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(initialUser);
    const [listModal, setListModal] = useState({
        isOpen: false,
        title: '',
        users: [],
        loading: false
    });
    const [isRequested, setIsRequested] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);

            // Check if we've already sent a follow request to this user
            if (currentUser && initialUser.isPrivate && initialUser.followRequests) {
                const hasPendingRequest = initialUser.followRequests.includes(currentUser._id);
                setIsRequested(hasPendingRequest);
            } else {
                setIsRequested(false);
            }

            // Fetch full details if needed (e.g. if stats are missing)
            if (!initialUser.followers || !initialUser.following) {
                fetchFullUserProfile(initialUser._id);
            }
        }
    }, [initialUser, currentUser]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (initialUser && user) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [initialUser, user]);

    const fetchFullUserProfile = async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            setUser(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error fetching full user profile:', error);
        }
    };

    const handleClose = () => {
        setUser(null);
        onClose();
    };

    const calculateLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

    const isFollowing = (targetUser) => {
        if (!currentUser || !targetUser.followers) return false;
        return targetUser.followers.includes(currentUser._id);
    };

    const handleFollow = async () => {
        if (!currentUser) {
            setToast({ type: 'warning', message: 'Please login to follow users' });
            return;
        }

        try {
            await api.put(`/users/${user._id}/follow`);

            if (user.isPrivate) {
                setIsRequested(true);
                // Add current user to followRequests array
                setUser(prev => ({
                    ...prev,
                    followRequests: [...(prev.followRequests || []), currentUser._id]
                }));
                setToast({ type: 'info', message: 'Follow request sent!' });
            } else {
                // Update local state immediately
                setUser(prev => ({
                    ...prev,
                    followers: [...(prev.followers || []), currentUser._id]
                }));
                setToast({ type: 'success', message: `You are now following ${user.name}` });
            }

            if (onFollowChange) onFollowChange();
        } catch (error) {
            console.error('Error following user:', error);
            setToast({ type: 'error', message: error.response?.data?.message || 'Failed to follow user' });
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser) return;

        try {
            // Update UI immediately for better UX
            const wasRequested = isRequested;
            setIsRequested(false);

            await api.put(`/users/${user._id}/unfollow`);

            // Update local state
            setUser(prev => ({
                ...prev,
                followers: (prev.followers || []).filter(id => id !== currentUser._id),
                // Also remove from followRequests if it was a request withdrawal
                followRequests: wasRequested
                    ? (prev.followRequests || []).filter(id => id !== currentUser._id)
                    : prev.followRequests
            }));

            if (wasRequested) {
                setToast({ type: 'info', message: 'Follow request withdrawn' });
            } else {
                setToast({ type: 'info', message: `You unfollowed ${user.name}` });
            }

            if (onFollowChange) onFollowChange();
        } catch (error) {
            console.error('Error unfollowing user:', error);
            // Revert state on error
            setIsRequested(true);
            setToast({ type: 'error', message: error.response?.data?.message || 'Failed to unfollow user' });
        }
    };

    const fetchList = async (type) => {
        setListModal({ isOpen: true, title: type === 'followers' ? 'Followers' : 'Following', users: [], loading: true });
        try {
            const response = await api.get(`/users/${user._id}/${type}`);
            setListModal(prev => ({ ...prev, users: response.data, loading: false }));
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            setListModal(prev => ({ ...prev, loading: false }));
        }
    };

    const getSocialIcon = (platform) => {
        switch (platform) {
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            case 'twitter': return <Twitter className="w-4 h-4" />;
            case 'github': return <Github className="w-4 h-4" />;
            default: return <ExternalLink className="w-4 h-4" />;
        }
    };

    return (
        <>
            <AnimatePresence>
                {user && initialUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#0A0A0A] rounded-3xl max-w-xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-white/10"
                        >
                            {/* Enhanced Header with animated gradient - reduced height */}
                            <div className="relative h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-t-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                {/* Animated blob - positioned away from close button */}
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-all hover:scale-110 z-10 cursor-pointer"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Profile Content */}
                            <div className="px-4 sm:px-6 md:px-8 pb-8 relative">
                                {/* Avatar - positioned separately for better mobile */}
                                <div className="flex justify-center -mt-16 mb-4 relative z-10">
                                    <div className="relative group flex-shrink-0">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=256&bold=true`}
                                            alt={user.name}
                                            className="w-28 h-28 rounded-3xl border-4 border-white dark:border-[#0A0A0A] object-cover shadow-2xl transition-transform group-hover:scale-105 bg-gradient-to-br from-yellow-400 to-orange-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f59e0b&color=fff&size=256&bold=true`;
                                            }}
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-2 shadow-lg">
                                            <Star className="w-4 h-4 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Card */}
                                <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-white/10 shadow-xl mb-4">
                                    {/* Name and Email */}
                                    <div className="text-center mb-4">
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white capitalize mb-1 flex items-center justify-center gap-2 flex-wrap">
                                            <span>{user.name}</span>
                                            {user.isPrivate && (
                                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                                                    Private
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm break-all">{user.email}</p>
                                    </div>

                                    {/* Location if available */}
                                    {user.location && (
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}

                                    {/* Follower counts */}
                                    <div className="flex justify-center gap-6 text-sm mb-4">
                                        <button
                                            onClick={() => fetchList('followers')}
                                            className="hover:opacity-70 transition-opacity text-center group"
                                        >
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors block">{user.followers?.length || 0}</span>
                                            <span className="text-gray-600 dark:text-gray-400">Followers</span>
                                        </button>
                                        <button
                                            onClick={() => fetchList('following')}
                                            className="hover:opacity-70 transition-opacity text-center group"
                                        >
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors block">{user.following?.length || 0}</span>
                                            <span className="text-gray-600 dark:text-gray-400">Following</span>
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    {currentUser && currentUser._id !== user._id && (
                                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    navigate('/chat', { state: { user: user } });
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 hover:scale-105 active:scale-95 whitespace-nowrap"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Message
                                            </button>
                                            <button
                                                onClick={() => isFollowing(user) ? handleUnfollow() : (isRequested ? handleUnfollow() : handleFollow())}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${isFollowing(user) || isRequested
                                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/50'
                                                    }`}
                                            >
                                                {isFollowing(user) ? (
                                                    <>
                                                        <UserMinus className="w-4 h-4" />
                                                        Unfollow
                                                    </>
                                                ) : isRequested ? (
                                                    <>
                                                        <Clock className="w-4 h-4" />
                                                        Requested
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" />
                                                        Follow
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                                    >
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">About</h3>
                                        <p className="text-gray-900 dark:text-white leading-relaxed">{user.bio}</p>
                                    </motion.div>
                                )}

                                {/* Enhanced Stats Grid - now clickable */}
                                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            // Save current modal state to history before navigating
                                            window.history.replaceState({ ...window.history.state, restoreUser: user }, '');
                                            navigate('/leaderboard');
                                        }}
                                        className="text-center p-4 md:p-5 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className="p-2 bg-yellow-500/20 dark:bg-yellow-500/30 rounded-xl">
                                                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{calculateLevel(user.xp)}</p>
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Level</p>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            // Save current modal state to history before navigating
                                            window.history.replaceState({ ...window.history.state, restoreUser: user }, '');
                                            navigate('/leaderboard');
                                        }}
                                        className="text-center p-4 md:p-5 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className="p-2 bg-orange-500/20 dark:bg-orange-500/30 rounded-xl">
                                                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user.xp || 0}</p>
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">XP</p>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            // Save current modal state to history before navigating
                                            window.history.replaceState({ ...window.history.state, restoreUser: user }, '');
                                            navigate('/wallet');
                                        }}
                                        className="text-center p-4 md:p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className="p-2 bg-amber-500/20 dark:bg-amber-500/30 rounded-xl">
                                                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user.coins || 0}</p>
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Coins</p>
                                    </motion.button>
                                </div>

                                {/* Work Experience */}
                                {user.work && user.work.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mb-6"
                                    >
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                            <Briefcase className="w-4 h-4" />
                                            Work Experience
                                        </h3>
                                        <div className="space-y-3">
                                            {user.work.map((job, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    whileHover={{ x: 5, scale: 1.02 }}
                                                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30 hover:border-blue-400 dark:hover:border-blue-600/50 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex-shrink-0">
                                                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{job.title}</h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">{job.company}</p>
                                                            {job.role && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                                                    {job.role}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                                {job.duration && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {job.duration}
                                                                    </p>
                                                                )}
                                                                {job.location && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {job.location}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Education */}
                                {user.education && user.education.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="mb-6"
                                    >
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                            <GraduationCap className="w-4 h-4" />
                                            Education
                                        </h3>
                                        <div className="space-y-3">
                                            {user.education.map((edu, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.15 + index * 0.05 }}
                                                    whileHover={{ x: 5, scale: 1.02 }}
                                                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border border-purple-200 dark:border-purple-800/30 hover:border-purple-400 dark:hover:border-purple-600/50 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex-shrink-0">
                                                            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{edu.degree}</h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">{edu.school}</p>
                                                            {edu.year && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {edu.year}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Social Links */}
                                {user.socials && Object.keys(user.socials).some(key => user.socials[key]) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Connect</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(user.socials).map(([platform, url]) => (
                                                url && (
                                                    <motion.a
                                                        key={platform}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white hover:text-white transition-all hover:shadow-lg"
                                                    >
                                                        {getSocialIcon(platform)}
                                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                    </motion.a>
                                                )
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <UserListModal
                isOpen={listModal.isOpen}
                onClose={() => setListModal(prev => ({ ...prev, isOpen: false }))}
                title={listModal.title}
                users={listModal.users}
                loading={listModal.loading}
                onUserClick={(clickedUser) => {
                    setUser(clickedUser);
                    setListModal(prev => ({ ...prev, isOpen: false }));
                }}
            />
        </>
    );
};

export default UserProfileModal;
