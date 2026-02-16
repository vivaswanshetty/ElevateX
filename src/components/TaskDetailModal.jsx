import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getTaskById } from '../api/tasks';
import { X, Send, Clock, User, MessageSquare, CheckCircle, AlertCircle, Loader, Briefcase, FileText, Smile, Edit2, Trash2, Copy, Check, Shield, Crown, Zap, Calendar, ExternalLink, Coins } from 'lucide-react';
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
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const chatEndRef = useRef(null);
    const taskDetailsRef = useRef(null);

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

    useEffect(() => {
        if (taskDetailsRef.current && task) {
            taskDetailsRef.current.scrollTop = 0;
        }
    }, [task, taskId]);

    // Prevent body scroll
    useEffect(() => {
        if (taskId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [taskId]);

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
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f0f0f] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Message?</h3>
                            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg font-bold hover:bg-white/10">Cancel</button>
                                <button onClick={() => handleDeleteMessage(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {taskId && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-6xl h-[90vh] bg-[#050505] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* CLOSE BUTTON */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm border border-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {loading ? (
                                <div className="flex items-center justify-center w-full h-full">
                                    <Loader className="w-10 h-10 animate-spin text-indigo-500" />
                                </div>
                            ) : task ? (
                                <>
                                    {/* LEFT: Task Details (60%) */}
                                    <div className="flex-[3] flex flex-col border-r border-white/5 bg-[#050505] relative overflow-hidden">
                                        {/* Decorative Background */}
                                        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

                                        {/* Header */}
                                        <div className="p-8 pb-4 relative z-10">
                                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${task.category === 'Development' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    task.category === 'Design' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                        'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {task.category}
                                                </span>
                                                {task.coins >= 500 && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                                                        <Crown className="w-3 h-3" /> Premium
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${task.status === 'Open' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                                                {task.title}
                                            </h2>

                                            <div className="flex flex-wrap gap-6 text-sm text-gray-400 border-b border-white/5 pb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <User className="w-4 h-4 text-gray-300" />
                                                    </div>
                                                    <span>by <span className="text-white font-medium">{task.createdBy?.name}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-gray-300" />
                                                    </div>
                                                    <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <Shield className="w-4 h-4 text-gray-300" />
                                                    </div>
                                                    <span>Verified Post</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                        <Coins className="w-6 h-6 text-black" strokeWidth={3} />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-black text-white">{task.coins}</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Coins Reward</div>
                                                    </div>
                                                </div>
                                                <div className="w-px h-10 bg-white/10" />
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                        <Zap className="w-6 h-6 text-white" strokeWidth={3} />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-black text-white">+{Math.floor(10 + (task.coins / 10))} XP</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Experience</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div ref={taskDetailsRef} className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-indigo-400" /> Description
                                            </h3>
                                            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                                                {task.description || task.desc}
                                            </div>

                                            {task.attachments?.length > 0 && (
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-bold text-white mb-4">Attachments</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {task.attachments.map((file, idx) => (
                                                            <div key={idx} className="group relative aspect-video bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                                                                {file.type?.startsWith('image/') ? (
                                                                    <img src={file.data} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                                                        <FileText className="w-8 h-8 mb-2" />
                                                                        <span className="text-xs px-2 text-center line-clamp-1">{file.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* APPLICANTS SECTION - VISIBLE TO EVERYONE */}
                                            {task.applicants?.length > 0 && (
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <Briefcase className="w-5 h-5 text-indigo-400" /> Applicants ({task.applicants.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {task.applicants.map((app, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                                <div
                                                                    className="flex items-center gap-3 cursor-pointer"
                                                                    onClick={() => setSelectedUser(app.user)}
                                                                >
                                                                    <img src={app.user?.avatar || `https://ui-avatars.com/api/?name=${app.user?.name || 'User'}`} className="w-10 h-10 rounded-full border-2 border-indigo-500/30" alt="" />
                                                                    <div>
                                                                        <div className="font-bold text-white">{app.user?.name || 'Unknown User'}</div>
                                                                        <div className="text-xs text-gray-500">Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Only creator sees Assign button */}
                                                                {task.status === 'Open' && currentUser?._id === task.createdBy?._id && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAssign(app.user?._id || app.user);
                                                                        }}
                                                                        disabled={actionLoading}
                                                                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                )}

                                                                {task.assignedTo === (app.user?._id || app.user) && (
                                                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                                                        Assigned
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div className="p-6 border-t border-white/10 bg-[#0a0a0a] relative z-20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {task.applicants?.slice(0, 3).map((app, i) => (
                                                        <img key={i} src={app.user?.avatar || `https://ui-avatars.com/api/?name=${app.user?.name}`} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a]" alt="" />
                                                    ))}
                                                    {task.applicants?.length > 0 && (
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0a0a0a]">
                                                            {task.applicants.length}
                                                        </div>
                                                    )}
                                                </div>

                                                {task.status === 'Open' && currentUser?._id !== task.createdBy?._id && (
                                                    <button
                                                        onClick={handleApply}
                                                        disabled={actionLoading || currentUser.coins < 5}
                                                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all ${currentUser.coins < 5
                                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-xl shadow-indigo-500/20'
                                                            }`}
                                                    >
                                                        {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply Now (-5 Coins)'}
                                                    </button>
                                                )}

                                                {task.status === 'In Progress' && (task.assignedTo === currentUser?._id || task.createdBy?._id === currentUser?._id) && (
                                                    <button
                                                        onClick={handleComplete}
                                                        disabled={actionLoading}
                                                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-xl shadow-green-500/20"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}

                                                {task.status === 'Completed' && (
                                                    <div className="px-8 py-3 bg-green-500/20 text-green-400 rounded-xl font-bold border border-green-500/20 flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5" /> Completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Chat Area (40%) */}
                                    <div className="hidden md:flex flex-[2] flex-col bg-[#0a0a0a] border-l border-white/5">
                                        <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5 text-indigo-500" /> Discussion
                                            </h3>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                            {(!task.chat || task.chat.length === 0) ? (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                                                    <MessageSquare className="w-12 h-12 mb-4" />
                                                    <p>Start the conversation!</p>
                                                </div>
                                            ) : (
                                                task.chat.map((msg, idx) => {
                                                    const isOwn = msg.user === currentUser?._id || msg.from === currentUser?.name;
                                                    return (
                                                        <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] rounded-2xl p-4 ${isOwn ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'
                                                                }`}>
                                                                {!isOwn && <div className="text-[10px] font-bold text-gray-400 mb-1">{msg.from}</div>}
                                                                <p className="text-sm">{msg.text}</p>
                                                                <div className={`text-[10px] mt-2 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>{formatTime(msg.at)}</div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
                                            <form onSubmit={handleSendChat} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={chatMessage}
                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                />
                                                <button type="submit" disabled={!chatMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50">
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </>
    );
};

export default TaskDetailModal;
