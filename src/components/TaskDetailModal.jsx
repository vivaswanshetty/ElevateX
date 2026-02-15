import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getTaskById } from '../api/tasks';
import { X, Send, Clock, DollarSign, User, MessageSquare, CheckCircle, AlertCircle, Loader, Briefcase, FileText, Smile, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import UserProfileModal from './UserProfileModal';
import { formatTime, groupMessagesByDate } from '../utils/dateUtils';

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '💯', '✨'];

const TaskDetailModal = ({ taskId, onClose }) => {
    const { currentUser } = useAuth();
    const { applyForTask, assignTask, completeTask, addChatMessage } = useData();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatMessage, setChatMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { messageId: string }
    const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const chatEndRef = useRef(null);
    const taskDetailsRef = useRef(null); // Ref for scrollable task details container

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                const data = await getTaskById(taskId);
                setTask(data);
            } catch (err) {
                console.error("Failed to fetch task details", err);
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            fetchTask();
        }
    }, [taskId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [task?.chat]);

    // Prevent body scroll and background movement when modal is open
    useEffect(() => {
        if (taskId) {
            // Store the current scroll position
            const scrollY = window.scrollY;

            // Apply styles to body to prevent scroll and movement
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore the previous state
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // Restore scroll position
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            // Cleanup on unmount
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        };
    }, [taskId]);

    // Scroll task details to top when modal opens or task changes
    useEffect(() => {
        if (taskDetailsRef.current && task) {
            taskDetailsRef.current.scrollTop = 0;
        }
    }, [task, taskId]);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        try {
            const tempMessage = chatMessage;
            setChatMessage('');
            await addChatMessage(taskId, tempMessage);
            const data = await getTaskById(taskId);
            setTask(data);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await api.post(`/tasks/${taskId}/chat/${messageId}/react`, { emoji });
            const data = await getTaskById(taskId);
            setTask(data);
        } catch (err) {
            console.error("Failed to add reaction", err);
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editingText.trim()) return;

        try {
            await api.put(`/tasks/${taskId}/chat/${messageId}`, { text: editingText });
            const data = await getTaskById(taskId);
            setTask(data);
            setEditingMessageId(null);
            setEditingText('');
        } catch (err) {
            console.error("Failed to edit message", err);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/tasks/${taskId}/chat/${messageId}`);
            const data = await getTaskById(taskId);
            setTask(data);
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(text);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const handleApply = async () => {
        try {
            setActionLoading(true);
            await applyForTask(taskId);
            const data = await getTaskById(taskId);
            setTask(data);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async (applicantId) => {
        try {
            setActionLoading(true);
            await assignTask(taskId, applicantId);
            const data = await getTaskById(taskId);
            setTask(data);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            setActionLoading(true);
            await completeTask(taskId);
            const data = await getTaskById(taskId);
            setTask(data);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (!taskId) return null;

    return (
        <>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Message?</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Are you sure you want to delete this message? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteMessage(deleteConfirm)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {taskId && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={(e) => {
                            // Close modal when clicking on backdrop
                            if (e.target === e.currentTarget) {
                                onClose();
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-[#0F0F12] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 z-50 w-10 h-10 flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-full text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : task ? (
                                <div className="flex h-full">
                                    {/* Left: Task Details (60%) */}
                                    <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-white/10">
                                        {/* Task Header - Fixed */}
                                        <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-b from-indigo-500/5 to-transparent">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${task.category === 'Development' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                                                    task.category === 'Design' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                                                        'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                                    }`}>
                                                    {task.category}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${task.status === 'Open' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                                    task.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                                                        'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                                {task.title}
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>{task.createdBy?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{task.coins} Coins</span>
                                                </div>
                                                {/* XP Display */}
                                                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-purple-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                                    <span>+{Math.floor(10 + (task.coins / 2))} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Task Content - Scrollable */}
                                        <div ref={taskDetailsRef} className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-indigo-500" /> Description
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                    {task.description || task.desc}
                                                </p>
                                            </div>

                                            {task.attachments && task.attachments.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Attachments</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {task.attachments.map((file, idx) => (
                                                            <div key={idx} className="relative group rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden hover:border-indigo-500/50 transition-colors">
                                                                {file.type?.startsWith('image/') ? (
                                                                    <img src={file.data} alt={file.name} className="w-full h-24 object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-24 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5">
                                                                        <FileText className="w-6 h-6 text-gray-400 mb-1" />
                                                                        <span className="text-xs text-center text-gray-500 px-2 line-clamp-1">{file.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Applicants Section */}
                                            {(currentUser?._id === task.createdBy?._id || currentUser?.name === task.createdBy?.name) && task.applicants?.length > 0 && (
                                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4" /> {task.status === 'Completed' ? 'Past Applicants' : 'Applicants'} ({task.applicants.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {task.applicants.map((app, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-3 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors group">
                                                                <div
                                                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                                                    onClick={() => setSelectedUser(app.user)}
                                                                >
                                                                    <img
                                                                        src={app.user?.avatar || `https://ui-avatars.com/api/?name=${app.user?.name || 'User'}`}
                                                                        alt={app.user?.name}
                                                                        className="w-8 h-8 rounded-full border-2 border-indigo-500"
                                                                    />
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                                        {app.user?.name || 'Unknown'}
                                                                    </span>
                                                                    {task.assignedTo === (app.user?._id || app.user) && (
                                                                        <span className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                                                            {task.status === 'Completed' ? 'Completed' : 'Assigned'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {task.status === 'Open' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAssign(app.user?._id || app.user);
                                                                        }}
                                                                        disabled={actionLoading}
                                                                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer - Fixed */}
                                        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    <Briefcase className="w-4 h-4 inline mr-1" />
                                                    {task.applicants?.length || 0} Applicants
                                                </div>

                                                {task.status === 'Open' && currentUser?._id !== task.createdBy?._id && !task.applicants?.some(a => (a.user?._id || a.user) === currentUser?._id) && (
                                                    <button
                                                        onClick={handleApply}
                                                        disabled={actionLoading}
                                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50"
                                                    >
                                                        {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply Now'}
                                                    </button>
                                                )}

                                                {task.status === 'Open' && task.applicants?.some(a => (a.user?._id || a.user) === currentUser?._id) && (
                                                    <span className="px-6 py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-bold border border-green-500/20 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Applied
                                                    </span>
                                                )}

                                                {task.status === 'In Progress' && (
                                                    (task.assignedTo === currentUser?._id) ||
                                                    (task.createdBy?._id === currentUser?._id || task.createdBy === currentUser?._id)
                                                ) && (
                                                        <button
                                                            onClick={handleComplete}
                                                            disabled={actionLoading}
                                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                                                        >
                                                            {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Mark Complete'}
                                                        </button>
                                                    )}

                                                {task.status === 'Completed' && (
                                                    <span className="px-6 py-2.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg font-bold border border-green-200 dark:border-green-500/20 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Chat (40%) */}
                                    <div className="flex-[2] flex flex-col bg-gray-50 dark:bg-[#0A0A0C]">
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0F0F12]">
                                            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                                <MessageSquare className="w-5 h-5 text-indigo-500" />
                                                Discussion
                                            </div>
                                        </div>

                                        {/* Chat Messages */}
                                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                            {(!task.chat || task.chat.length === 0) ? (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
                                                    <MessageSquare className="w-10 h-10 opacity-20" />
                                                    <p>No messages yet</p>
                                                    <p className="text-xs">Start the conversation!</p>
                                                </div>
                                            ) : (
                                                Object.entries(groupMessagesByDate(task.chat)).map(([dateLabel, groupMessages]) => (
                                                    <React.Fragment key={dateLabel}>
                                                        <div className="flex items-center justify-center my-4">
                                                            <div className="bg-gray-200 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                                {dateLabel}
                                                            </div>
                                                        </div>
                                                        {groupMessages.map((msg, idx) => {
                                                            const isOwnMessage = msg.user === currentUser?._id || msg.from === currentUser?.name;
                                                            const isEditing = editingMessageId === msg._id;
                                                            const isHovered = hoveredMessageId === msg._id;

                                                            return (
                                                                <motion.div
                                                                    key={msg._id || idx}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} group relative`}
                                                                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                                                                    onMouseLeave={() => setHoveredMessageId(null)}
                                                                >
                                                                    {/* Action Buttons - Positioned Above Message */}
                                                                    {isHovered && !isEditing && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: -5 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className={`flex gap-1 mb-1 ${isOwnMessage ? 'mr-2' : 'ml-9'} relative`}
                                                                        >
                                                                            {isOwnMessage && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingMessageId(msg._id);
                                                                                            setEditingText(msg.text);
                                                                                        }}
                                                                                        className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm"
                                                                                        title="Edit"
                                                                                    >
                                                                                        <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setDeleteConfirm(msg._id)}
                                                                                        className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                                                                                        title="Delete"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3 text-red-500" />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={() => setReactionPickerMessageId(reactionPickerMessageId === msg._id ? null : msg._id)}
                                                                                    className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm"
                                                                                    title="React"
                                                                                >
                                                                                    <Smile className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                                                                </button>

                                                                                {/* Emoji Picker for Reactions */}
                                                                                {reactionPickerMessageId === msg._id && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                        className={`absolute top-full mt-1 ${isOwnMessage ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-white/10 p-1.5 grid grid-cols-4 gap-1 z-30 w-32`}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        {EMOJI_OPTIONS.map(emoji => (
                                                                                            <button
                                                                                                key={emoji}
                                                                                                onClick={() => {
                                                                                                    handleReaction(msg._id, emoji);
                                                                                                    setReactionPickerMessageId(null);
                                                                                                }}
                                                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-base flex items-center justify-center aspect-square"
                                                                                            >
                                                                                                {emoji}
                                                                                            </button>
                                                                                        ))}
                                                                                    </motion.div>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleCopyMessage(msg.text)}
                                                                                className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm"
                                                                                title="Copy"
                                                                            >
                                                                                {copiedMessageId === msg.text ? (
                                                                                    <Check className="w-3 h-3 text-green-500" />
                                                                                ) : (
                                                                                    <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                                                                )}
                                                                            </button>
                                                                        </motion.div>
                                                                    )}

                                                                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                        {/* Avatar */}
                                                                        {!isOwnMessage && (
                                                                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                                                                {msg.from?.charAt(0) || 'U'}
                                                                            </div>
                                                                        )}

                                                                        {/* Message Content */}
                                                                        <div className="flex-1 min-w-0">
                                                                            {isEditing ? (
                                                                                <div className="flex gap-1 items-center p-1 bg-white dark:bg-white/10 rounded-xl border border-indigo-500">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editingText}
                                                                                        onChange={(e) => setEditingText(e.target.value)}
                                                                                        onKeyPress={(e) => e.key === 'Enter' && handleEditMessage(msg._id)}
                                                                                        className="flex-1 px-2 py-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                                                                                        autoFocus
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => handleEditMessage(msg._id)}
                                                                                        className="p-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex-shrink-0"
                                                                                    >
                                                                                        <Check className="w-3 h-3" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setEditingMessageId(null)}
                                                                                        className="p-1 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 flex-shrink-0"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className={`px-3 py-2 rounded-2xl text-sm ${isOwnMessage
                                                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                                                    : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/10'
                                                                                    }`}>
                                                                                    {!isOwnMessage && (
                                                                                        <div className="font-bold text-[10px] mb-0.5 opacity-70">{msg.from}</div>
                                                                                    )}
                                                                                    <div className="break-words">{msg.text}</div>
                                                                                    {msg.edited && (
                                                                                        <div className={`text-[9px] mt-0.5 italic ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                                                            (edited)
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Reactions */}
                                                                                    {msg.reactions && msg.reactions.length > 0 && (
                                                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                            {Object.entries(
                                                                                                msg.reactions.reduce((acc, r) => {
                                                                                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                                                                    return acc;
                                                                                                }, {})
                                                                                            ).map(([emoji, count]) => (
                                                                                                <button
                                                                                                    key={emoji}
                                                                                                    onClick={() => handleReaction(msg._id, emoji)}
                                                                                                    className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                                                                                                >
                                                                                                    {emoji} {count}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Timestamp */}
                                                                    <span className={`text-[10px] text-gray-400 mt-0.5 ${isOwnMessage ? 'mr-2' : 'ml-9'}`}>
                                                                        {formatTime(msg.at)}
                                                                    </span>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Chat Input */}
                                        <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#0F0F12]">
                                            {currentUser ? (
                                                <>
                                                    <form onSubmit={handleSendChat} className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                value={chatMessage}
                                                                onChange={(e) => setChatMessage(e.target.value)}
                                                                placeholder="Type a message..."
                                                                className="w-full pl-3 pr-10 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm text-gray-900 dark:text-white input-glow"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                            >
                                                                <Smile className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={!chatMessage.trim()}
                                                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </form>

                                                    {/* Emoji Picker */}
                                                    {showEmojiPicker && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 flex gap-1"
                                                        >
                                                            {EMOJI_OPTIONS.map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => {
                                                                        setChatMessage(prev => prev + emoji);
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-lg"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full py-4 text-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                                    Log in to message
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-red-500">
                                    <AlertCircle className="w-12 h-12 mb-4" />
                                    <p className="text-lg font-bold">Failed to load task</p>
                                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-lg text-sm">Close</button>
                                </div>
                            )}
                        </motion.div>
                    </div >
                )}
            </AnimatePresence >

            <UserProfileModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </>
    );
};

export default TaskDetailModal;
