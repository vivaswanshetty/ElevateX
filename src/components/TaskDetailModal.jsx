import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getTaskById } from '../api/tasks';
import {
    X, Send, User, MessageSquare, CheckCircle, Loader, Briefcase,
    FileText, Crown, Zap, Calendar, Coins, Shield, Sparkles, Users,
    ArrowRight, Lock, Code, Palette, Megaphone,
    PenTool, Database, Video, Music, Coffee, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import UserProfileModal from './UserProfileModal';
import { formatTime } from '../utils/dateUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
    Development: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Code, glow: 'from-blue-900/30' },
    Design: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: Palette, glow: 'from-purple-900/30' },
    Marketing: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', icon: Megaphone, glow: 'from-pink-900/30' },
    Writing: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: PenTool, glow: 'from-green-900/30' },
    'Data Science': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: Database, glow: 'from-cyan-900/30' },
    'Video & Animation': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: Video, glow: 'from-red-900/30' },
    'Music & Audio': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', icon: Music, glow: 'from-violet-900/30' },
    Business: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Briefcase, glow: 'from-amber-900/30' },
    Lifestyle: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', icon: Coffee, glow: 'from-teal-900/30' },
};

const getCategoryStyle = (cat) => CATEGORY_STYLES[cat] || {
    bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: LayoutGrid, glow: 'from-indigo-900/30'
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const formatTimeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, gradient, glow }) => (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-br ${gradient} border border-white/5 shadow-lg ${glow}`}>
        <div className="p-2.5 bg-black/30 rounded-xl">
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-2xl font-black text-white leading-none">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
        </div>
    </div>
);

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
const ChatBubble = ({ msg, isOwn }) => (
    <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
        <div className={`max-w-[82%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            {!isOwn && (
                <span className="text-[10px] font-bold mb-1 ml-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{msg.from}</span>
            )}
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                ? 'text-white rounded-tr-sm shadow-lg'
                : 'rounded-tl-sm border border-white/5'
                }`}
                style={isOwn
                    ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)' }
                }
            >
                {msg.text}
            </div>
            <span className={`text-[10px] mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}
                style={{ color: isOwn ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.35)' }}>
                {formatTime(msg.at)}
            </span>
        </div>
    </motion.div>
);

