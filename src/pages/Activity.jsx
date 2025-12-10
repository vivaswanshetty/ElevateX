import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, CheckCircle, Bell, BellOff, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

import UserProfileModal from '../components/UserProfileModal';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import TaskDetailModal from '../components/TaskDetailModal';
import AuthModal from '../components/AuthModal';

const Activity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [followRequests, setFollowRequests] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [toast, setToast] = useState(null);

    const [processingRequests, setProcessingRequests] = useState({});  // Track accepted/rejected states
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchActivities();
        if (user.followRequests) {
            setFollowRequests(user.followRequests);
        }

        // Check if we need to restore profile modal
        if (location.state?.restoreUser) {
            setSelectedUser(location.state.restoreUser);
            window.history.replaceState({ ...window.history.state, restoreUser: null }, '');
        }
    }, [user, navigate, location.state]);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (userId, initialData = null) => {
        if (initialData) {
            setSelectedUser(initialData);
        }
        try {
            const response = await api.get(`/users/${userId}`);
            setSelectedUser(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            if (error.response?.status === 404) {
                alert('This user has deleted their account');
                if (initialData) setSelectedUser(null); // Close if not found
            }
        }
    };

    const markAsRead = async (activityId) => {
        try {
            await api.put(`/activities/${activityId}/read`);
            setActivities(prev => prev.map(a =>
                a._id === activityId ? { ...a, read: true } : a
            ));
            // Trigger navbar update
            window.dispatchEvent(new Event('activity-updated'));
        } catch (error) {
            console.error('Error marking activity as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/activities/read-all');
            setActivities(prev => prev.map(a => ({ ...a, read: true })));
            // Trigger navbar update
            window.dispatchEvent(new Event('activity-updated'));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClearConfirm = async () => {
        try {
            await api.delete('/activities/clear-all');
            setActivities([]);
            // Trigger navbar update
            window.dispatchEvent(new Event('activity-updated'));
            setToast({
                type: 'cleared',
                title: 'History Cleared',
                message: 'All activities have been permanently removed'
            });
        } catch (error) {
            console.error('Error clearing activities:', error);
            setToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to clear activities'
            });
        }
    };

    const clearAllActivities = () => {
        setShowClearConfirm(true);
    };

    const handleAcceptRequest = async (requesterId) => {
        try {
            await api.put(`/users/${requesterId}/accept-request`);

            // Update UI to show accepted state
            setProcessingRequests(prev => ({ ...prev, [requesterId]: 'accepted' }));

            // Show success toast
            setToast({
                type: 'success',
                title: 'Request Accepted!',
                message: 'User started following you'
            });

            // Remove from lists after a short delay to allow user to see the "Accepted" state
            setTimeout(() => {
                setFollowRequests(prev => prev.filter(req => req._id !== requesterId));
                setActivities(prev => prev.filter(activity =>
                    !(activity.type === 'follow_request' && activity.actor?._id === requesterId)
                ));
                fetchActivities();
            }, 1500);

        } catch (error) {
            console.error('Error accepting request:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 404) {
                setToast({
                    type: 'error',
                    title: 'User Not Found',
                    message: error.response.data.message || 'This user has deleted their account'
                });
                setFollowRequests(prev => prev.filter(req => req._id !== requesterId));
                setActivities(prev => prev.filter(activity =>
                    !(activity.type === 'follow_request' && activity.actor?._id === requesterId)
                ));
            } else {
                setToast({
                    type: 'error',
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to accept request'
                });
            }
        }
    };

    const handleRejectRequest = async (requesterId) => {
        try {
            await api.put(`/users/${requesterId}/reject-request`);

            setProcessingRequests(prev => ({ ...prev, [requesterId]: 'rejected' }));

            // Show success toast
            setToast({
                type: 'info',
                title: 'Request Rejected',
                message: 'Follow request declined'
            });

            setTimeout(() => {
                setFollowRequests(prev => prev.filter(req => req._id !== requesterId));
                setActivities(prev => prev.filter(activity =>
                    !(activity.type === 'follow_request' && activity.actor?._id === requesterId)
                ));
            }, 1500);

        } catch (error) {
            console.error('Error rejecting request:', error);
            setToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to reject request'
            });
        }
    };

    // ... (keep existing helper functions) ...

    const getActivityIcon = (type) => {
        switch (type) {
            case 'follow':
            case 'follow_accept':
                return <UserPlus className="w-5 h-5" />;
            case 'follow_request':
                return <UserPlus className="w-5 h-5 text-yellow-500" />;
            case 'like':
                return <Heart className="w-5 h-5 fill-red-500 text-red-500" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5" />;
            case 'task_complete':
            case 'task_assign':
                return <CheckCircle className="w-5 h-5" />;
            case 'task_apply':
                return <Briefcase className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getActivityMessage = (activity) => {
        const actorName = activity.actor?.name || 'Someone';

        switch (activity.type) {
            case 'follow':
                return `started following you`;
            case 'follow_request':
                return `requested to follow you`;
            case 'follow_accept':
                return `accepted your follow request`;
            case 'like':
                return `liked your post`;
            case 'comment':
                return `commented on your post`;
            case 'task_complete':
                return `completed your task`;
            case 'task_assign':
                return `assigned you to a task`;
            case 'task_apply':
                return `applied for your task`;
            default:
                return 'interacted with you';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'follow':
            case 'follow_accept':
                return 'from-blue-500 to-indigo-500';
            case 'follow_request':
                return 'from-yellow-500 to-orange-500';
            case 'like':
                return 'from-red-500 to-pink-500';
            case 'comment':
                return 'from-green-500 to-emerald-500';
            case 'task_complete':
            case 'task_assign':
            case 'task_apply':
                return 'from-yellow-500 to-orange-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const filteredActivities = activities.filter(activity => {
        if (filter === 'unread') return !activity.read;
        if (filter === 'read') return activity.read;
        return true;
    });

    const unreadCount = activities.filter(a => !a.read).length;

    if (!user) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Bell className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Activity Feed</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Login to see your notifications and interactions!</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all"
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-24 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 bg-clip-text text-transparent leading-tight pb-2">
                        Activity
                    </h1>
                    {activities.length > 0 && (
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    Mark all as read ({unreadCount})
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearAllActivities}
                                className="px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
                            >
                                Clear All
                            </motion.button>
                        </div>
                    )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                    Stay updated with all your interactions
                </p>
            </div>

            {/* Follow Requests Section */}
            {followRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-yellow-500" />
                        Follow Requests
                    </h2>
                    <div className="space-y-3">
                        {followRequests.map((request) => (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleViewProfile(request._id, request)}
                                >
                                    <img
                                        src={request.avatar || `https://ui-avatars.com/api/?name=${request.name}`}
                                        alt={request.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white hover:text-yellow-500 transition-colors">{request.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">wants to follow you</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {processingRequests[request._id] === 'accepted' ? (
                                        <button disabled className="px-4 py-1.5 bg-green-500 text-white rounded-lg font-medium text-sm cursor-default">
                                            Accepted
                                        </button>
                                    ) : processingRequests[request._id] === 'rejected' ? (
                                        <button disabled className="px-4 py-1.5 bg-gray-400 text-white rounded-lg font-medium text-sm cursor-default">
                                            Rejected
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAcceptRequest(request._id)}
                                                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request._id)}
                                                className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2">
                {['all', 'unread', 'read'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium capitalize transition-all ${filter === tab
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        {tab}
                        {tab === 'unread' && unreadCount > 0 && (
                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Activities List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity, index) => (
                            <motion.div
                                key={activity._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    if (!activity.read) markAsRead(activity._id);
                                    if (activity.post) {
                                        navigate(`/post/${activity.post._id || activity.post}`);
                                    } else if (activity.task) {
                                        setSelectedTaskId(activity.task._id || activity.task);
                                    } else {
                                        handleViewProfile(activity.actor?._id, activity.actor);
                                    }
                                }}
                                className={`relative bg-white dark:bg-white/5 border-2 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${activity.read
                                    ? 'border-gray-200 dark:border-white/10 opacity-75'
                                    : 'border-yellow-500 dark:border-yellow-400 shadow-lg shadow-yellow-500/10'
                                    }`}
                            >
                                {/* Unread Indicator */}
                                {!activity.read && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full"
                                    />
                                )}

                                <div className="flex gap-4">
                                    {/* Icon/Avatar Section - Updated to match user request */}
                                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getActivityColor(activity.type)} shadow-lg`}>
                                        {/* Show User Avatar instead of Icon if available */}
                                        {activity.actor?.avatar ? (
                                            <img
                                                src={activity.actor.avatar}
                                                alt={activity.actor.name}
                                                className="w-full h-full rounded-xl object-cover border-2 border-white/20"
                                            />
                                        ) : (
                                            <div className="text-white">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                        )}

                                        {/* Small badge for activity type */}
                                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md border border-gray-100 dark:border-gray-700">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div
                                                className="flex items-center gap-2 flex-wrap"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewProfile(activity.actor?._id, activity.actor);
                                                }}
                                            >
                                                <span className="font-bold text-gray-900 dark:text-white capitalize text-lg">
                                                    {activity.actor?.name || 'Someone'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-auto">
                                                    {formatTimeAgo(activity.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 text-base">
                                            {getActivityMessage(activity)}
                                        </p>

                                        {/* Follow Request Actions */}
                                        {activity.type === 'follow_request' && (
                                            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                                {processingRequests[activity.actor?._id] === 'accepted' ? (
                                                    <button disabled className="px-4 py-1.5 bg-green-500 text-white rounded-lg font-medium text-sm cursor-default">
                                                        Accepted
                                                    </button>
                                                ) : processingRequests[activity.actor?._id] === 'rejected' ? (
                                                    <button disabled className="px-4 py-1.5 bg-gray-400 text-white rounded-lg font-medium text-sm cursor-default">
                                                        Rejected
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptRequest(activity.actor?._id)}
                                                            className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(activity.actor?._id)}
                                                            className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Activity Details */}
                                        {activity.comment && (
                                            <div className="mt-2 p-3 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                    "{activity.comment}"
                                                </p>
                                            </div>
                                        )}
                                        {activity.post && (
                                            <div
                                                className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 font-medium hover:underline flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // If we had a single post view page, we'd go there.
                                                    // For now, going to feed is the best option or we could implement a post modal.
                                                    navigate(`/post/${activity.post._id || activity.post}`);
                                                }}
                                            >
                                                View post →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="bg-gray-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BellOff className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No activities yet</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                When you interact with others, updates will appear here.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <UserProfileModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearConfirm}
                title="Clear All Activities?"
                message="This action cannot be undone. All your activity history will be permanently deleted."
                confirmText="Yes, Clear All"
                isDestructive={true}
            />

            <TaskDetailModal
                taskId={selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
            />

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default Activity;
