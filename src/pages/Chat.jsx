import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Info, ArrowLeft, Clock, Calendar, Award, Paperclip, Smile, Edit2, Trash2, Copy, Check, X, ChevronDown, CheckCheck, Code, Zap, Coffee, Music, Sun, Cloud, Flag, Bookmark, Compass, Rocket, Cpu, Globe, Layers, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';
import AuthModal from '../components/AuthModal';

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '💯', '✨','🙏🏻'];

const Chat = () => {
    const { user: currentUser } = useAuth();
    const location = useLocation();

    // Initialize selectedChat from location state if available (Optimistic UI)
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
    const [loading, setLoading] = useState(!selectedChat); // Only show full loader if no chat selected initially
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

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent overlapping polls
    const isPollingRef = useRef(false);

    // Initial fetch of conversations
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchChats = async () => {
            try {
                const response = await api.get('/messages');
                const fetchedConversations = response.data;
                setConversations(fetchedConversations);

                // If we have a selected chat (from navigation), try to match it with existing one
                if (selectedChat && selectedChat._id.toString().startsWith('temp_')) {
                    const existingChat = fetchedConversations.find(c => c.user._id === selectedChat.user._id);
                    if (existingChat) {
                        setSelectedChat(existingChat);
                    }
                }

                // Clear location state to prevent reopening on refresh
                if (location.state?.user) {
                    window.history.replaceState({}, document.title);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [currentUser]); // Re-run when currentUser changes (login/logout)

    // Fetch messages when selectedChat changes
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.user._id);
            // Mark as read in local state
            setConversations(prev =>
                prev.map(c => c.user._id === selectedChat.user._id ? { ...c, isUnread: false } : c)
            );

            // Trigger navbar to update unread count immediately
            window.dispatchEvent(new Event('messages-read'));
        }
    }, [selectedChat?._id]); // Only re-run if chat ID changes

    // Polling
    useEffect(() => {
        if (!currentUser) return; // Don't poll if not logged in

        const interval = setInterval(async () => {
            if (isPollingRef.current) return;
            isPollingRef.current = true;

            try {
                // Poll conversations
                const res = await api.get('/messages');
                setConversations(prev => {
                    // Preserve selected chat state if it's temp
                    if (selectedChat && selectedChat._id.toString().startsWith('temp_')) {
                        return [selectedChat, ...res.data.filter(c => c.user._id !== selectedChat.user._id)];
                    }
                    return res.data;
                });

                // Poll messages if chat is open
                if (selectedChat) {
                    await fetchMessages(selectedChat.user._id, false);
                }
            } catch (err) {
                console.error('Polling error:', err);
            } finally {
                isPollingRef.current = false;
            }
        }, 5000); // Poll every 5 seconds for better responsiveness, but safely

        return () => clearInterval(interval);
    }, [selectedChat, currentUser]);

    // Fetch following users
    useEffect(() => {
        const fetchFollowing = async () => {
            if (!currentUser?._id) return;
            try {
                const response = await api.get(`/users/${currentUser._id}/following`);
                setFollowing(response.data);
            } catch (error) {
                console.error('Error fetching following:', error);
            }
        };

        fetchFollowing();
    }, [currentUser]);

    // Clear all state when user logs out
    useEffect(() => {
        if (!currentUser) {
            setConversations([]);
            setFollowing([]);
            setSelectedChat(null);
            setMessages([]);
            setNewMessage('');
            setSearchQuery('');
            setShowProfileModal(false);
            setShowInfoPanel(false);
        }
    }, [currentUser]);

    // Merge conversations and following
    const allChats = useMemo(() => {
        const chats = [...conversations];
        const conversationUserIds = new Set(conversations.map(c => c.user?._id?.toString()));

        if (Array.isArray(following)) {
            following.forEach(user => {
                // Ensure user exists and is not already in conversations
                if (user && user._id && !conversationUserIds.has(user._id.toString())) {
                    chats.push({
                        _id: 'suggestion_' + user._id,
                        user: user,
                        lastMessage: 'Start a conversation',
                        timestamp: new Date().toISOString(), // Use current time for sorting/display safety
                        isUnread: false,
                        isSuggestion: true
                    });
                }
            });
        }
        return chats;
    }, [conversations, following]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const fetchMessages = async (userId, showLoading = true) => {
        if (showLoading) setLoadingMessages(true);
        try {
            const response = await api.get(`/messages/${userId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (showLoading) setLoadingMessages(false);
        }
    };

    const handleSelectChat = (conversation) => {
        if (selectedChat && selectedChat.user._id === conversation.user._id) return;
        setSelectedChat(conversation);
        setShowInfoPanel(false);
        // fetchMessages is triggered by useEffect
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const tempMessage = {
            _id: Date.now(),
            sender: currentUser,
            content: newMessage,
            createdAt: new Date().toISOString(),
            pending: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const response = await api.post('/messages', {
                recipientId: selectedChat.user._id,
                content: tempMessage.content
            });

            setMessages(prev => prev.map(msg =>
                msg._id === tempMessage._id ? response.data : msg
            ));

            // Refresh conversations to update last message
            const chatsRes = await api.get('/messages');
            setConversations(chatsRes.data);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simulate file attachment by adding to message
        setNewMessage(`[Attached File: ${file.name}]`);
        setShowMenu(false);
        // Focus input
        setTimeout(() => {
            const input = document.querySelector('input[type="text"]');
            if (input) input.focus();
        }, 100);
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await api.post(`/messages/${messageId}/react`, { emoji });
            // Refresh messages
            if (selectedChat) {
                fetchMessages(selectedChat.user._id, false);
            }
        } catch (err) {
            console.error("Failed to add reaction", err);
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editingText.trim()) return;

        try {
            await api.put(`/messages/${messageId}`, { content: editingText });
            // Refresh messages
            if (selectedChat) {
                fetchMessages(selectedChat.user._id, false);
            }
            setEditingMessageId(null);
            setEditingText('');
        } catch (err) {
            console.error("Failed to edit message", err);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/messages/${messageId}`);
            // Refresh messages
            if (selectedChat) {
                fetchMessages(selectedChat.user._id, false);
            }
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


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Messages</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Log in to message</p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all"
                    >
                        Log in to message
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    return (
        <>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

            <div className="pt-24 min-h-screen container mx-auto px-4 pb-8 max-w-7xl h-[calc(100vh-2rem)] relative">
                {/* Doodle Pattern Overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { Icon: Code, top: '10%', left: '10%' },
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
                            className="absolute text-gray-900/5 dark:text-white/10"
                            style={{ top, left }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
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

                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden h-[85vh] flex relative z-10">

                    {/* Conversations List */}
                    <div className={`${selectedChat && isMobileView ? 'hidden' : 'block'} w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-white/10 flex flex-col`}>
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                Messages <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">{conversations.filter(c => c.isUnread).length}</span>
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {allChats.length > 0 ? (
                                allChats.map((chat) => (
                                    <div
                                        key={chat._id}
                                        className={`p-4 flex items-center gap-3 transition-all border-b border-gray-100 dark:border-white/5 ${selectedChat?.user._id === chat.user._id
                                            ? 'bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-l-yellow-500'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-l-transparent'
                                            }`}
                                    >
                                        {/* Avatar - Click to open profile */}
                                        <div
                                            className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectChat(chat);
                                                setShowProfileModal(true);
                                            }}
                                        >
                                            <img
                                                src={chat.user.avatar}
                                                alt={chat.user.name}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10"
                                            />
                                            {chat.isUnread && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
                                            )}
                                        </div>

                                        {/* Chat info - Click to open chat */}
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => handleSelectChat(chat)}
                                        >
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-semibold truncate ${chat.isUnread ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {chat.user.name}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {chat.isSuggestion ? '' : new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${chat.isUnread ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'} ${chat.isSuggestion ? 'italic text-yellow-600 dark:text-yellow-500' : ''}`}>
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Send className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="font-semibold mb-2">No conversations yet.</p>
                                    <p className="text-sm">Start chatting by visiting a user's profile!</p>
                                    <p className="text-xs mt-2 text-gray-400">Tip: Follow users to see them as suggestions here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`${!selectedChat && isMobileView ? 'hidden' : 'block'} flex-1 flex flex-col bg-gray-50 dark:bg-[#0f0f0f] relative`}>
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 flex items-center justify-between shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        {isMobileView && (
                                            <button onClick={() => setSelectedChat(null)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
                                            onClick={() => setShowProfileModal(true)}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={selectedChat.user.avatar}
                                                    alt={selectedChat.user.name}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-yellow-500 transition-all"
                                                />
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                                                    {selectedChat.user.name}
                                                </h3>
                                                <span className="text-xs text-green-500 flex items-center gap-1">
                                                    Online
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
                                        <button
                                            onClick={() => setShowInfoPanel(!showInfoPanel)}
                                            className={`p-2 rounded-full transition-colors ${showInfoPanel ? 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                        >
                                            <Info className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-1 overflow-hidden">
                                    {/* Messages Area */}
                                    <div
                                        ref={chatContainerRef}
                                        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-3xl relative"
                                    >
                                        {/* Doodle Pattern Overlay for Chat */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            {[
                                                { Icon: Code, top: '10%', left: '10%' },
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
                                                    className="absolute text-gray-900/10 dark:text-white/10"
                                                    style={{ top, left }}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{
                                                        opacity: [0.2, 0.4, 0.2],
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
                                        {loadingMessages ? (
                                            <div className="flex justify-center py-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-center py-4">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Today</p>
                                                </div>
                                                {messages.map((msg, index) => {
                                                    const isOwn = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                                                    const isEditing = editingMessageId === msg._id;
                                                    const isMenuOpen = messageMenuOpen === msg._id;

                                                    // Check if message is within 15 minutes (editable window)
                                                    const messageAge = new Date() - new Date(msg.createdAt);
                                                    const isEditableTime = messageAge < 15 * 60 * 1000; // 15 minutes in milliseconds

                                                    return (
                                                        <motion.div
                                                            key={msg._id || index}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group relative`}
                                                        >
                                                            <div className={`flex items-end gap-1 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                {/* Message Menu Icon - WhatsApp Style */}
                                                                {!isEditing && (
                                                                    <div className="relative flex items-center">
                                                                        <button
                                                                            onClick={() => setMessageMenuOpen(isMenuOpen ? null : msg._id)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <ChevronDown className="w-4 h-4" />
                                                                        </button>

                                                                        {/* Dropdown Menu */}
                                                                        <AnimatePresence>
                                                                            {isMenuOpen && (
                                                                                <>
                                                                                    {/* Backdrop to close menu */}
                                                                                    <div
                                                                                        className="fixed inset-0 z-10"
                                                                                        onClick={() => setMessageMenuOpen(null)}
                                                                                    />
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                        className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-white/10 py-1 z-20 min-w-[160px]`}
                                                                                    >
                                                                                        {/* React Option */}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setReactionPickerMessageId(msg._id);
                                                                                                setMessageMenuOpen(null);
                                                                                            }}
                                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3"
                                                                                        >
                                                                                            <Smile className="w-4 h-4" />
                                                                                            <span>React</span>
                                                                                        </button>

                                                                                        {/* Copy Option */}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleCopyMessage(msg.content);
                                                                                                setMessageMenuOpen(null);
                                                                                            }}
                                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3"
                                                                                        >
                                                                                            <Copy className="w-4 h-4" />
                                                                                            <span>Copy</span>
                                                                                        </button>

                                                                                        {/* Edit Option - Only for own messages within 15 minutes */}
                                                                                        {isOwn && isEditableTime && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setEditingMessageId(msg._id);
                                                                                                    setEditingText(msg.content);
                                                                                                    setMessageMenuOpen(null);
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3"
                                                                                            >
                                                                                                <Edit2 className="w-4 h-4" />
                                                                                                <span>Edit</span>
                                                                                            </button>
                                                                                        )}

                                                                                        {/* Delete Option - Only for own messages */}
                                                                                        {isOwn && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setDeleteConfirm(msg._id);
                                                                                                    setMessageMenuOpen(null);
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                                <span>Delete</span>
                                                                                            </button>
                                                                                        )}
                                                                                    </motion.div>
                                                                                </>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                )}

                                                                {/* Message Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    {isEditing ? (
                                                                        <div className="flex gap-1 items-center p-1 bg-white dark:bg-white/10 rounded-xl border border-yellow-500">
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
                                                                                className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex-shrink-0"
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
                                                                        <div className="relative">
                                                                            <div className={`rounded-2xl px-5 py-3 shadow-sm ${isOwn
                                                                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-tr-none'
                                                                                : 'bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-white/5'
                                                                                }`}>
                                                                                <p className="leading-relaxed">{msg.content}</p>
                                                                                {msg.edited && (
                                                                                    <div className={`text-[9px] mt-0.5 italic ${isOwn ? 'text-yellow-200' : 'text-gray-400'}`}>
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

                                                                                <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isOwn ? 'text-yellow-100' : 'text-gray-400'}`}>
                                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    {isOwn && (
                                                                                        <span>{msg.pending ? <Clock className="w-3 h-3 inline" /> : <CheckCheck className="w-3 h-3 inline" />}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Emoji Reaction Picker - Shows when React is clicked */}
                                                                            <AnimatePresence>
                                                                                {reactionPickerMessageId === msg._id && (
                                                                                    <>
                                                                                        <div
                                                                                            className="fixed inset-0 z-10"
                                                                                            onClick={() => setReactionPickerMessageId(null)}
                                                                                        />
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                                                            className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-12 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-white/10 p-1.5 flex gap-1 z-20`}
                                                                                        >
                                                                                            {EMOJI_OPTIONS.map(emoji => (
                                                                                                <button
                                                                                                    key={emoji}
                                                                                                    onClick={() => {
                                                                                                        handleReaction(msg._id, emoji);
                                                                                                        setReactionPickerMessageId(null);
                                                                                                    }}
                                                                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-base w-8 h-8 flex items-center justify-center"
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
                                            </>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Info Panel (Timeline) */}
                                    <AnimatePresence>
                                        {showInfoPanel && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 320, opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden hidden lg:block"
                                            >
                                                <div className="w-80 p-6 h-full overflow-y-auto">
                                                    <div className="text-center mb-6">
                                                        <img
                                                            src={selectedChat.user.avatar}
                                                            alt={selectedChat.user.name}
                                                            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-yellow-500/20"
                                                        />
                                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedChat.user.name}</h2>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedChat.user.email}</p>
                                                    </div>

                                                    <div className="mb-6">
                                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">About</h3>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                            {selectedChat.user.bio || "No bio available."}
                                                        </p>
                                                    </div>

                                                    <div className="mb-6">
                                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-center">
                                                                <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                                                                <p className="font-bold text-gray-900 dark:text-white">{selectedChat.user.xp || 0}</p>
                                                                <p className="text-xs text-gray-500">XP</p>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-center">
                                                                <div className="w-5 h-5 text-yellow-500 mx-auto mb-1 font-bold">Lvl</div>
                                                                <p className="font-bold text-gray-900 dark:text-white">{Math.floor((selectedChat.user.xp || 0) / 500) + 1}</p>
                                                                <p className="text-xs text-gray-500">Level</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
                                                        <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 dark:border-white/5">
                                                            <div className="relative">
                                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-500 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Joined ElevateX</p>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(selectedChat.user.createdAt || Date.now()).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="relative">
                                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Connected with you</p>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(selectedChat.timestamp).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-white/10 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {showMenu && (
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowMenu(false)}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowMenu(!showMenu)}
                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative z-20"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            <AnimatePresence>
                                                {showMenu && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-20"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                fileInputRef.current?.click();
                                                                setShowMenu(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                                        >
                                                            <Paperclip className="w-4 h-4" />
                                                            Upload File
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="w-full bg-gray-100 dark:bg-[#252525] border-none rounded-2xl py-3 pl-4 pr-24 focus:ring-2 focus:ring-yellow-500 dark:text-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            >
                                                <Smile className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all disabled:opacity-0 disabled:scale-75"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

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
                                                    type="button"
                                                    onClick={() => {
                                                        setNewMessage(prev => prev + emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-lg"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-gray-50 dark:bg-[#0f0f0f]">
                                <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
                                    <Send className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
                                    Select a conversation from the list or visit a user's profile to start a new chat.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Modal */}
                {
                    selectedChat && showProfileModal && (
                        <UserProfileModal
                            user={selectedChat.user}
                            isOpen={showProfileModal}
                            onClose={() => setShowProfileModal(false)}
                        />
                    )
                }
            </div>
        </>
    );
};

export default Chat;