// ─── Applicant Row ────────────────────────────────────────────────────────────
const ApplicantRow = ({ app, task, currentUser, actionLoading, onAssign, onViewProfile }) => {
    const isAssigned = task.assignedTo === (app.user?._id || app.user);
    const isCreator = currentUser?._id === task.createdBy?._id;

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors group">
            <img
                src={app.user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(app.user?.name || 'user')}`}
                className="w-10 h-10 rounded-full border-2 cursor-pointer hover:border-red-400 transition-colors flex-shrink-0"
                style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                alt=""
                onClick={() => onViewProfile(app.user)}
            />
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewProfile(app.user)}>
                <p className="font-bold text-white text-sm capitalize truncate group-hover:text-red-400 transition-colors">{app.user?.name || 'Unknown'}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Applied {app.appliedAt ? formatTimeAgo(app.appliedAt) : 'recently'}</p>
            </div>
            {isAssigned ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Assigned
                </span>
            ) : task.status === 'Open' && isCreator ? (
                <button
                    onClick={e => { e.stopPropagation(); onAssign(app.user?._id || app.user); }}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.8)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.8)'}
                >
                    Assign
                </button>
            ) : null}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const TaskDetailModal = ({ taskId, onClose }) => {
    const { currentUser } = useAuth();
    const { applyForTask, assignTask, completeTask, addChatMessage } = useData();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatMessage, setChatMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeSection, setActiveSection] = useState('details'); // 'details' | 'applicants' | 'attachments'
    const chatEndRef = useRef(null);
    const taskDetailsRef = useRef(null);

    useEffect(() => {
        if (!taskId) return;
        const fetchTask = async () => {
            setLoading(true);
            try {
                const data = await getTaskById(taskId);
                setTask(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchTask();
    }, [taskId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [task?.chat]);

    useEffect(() => {
        document.body.style.overflow = taskId ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [taskId]);

    const refreshTask = async () => {
        const data = await getTaskById(taskId);
        setTask(data);
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const msg = chatMessage;
        setChatMessage('');
        try {
            await addChatMessage(taskId, msg);
            await refreshTask();
        } catch (e) { console.error(e); }
    };

    const handleApply = async () => {
        setActionLoading(true);
        try { await applyForTask(taskId); await refreshTask(); }
        catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleAssign = async (applicantId) => {
        setActionLoading(true);
        try { await assignTask(taskId, applicantId); await refreshTask(); }
        catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleComplete = async () => {
        setActionLoading(true);
        try { await completeTask(taskId); await refreshTask(); }
        catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    if (!taskId) return null;

    const catStyle = task ? getCategoryStyle(task.category) : null;
    const CatIcon = catStyle?.icon || LayoutGrid;
    const isPremium = task?.coins >= 500;
    const isCreator = currentUser?._id === task?.createdBy?._id;
    const hasApplied = task?.applicants?.some(a => (a.user?._id || a.user) === currentUser?._id);
    const isAssigned = task?.assignedTo === currentUser?._id;
    const xpReward = task ? Math.floor(10 + (task.coins / 10)) : 0;

    return (
        <>
            <AnimatePresence>
                {taskId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md"
                        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 24 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-6xl h-[92vh] bg-[#050505] rounded-[2rem] overflow-hidden shadow-2xl border border-white/8 flex flex-col md:flex-row"
                        >

                            {loading ? (
                                <div className="flex items-center justify-center w-full h-full gap-3">
                                    <Loader className="w-8 h-8 animate-spin" style={{ color: '#ef4444' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }} className="font-medium">Loading task...</span>
                                </div>
                            ) : task ? (
                                <>
                                    {/* ══════════════════════════════════════════════
                                        LEFT PANEL — Task Details (60%)
                                    ══════════════════════════════════════════════ */}
                                    <div className="flex-[3] flex flex-col border-r border-white/5 overflow-hidden">

                                        {/* Hero header */}
                                        <div className={`relative px-7 pt-8 pb-6 bg-gradient-to-b ${catStyle?.glow || 'from-indigo-900/20'} to-transparent flex-shrink-0`}>
                                            {/* Decorative glow blob */}
                                            <div className={`absolute top-0 right-0 w-64 h-64 ${catStyle?.bg || 'bg-indigo-500/10'} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none`} />

                                            {/* Badges row — close button lives here */}
                                            <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${catStyle?.bg} ${catStyle?.text} ${catStyle?.border}`}>
                                                    <CatIcon className="w-3 h-3" /> {task.category}
                                                </span>
                                                {isPremium && (
                                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                        <Crown className="w-3 h-3" /> Premium
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${task.status === 'Open'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : task.status === 'In Progress'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${task.status === 'Open' ? 'bg-green-400 animate-pulse' : task.status === 'In Progress' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                                                    {task.status}
                                                </span>
                                                {new Date(task.createdAt) > new Date(Date.now() - 86400000) && (
                                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <Sparkles className="w-3 h-3" /> New
                                                    </span>
                                                )}
                                                {/* Close button — right side of badges row, away from chat panel */}
                                                <button
                                                    onClick={onClose}
                                                    className="ml-auto p-2 bg-white/5 hover:bg-white/15 rounded-full text-gray-400 hover:text-white transition-all border border-white/10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-2xl md:text-3xl font-black text-white mb-5 leading-tight relative z-10 pr-8">
                                                {task.title}
                                            </h2>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <User className="w-3.5 h-3.5 text-gray-300" />
                                                    </div>
                                                    <span>by <span className="text-white font-semibold capitalize">{task.createdBy?.name}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                                    </div>
                                                    <span>Due <span className="text-white font-medium">{formatDate(task.deadline)}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <Shield className="w-3.5 h-3.5 text-green-400" />
                                                    </div>
                                                    <span className="text-green-400 font-medium">Verified Post</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                                        <Users className="w-3.5 h-3.5 text-gray-300" />
                                                    </div>
                                                    <span>{task.applicants?.length || 0} applicants</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reward pills */}
                                        <div className="flex gap-3 px-7 py-4 border-b border-white/5 flex-shrink-0">
                                            <StatPill
                                                icon={Coins}
                                                label="Coins Reward"
                                                value={task.coins}
                                                gradient="from-yellow-600/30 to-orange-700/20"
                                                glow="shadow-yellow-500/10"
                                            />
                                            <StatPill
                                                icon={Zap}
                                                label="XP Earned"
                                                value={`+${xpReward}`}
                                                gradient="from-red-600/20 to-orange-700/10"
                                                glow="shadow-red-500/10"
                                            />
                                        </div>

                                        {/* Section tabs */}
                                        <div className="flex border-b border-white/5 flex-shrink-0 px-7">
                                            {[
                                                { id: 'details', label: 'Description', icon: FileText },
                                                { id: 'applicants', label: `Applicants (${task.applicants?.length || 0})`, icon: Users },
                                                ...(task.attachments?.length > 0 ? [{ id: 'attachments', label: `Files (${task.attachments.length})`, icon: FileText }] : []),
                                            ].map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setActiveSection(id)}
                                                    className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold transition-colors relative ${activeSection === id
                                                        ? 'text-red-400'
                                                        : 'hover:text-white'
                                                        }`}
                                                    style={{ color: activeSection === id ? '#ef4444' : 'rgba(255,255,255,0.45)' }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" /> {label}
                                                    {activeSection === id && (
                                                        <motion.div layoutId="taskTab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Scrollable section content */}
                                        <div ref={taskDetailsRef} className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar">
                                            <AnimatePresence mode="wait">
                                                {activeSection === 'details' && (
                                                    <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/3 p-5 rounded-2xl border border-white/5 text-sm">
                                                            {task.description || task.desc || 'No description provided.'}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {activeSection === 'applicants' && (
                                                    <motion.div key="applicants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        {task.applicants?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {task.applicants.map((app, i) => (
                                                                    <ApplicantRow
                                                                        key={i}
                                                                        app={app}
                                                                        task={task}
                                                                        currentUser={currentUser}
                                                                        actionLoading={actionLoading}
                                                                        onAssign={handleAssign}
                                                                        onViewProfile={setSelectedUser}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-16">
                                                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                                                                <p className="text-gray-500 font-medium">No applicants yet</p>
                                                                <p className="text-gray-600 text-sm mt-1">Be the first to apply!</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {activeSection === 'attachments' && (
                                                    <motion.div key="attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {task.attachments?.map((file, i) => (
                                                                <div key={i} className="group relative aspect-video bg-black/40 rounded-xl border border-white/10 overflow-hidden">
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
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── Action Footer ── */}
                                        <div className="px-7 py-5 border-t border-white/5 bg-[#080808] flex-shrink-0">
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Applicant avatars */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {task.applicants?.slice(0, 4).map((app, i) => (
                                                            <img
                                                                key={i}
                                                                src={app.user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${i}`}
                                                                className="w-8 h-8 rounded-full border-2 border-[#080808] object-cover"
                                                                alt=""
                                                            />
                                                        ))}
                                                    </div>
                                                    {task.applicants?.length > 0 && (
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {task.applicants.length} applied
                                                        </span>
                                                    )}
                                                </div>

                                                {/* CTA buttons */}
                                                <div className="flex items-center gap-3">
                                                    {task.status === 'Open' && !isCreator && currentUser && (
                                                        hasApplied ? (
                                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm font-bold border border-white/10">
                                                                <CheckCircle className="w-4 h-4 text-green-400" /> Applied
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={handleApply}
                                                                disabled={actionLoading || (currentUser?.coins || 0) < 5}
                                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${(currentUser?.coins || 0) < 5
                                                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                                    : 'text-white hover:scale-105 hover:shadow-xl active:scale-95'
                                                                    }`}
                                                                style={(currentUser?.coins || 0) >= 5 ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.25)' } : {}}
                                                            >
                                                                {actionLoading
                                                                    ? <Loader className="w-4 h-4 animate-spin" />
                                                                    : <><ArrowRight className="w-4 h-4" /> Apply Now <span className="text-xs font-normal" style={{ color: 'rgba(255,200,200,0.7)' }}>(-5 coins)</span></>
                                                                }
                                                            </button>
                                                        )
                                                    )}

                                                    {task.status === 'In Progress' && (isAssigned || isCreator) && (
                                                        <button
                                                            onClick={handleComplete}
                                                            disabled={actionLoading}
                                                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 transition-all"
                                                        >
                                                            {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Mark Complete</>}
                                                        </button>
                                                    )}

                                                    {task.status === 'Completed' && (
                                                        <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 rounded-xl font-bold text-sm border border-green-500/20">
                                                            <CheckCircle className="w-4 h-4" /> Completed
                                                        </div>
                                                    )}

                                                    {!currentUser && task.status === 'Open' && (
                                                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm font-bold border border-white/10">
                                                            <Lock className="w-4 h-4" /> Login to Apply
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══════════════════════════════════════════════
                                        RIGHT PANEL — Chat (40%)
                                    ══════════════════════════════════════════════ */}
                                    <div className="hidden md:flex flex-[2] flex-col bg-[#070707]">
                                        {/* Chat header */}
                                        <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
                                                        <MessageSquare className="w-4 h-4" style={{ color: '#ef4444' }} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm">Discussion</h3>
                                                        <p className="text-[10px] text-gray-500">{task.chat?.length || 0} messages</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] text-gray-500 font-medium">Live</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                                            {(!task.chat || task.chat.length === 0) ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                                        <MessageSquare className="w-8 h-8 text-gray-600" />
                                                    </div>
                                                    <p className="text-gray-400 font-bold mb-1">No messages yet</p>
                                                    <p className="text-gray-600 text-sm">Start the discussion about this task</p>
                                                </div>
                                            ) : (
                                                task.chat.map((msg, i) => {
                                                    const isOwn = msg.user === currentUser?._id || msg.from === currentUser?.name;
                                                    return <ChatBubble key={i} msg={msg} isOwn={isOwn} />;
                                                })
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Chat input */}
                                        <div className="px-4 py-4 border-t border-white/5 flex-shrink-0">
                                            {currentUser ? (
                                                <form onSubmit={handleSendChat} className="flex gap-2 items-center">
                                                    <img
                                                        src={currentUser.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(currentUser.name)}`}
                                                        className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 object-cover"
                                                        alt=""
                                                    />
                                                    <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-colors" style={{ '--tw-ring-color': 'rgba(239,68,68,0.3)' }}
                                                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'}
                                                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={chatMessage}
                                                            onChange={e => setChatMessage(e.target.value)}
                                                            placeholder="Type a message..."
                                                            className="flex-1 bg-transparent text-white placeholder:text-gray-600 text-sm focus:outline-none"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!chatMessage.trim()}
                                                            className="p-1.5 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                                            style={{ background: '#ef4444' }}
                                                            onMouseEnter={e => { if (chatMessage.trim()) e.currentTarget.style.background = '#dc2626'; }}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="text-center py-3 text-xs text-gray-500 font-medium">
                                                    Login to join the discussion
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                    <p className="text-gray-500">Task not found</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </>
    );
};

export default TaskDetailModal;
