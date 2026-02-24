import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Search, MoreVertical, Info, ArrowLeft, Clock, Calendar, Award,
    Paperclip, Smile, Edit2, Trash2, Copy, Check, X, ChevronDown, CheckCheck,
    MessageCircle, MoreHorizontal
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';
import AuthModal from '../components/AuthModal';
import { formatTime, groupMessagesByDate, formatConversationDate } from '../utils/dateUtils';
import { WALLPAPERS } from './ChatSettings';

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '💯', '✨', '🙏🏻'];

const Chat = () => {
    const { user: currentUser } = useAuth();
    const chatSettings = currentUser?.chatSettings || {};
    const wallpaperKey = chatSettings.chatWallpaper || 'default';
    const wallpaperBg = WALLPAPERS[wallpaperKey]?.chatBg || WALLPAPERS.default.chatBg;
    const showReadReceipts = chatSettings.readReceipts !== false;
    const location = useLocation();

    const [selectedChat, setSelectedChat] = useState(() => {
        if (location.state?.user) {
            return {
                user: location.state.user,
                lastMessage: '',
                timestamp: new Date().toISOString(),
                isUnread: false,
                _id: 'temp_' + Date.now()
            };
        }
        return null;
    });

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(!selectedChat);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [following, setFollowing] = useState([]);
    const fileInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [messageMenuOpen, setMessageMenuOpen] = useState(null);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Socket & Typing state
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typerName, setTyperName] = useState('');
    const activeChatRef = useRef(selectedChat); // To access current chat in socket callbacks

    // Update ref when selectedChat changes
    useEffect(() => { activeChatRef.current = selectedChat; }, [selectedChat]);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isPollingRef = useRef(false);

    useEffect(() => {
        if (!currentUser) { setLoading(false); return; }
        const fetchChats = async () => {
            try {
                const response = await api.get('/messages');
                const fetchedConversations = response.data;
                setConversations(fetchedConversations);
                if (selectedChat && selectedChat._id.toString().startsWith('temp_')) {
                    const existingChat = fetchedConversations.find(c => c.user._id === selectedChat.user._id);
                    if (existingChat) setSelectedChat(existingChat);
                }
                if (location.state?.user) window.history.replaceState({}, document.title);
            } catch (error) { console.error('Error fetching conversations:', error); }
            finally { setLoading(false); }
        };
        fetchChats();
    }, [currentUser]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.user._id);
            setConversations(prev => prev.map(c => c.user._id === selectedChat.user._id ? { ...c, isUnread: false } : c));
            window.dispatchEvent(new Event('messages-read'));
        }
    }, [selectedChat?._id]);

    useEffect(() => {
        if (!currentUser) return;

        // Initialize Socket
        const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Connected to socket', socketRef.current.id);
            socketRef.current.emit('join_user_room', currentUser._id);
        });

        // Listen for typing events
        socketRef.current.on('user_typing', ({ senderId, senderName }) => {
            // Only show if we are currently chatting with this user
            if (activeChatRef.current && activeChatRef.current.user._id === senderId) {
                setTyperName(senderName);
                setIsTyping(true);
            }
        });

        socketRef.current.on('user_stop_typing', ({ senderId }) => {
            if (activeChatRef.current && activeChatRef.current.user._id === senderId) {
                setIsTyping(false);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [currentUser]);

    // Polling fallback (keep existing logic but reduce frequency if socket works?)
    // For now, keeping polling as backup
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(async () => {
            if (isPollingRef.current) return;
            isPollingRef.current = true;
            try {
                const res = await api.get('/messages');
                setConversations(prev => {
                    if (selectedChat && selectedChat._id.toString().startsWith('temp_')) {
                        return [selectedChat, ...res.data.filter(c => c.user._id !== selectedChat.user._id)];
                    }
                    return res.data;
                });
                // Only poll for messages if not typing (to avoid jitter)
                if (selectedChat && !isTyping) await fetchMessages(selectedChat.user._id, false);
            } catch (err) { console.error('Polling error:', err); }
            finally { isPollingRef.current = false; }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedChat, currentUser, isTyping]);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!currentUser?._id) return;
            try {
                const response = await api.get(`/users/${currentUser._id}/following`);
                setFollowing(response.data);
            } catch (error) { console.error('Error fetching following:', error); }
        };
        fetchFollowing();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) {
            setConversations([]); setFollowing([]); setSelectedChat(null);
            setMessages([]); setNewMessage(''); setSearchQuery('');
            setShowProfileModal(false); setShowInfoPanel(false);
        }
    }, [currentUser]);

    const allChats = useMemo(() => {
        const chats = [...conversations];
        const conversationUserIds = new Set(conversations.map(c => c.user?._id?.toString()));
        if (Array.isArray(following)) {
            following.forEach(user => {
                if (user && user._id && !conversationUserIds.has(user._id.toString())) {
                    chats.push({
                        _id: 'suggestion_' + user._id,
                        user: user,
                        lastMessage: 'Start a conversation',
                        timestamp: new Date().toISOString(),
                        isUnread: false,
                        isSuggestion: true
                    });
                }
            });
        }
        return chats;
    }, [conversations, following]);

    const filteredChats = useMemo(() => {
        if (!searchQuery) return allChats;
        return allChats.filter(c => c.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allChats, searchQuery]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
    };

    const fetchMessages = async (userId, showLoading = true) => {
        if (showLoading) setLoadingMessages(true);
        try {
            const response = await api.get(`/messages/${userId}`);
            setMessages(response.data);
        } catch (error) { console.error('Error fetching messages:', error); }
        finally { if (showLoading) setLoadingMessages(false); }
    };

    const handleSelectChat = (conversation) => {
        if (selectedChat && selectedChat.user._id === conversation.user._id) return;
        setSelectedChat(conversation);
        setShowInfoPanel(false);
        setIsTyping(false); // Reset typing state on chat switch
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setNewMessage(val);

        if (!selectedChat || !val.trim()) return;

        // Emit typing event (debounced)
        if (!typingTimeoutRef.current) {
            socketRef.current?.emit('typing', {
                recipientId: selectedChat.user._id,
                senderName: currentUser.name
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('stop_typing', { recipientId: selectedChat.user._id });
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        // Stop typing immediately when sending
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
            socketRef.current?.emit('stop_typing', { recipientId: selectedChat.user._id });
        }

        const tempMessage = { _id: Date.now(), sender: currentUser, content: newMessage, createdAt: new Date().toISOString(), pending: true };
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        try {
            const response = await api.post('/messages', { recipientId: selectedChat.user._id, content: tempMessage.content });
            setMessages(prev => prev.map(msg => msg._id === tempMessage._id ? response.data : msg));
            const chatsRes = await api.get('/messages');
            setConversations(chatsRes.data);
        } catch (error) { console.error('Error sending message:', error); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewMessage(`[Attached File: ${file.name}]`);
        setShowMenu(false);
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await api.post(`/messages/${messageId}/react`, { emoji });
            if (selectedChat) fetchMessages(selectedChat.user._id, false);
        } catch (err) { console.error('Failed to add reaction', err); }
    };

    const handleEditMessage = async (messageId) => {
        if (!editingText.trim()) return;
        try {
            await api.put(`/messages/${messageId}`, { content: editingText });
            if (selectedChat) fetchMessages(selectedChat.user._id, false);
            setEditingMessageId(null); setEditingText('');
        } catch (err) { console.error('Failed to edit message', err); }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/messages/${messageId}`);
            if (selectedChat) fetchMessages(selectedChat.user._id, false);
            setDeleteConfirm(null);
        } catch (err) { console.error('Failed to delete message', err); }
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(text);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    // ── Loading / Guest ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center px-6" style={{ background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
                        <MessageCircle className="w-9 h-9" style={{ color: 'rgba(251,146,60,0.6)' }} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Messages</h2>
                    <p className="text-sm font-light mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>Login to send and receive messages.</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-3.5 text-white font-bold rounded-xl text-sm transition-all"
                        style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}
                    >
                        Login to Message
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    return (
        <>
            {/* ── Delete Confirm ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="p-6 rounded-2xl max-w-sm w-full"
                            style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.15)' }}>
                                    <Trash2 className="w-5 h-5" style={{ color: 'rgba(252,165,165,0.7)' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Delete Message?</h3>
                                    <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.60)' }}>This action cannot be undone.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>Cancel</button>
                                <button onClick={() => handleDeleteMessage(deleteConfirm)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: 'rgba(252,165,165,0.12)', border: '1px solid rgba(252,165,165,0.2)' }}>Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Main Layout ── */}
            <div className="pt-20 min-h-screen" style={{ background: '#050505' }}>
                <div className="container mx-auto px-4 pb-8 max-w-7xl h-[calc(100vh-5rem)]">
                    <div
                        className="rounded-2xl overflow-hidden h-[88vh] flex"
                        style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {/* ── Sidebar ── */}
                        <div className={`${selectedChat && isMobileView ? 'hidden' : 'flex'} w-full md:w-80 lg:w-72 flex-col`}
                            style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>

                            {/* Sidebar header */}
                            <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-black text-white">Messages</h2>
                                    {conversations.filter(c => c.isUnread).length > 0 && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(251,146,60,0.3)' }}>
                                            {conversations.filter(c => c.isUnread).length}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.50)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    />
                                </div>
                            </div>

                            {/* Conversation list */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredChats.length > 0 ? (
                                    filteredChats.map(chat => (
                                        <div
                                            key={chat._id}
                                            onClick={() => handleSelectChat(chat)}
                                            className="flex items-center gap-3 p-4 cursor-pointer transition-all"
                                            style={{
                                                background: selectedChat?.user._id === chat.user._id ? 'rgba(251,146,60,0.06)' : 'transparent',
                                                borderLeft: selectedChat?.user._id === chat.user._id ? '2px solid rgba(251,146,60,0.4)' : '2px solid transparent',
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            }}
                                            onMouseEnter={e => { if (selectedChat?.user._id !== chat.user._id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                            onMouseLeave={e => { if (selectedChat?.user._id !== chat.user._id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={chat.user.avatar}
                                                    alt={chat.user.name}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                                                    onClick={e => { e.stopPropagation(); handleSelectChat(chat); setShowProfileModal(true); }}
                                                />
                                                {chat.isUnread && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(251,146,60,0.8)', border: '2px solid #0a0a0a' }} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className={`text-sm font-${chat.isUnread ? 'bold' : 'medium'} truncate`} style={{ color: chat.isUnread ? 'white' : 'rgba(255,255,255,0.6)' }}>
                                                        {chat.user.name}
                                                    </h3>
                                                    <span className="text-[10px] font-light ml-2 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        {chat.isSuggestion ? '' : formatConversationDate(chat.timestamp)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs truncate font-light ${chat.isSuggestion ? 'italic' : ''}`}
                                                    style={{ color: chat.isUnread ? 'rgba(255,255,255,0.5)' : chat.isSuggestion ? 'rgba(251,146,60,0.5)' : 'rgba(255,255,255,0.50)' }}>
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <Send className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.08)' }} />
                                        <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>No conversations yet.</p>
                                        <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.12)' }}>Follow users to see them here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Chat Window ── */}
                        <div className={`${!selectedChat && isMobileView ? 'hidden' : 'flex'} flex-1 flex-col`} style={{ background: '#050505' }}>
                            {selectedChat ? (
                                <>
                                    {/* Chat header */}
                                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
                                        <div className="flex items-center gap-3">
                                            {isMobileView && (
                                                <button onClick={() => setSelectedChat(null)} className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => setShowProfileModal(true)}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={selectedChat.user.avatar}
                                                        alt={selectedChat.user.name}
                                                        className="w-9 h-9 rounded-xl object-cover transition-all"
                                                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                                                    />
                                                    {selectedChat.user.isOnline && (
                                                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full" style={{ background: 'rgba(74,222,128,0.8)', border: '2px solid #0a0a0a' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm transition-colors group-hover:text-orange-400">{selectedChat.user.name}</h3>
                                                    {selectedChat.user.isOnline && (
                                                        <span className="text-[10px] font-light" style={{ color: 'rgba(74,222,128,0.6)' }}>Online</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowInfoPanel(!showInfoPanel)}
                                            className="p-2 rounded-xl transition-all"
                                            style={{
                                                background: showInfoPanel ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${showInfoPanel ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.07)'}`,
                                                color: showInfoPanel ? 'rgba(251,146,60,0.7)' : 'rgba(255,255,255,0.60)',
                                            }}
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-1 overflow-hidden">
                                        {/* Messages area */}
                                        <div ref={chatContainerRef} className={`flex-1 overflow-y-auto p-5 space-y-4 ${wallpaperBg}`} style={{ background: wallpaperBg === WALLPAPERS.default.chatBg ? '#050505' : undefined }}>
                                            {loadingMessages ? (
                                                <div className="flex justify-center py-10">
                                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                                                </div>
                                            ) : (
                                                <>
                                                    {Object.entries(groupMessagesByDate(messages)).map(([dateLabel, groupMessages]) => (
                                                        <React.Fragment key={dateLabel}>
                                                            <div className="text-center py-3">
                                                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.50)' }}>
                                                                    {dateLabel}
                                                                </span>
                                                            </div>
                                                            {groupMessages.map((msg, index) => {
                                                                const isOwn = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                                                                const isEditing = editingMessageId === msg._id;
                                                                const isMenuOpen = messageMenuOpen === msg._id;
                                                                const messageAge = new Date() - new Date(msg.createdAt);
                                                                const isEditableTime = messageAge < 15 * 60 * 1000;

                                                                return (
                                                                    <motion.div
                                                                        key={msg._id || index}
                                                                        initial={{ opacity: 0, y: 8 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group relative`}
                                                                    >
                                                                        <div className={`flex items-end gap-1 max-w-[72%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                            {/* Message menu */}
                                                                            {!isEditing && (
                                                                                <div className="relative flex items-center">
                                                                                    <button
                                                                                        onClick={() => setMessageMenuOpen(isMenuOpen ? null : msg._id)}
                                                                                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        style={{ color: 'rgba(255,255,255,0.60)' }}
                                                                                    >
                                                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <AnimatePresence>
                                                                                        {isMenuOpen && (
                                                                                            <>
                                                                                                <div className="fixed inset-0 z-10" onClick={() => setMessageMenuOpen(null)} />
                                                                                                <motion.div
                                                                                                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                                                                                    className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 rounded-xl py-1 z-20 min-w-[150px]`}
                                                                                                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                                                                                                >
                                                                                                    {[
                                                                                                        { label: 'React', icon: Smile, action: () => { setReactionPickerMessageId(msg._id); setMessageMenuOpen(null); } },
                                                                                                        { label: 'Copy', icon: Copy, action: () => { handleCopyMessage(msg.content); setMessageMenuOpen(null); } },
                                                                                                        ...(isOwn && isEditableTime ? [{ label: 'Edit', icon: Edit2, action: () => { setEditingMessageId(msg._id); setEditingText(msg.content); setMessageMenuOpen(null); } }] : []),
                                                                                                        ...(isOwn ? [{ label: 'Delete', icon: Trash2, action: () => { setDeleteConfirm(msg._id); setMessageMenuOpen(null); }, danger: true }] : []),
                                                                                                    ].map(({ label, icon: Icon, action, danger }) => (
                                                                                                        <button
                                                                                                            key={label}
                                                                                                            onClick={action}
                                                                                                            className="w-full px-4 py-2 text-left text-xs flex items-center gap-3 transition-all"
                                                                                                            style={{ color: danger ? 'rgba(252,165,165,0.7)' : 'rgba(255,255,255,0.5)' }}
                                                                                                            onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(252,165,165,0.05)' : 'rgba(255,255,255,0.04)'; }}
                                                                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                                                                        >
                                                                                                            <Icon className="w-3.5 h-3.5" />{label}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </motion.div>
                                                                                            </>
                                                                                        )}
                                                                                    </AnimatePresence>
                                                                                </div>
                                                                            )}

                                                                            {/* Message bubble */}
                                                                            <div className="flex-1 min-w-0">
                                                                                {isEditing ? (
                                                                                    <div className="flex gap-1 items-center p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(251,146,60,0.3)' }}>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={editingText}
                                                                                            onChange={e => setEditingText(e.target.value)}
                                                                                            onKeyPress={e => e.key === 'Enter' && handleEditMessage(msg._id)}
                                                                                            className="flex-1 px-2 py-1 bg-transparent outline-none text-sm text-white"
                                                                                            autoFocus
                                                                                        />
                                                                                        <button onClick={() => handleEditMessage(msg._id)} className="p-1 rounded-lg" style={{ background: 'rgba(251,146,60,0.2)' }}>
                                                                                            <Check className="w-3 h-3 text-orange-400" />
                                                                                        </button>
                                                                                        <button onClick={() => setEditingMessageId(null)} className="p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                                                            <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative">
                                                                                        <div
                                                                                            className={`rounded-2xl px-4 py-3 ${isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                                                                            style={isOwn
                                                                                                ? { background: 'rgba(251,146,60,0.18)', border: '1px solid rgba(251,146,60,0.25)' }
                                                                                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }
                                                                                            }
                                                                                        >
                                                                                            <p className="text-sm leading-relaxed font-light" style={{ color: isOwn ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)' }}>
                                                                                                {msg.content}
                                                                                            </p>
                                                                                            {msg.edited && (
                                                                                                <div className="text-[9px] mt-0.5 italic" style={{ color: 'rgba(255,255,255,0.50)' }}>(edited)</div>
                                                                                            )}

                                                                                            {/* Reactions */}
                                                                                            {msg.reactions && msg.reactions.length > 0 && (
                                                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                                    {Object.entries(
                                                                                                        msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
                                                                                                    ).map(([emoji, count]) => (
                                                                                                        <button
                                                                                                            key={emoji}
                                                                                                            onClick={() => handleReaction(msg._id, emoji)}
                                                                                                            className="px-1.5 py-0.5 rounded-full text-xs transition-all"
                                                                                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                                                                                                        >
                                                                                                            {emoji} {count}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}

                                                                                            <div className="text-[10px] mt-1.5 flex items-center justify-end gap-1" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                                {isOwn && showReadReceipts && (
                                                                                                    <span>{msg.pending ? <Clock className="w-3 h-3 inline" /> : <CheckCheck className="w-3 h-3 inline" />}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Emoji reaction picker */}
                                                                                        <AnimatePresence>
                                                                                            {reactionPickerMessageId === msg._id && (
                                                                                                <>
                                                                                                    <div className="fixed inset-0 z-10" onClick={() => setReactionPickerMessageId(null)} />
                                                                                                    <motion.div
                                                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                                                                        className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-12 rounded-xl p-1.5 flex gap-1 z-20`}
                                                                                                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                                                                                                    >
                                                                                                        {EMOJI_OPTIONS.map(emoji => (
                                                                                                            <button
                                                                                                                key={emoji}
                                                                                                                onClick={() => { handleReaction(msg._id, emoji); setReactionPickerMessageId(null); }}
                                                                                                                className="p-1 rounded-lg transition-all text-base w-8 h-8 flex items-center justify-center"
                                                                                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                                                                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                                                                            >
                                                                                                                {emoji}
                                                                                                            </button>
                                                                                                        ))}
                                                                                                    </motion.div>
                                                                                                </>
                                                                                            )}
                                                                                        </AnimatePresence>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    ))}
                                                </>
                                            )}
                                            <div ref={messagesEndRef} />
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Typing Indicator Overlay */}
                                        <AnimatePresence>
                                            {isTyping && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute bottom-[80px] left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full"
                                                    style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
                                                >
                                                    <div className="flex gap-1">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                                            className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                                        />
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                                            className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                                        />
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                                            className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-white/70">
                                                        {typerName} is typing...
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Info panel */}
                                        <AnimatePresence>
                                            {showInfoPanel && (
                                                <motion.div
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{ width: 280, opacity: 1 }}
                                                    exit={{ width: 0, opacity: 0 }}
                                                    className="overflow-hidden hidden lg:block"
                                                    style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}
                                                >
                                                    <div className="w-[280px] p-5 h-full overflow-y-auto">
                                                        <div className="text-center mb-6">
                                                            <img
                                                                src={selectedChat.user.avatar}
                                                                alt={selectedChat.user.name}
                                                                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3"
                                                                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                                                            />
                                                            <h2 className="text-base font-black text-white">{selectedChat.user.name}</h2>
                                                            <p className="text-xs font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{selectedChat.user.email}</p>
                                                        </div>

                                                        {selectedChat.user.bio && (
                                                            <div className="mb-5">
                                                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.50)' }}>About</p>
                                                                <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{selectedChat.user.bio}</p>
                                                            </div>
                                                        )}

                                                        <div className="mb-5">
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.50)' }}>Stats</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[
                                                                    { label: 'XP', value: selectedChat.user.xp || 0 },
                                                                    { label: 'Level', value: Math.floor((selectedChat.user.xp || 0) / 500) + 1 },
                                                                ].map(({ label, value }) => (
                                                                    <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <p className="font-black text-white text-sm">{value}</p>
                                                                        <p className="text-[10px] font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{label}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.50)' }}>Timeline</p>
                                                            <div className="space-y-4 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                                                                {[
                                                                    { label: 'Joined ElevateX', date: selectedChat.user.createdAt || Date.now(), icon: Award },
                                                                    { label: 'Connected with you', date: selectedChat.timestamp, icon: Clock },
                                                                ].map(({ label, date, icon: Icon }) => (
                                                                    <div key={label} className="relative">
                                                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full" style={{ background: '#050505', border: '1px solid rgba(251,146,60,0.3)' }} />
                                                                        <p className="text-xs font-semibold text-white">{label}</p>
                                                                        <p className="text-[10px] font-light flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                                            <Icon className="w-3 h-3" />
                                                                            {new Date(date).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Input area */}
                                    <form onSubmit={handleSendMessage} className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
                                        <div className="flex items-center gap-3">
                                            {/* Attachment */}
                                            <div className="relative">
                                                {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMenu(!showMenu)}
                                                    className="p-2 rounded-xl transition-all relative z-20"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)' }}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                <AnimatePresence>
                                                    {showMenu && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                                            className="absolute bottom-full left-0 mb-2 w-44 rounded-xl py-1 z-20"
                                                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}
                                                                className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 transition-all"
                                                                style={{ color: 'rgba(255,255,255,0.5)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                            >
                                                                <Paperclip className="w-3.5 h-3.5" /> Upload File
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                            </div>

                                            {/* Text input */}
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={handleInput}
                                                    placeholder="Type a message..."
                                                    className="w-full py-3 pl-4 pr-20 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1 transition-all"
                                                    style={{ color: 'rgba(255,255,255,0.50)' }}
                                                >
                                                    <Smile className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-0 disabled:scale-75"
                                                    style={{ background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.3)', color: 'rgba(251,146,60,0.8)' }}
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Emoji picker */}
                                        {showEmojiPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 p-2 rounded-xl flex gap-1"
                                                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                                            >
                                                {EMOJI_OPTIONS.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
                                                        className="p-2 rounded-lg transition-all text-base"
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Send className="w-9 h-9" style={{ color: 'rgba(251,146,60,0.3)' }} />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">Your Messages</h3>
                                    <p className="text-sm font-light max-w-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        Select a conversation or visit a user's profile to start chatting.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedChat && showProfileModal && (
                <UserProfileModal user={selectedChat.user} isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
            )}
        </>
    );
};

export default Chat;
