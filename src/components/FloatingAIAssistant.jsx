import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
    Bot, Sparkles, X, Send, CornerUpLeft, MessageSquare, 
    Loader, Trash2, Plus, ChevronRight, AlertCircle, History, Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const FloatingAIAssistant = ({ dragConstraints }) => {
    const { currentUser, getUserProfile } = useAuth();
    const userProfile = getUserProfile() || currentUser;
    const navigate = useNavigate();


    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const width = isMobile ? 'calc(100vw - 32px)' : '380px';
    const panelHeight = isMobile ? '420px' : '550px';
    const containerHeight = isMobile ? '490px' : '618px';

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('chat'); // 'chat' or 'history'
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingChats, setFetchingChats] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const [quotedMessage, setQuotedMessage] = useState(null);

    const chatContainerRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const dragControls = useDragControls();

    // Fetch conversation list on mount & when widget is opened
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchConversations();
        }
    }, [isOpen, currentUser]);

    // Fetch messages when activeId changes
    useEffect(() => {
        if (activeId && isOpen && currentUser) {
            fetchMessages(activeId);
            scrollToBottom('auto');
        } else {
            setMessages([]);
        }
    }, [activeId, isOpen, currentUser]);

    // Scroll to bottom on new messages or loading states
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('smooth');
        }
    }, [messages, loading]);

    const scrollToBottom = (behavior = 'smooth') => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 50);
    };

    const fetchConversations = async () => {
        setFetchingChats(true);
        setError(null);
        try {
            const res = await api.get('/assistant/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Fetch chats error:', err);
            setError('Failed to load chat history.');
        } finally {
            setFetchingChats(false);
        }
    };

    const fetchMessages = async (id) => {
        setFetchingMessages(true);
        setError(null);
        try {
            const res = await api.get(`/assistant/conversations/${id}`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error('Fetch messages error:', err);
            setError('Failed to load messages.');
        } finally {
            setFetchingMessages(false);
        }
    };

    const handleCreateChat = async (initialQuery = null) => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.post('/assistant/conversations');
            const newChat = res.data;
            
            setConversations(prev => [
                {
                    _id: newChat._id,
                    title: newChat.title,
                    updatedAt: newChat.updatedAt,
                    messageCount: 0,
                    lastMessage: ''
                },
                ...prev
            ]);
            
            setActiveId(newChat._id);
            setMessages([]);
            setView('chat');

            if (initialQuery) {
                await sendMessage(newChat._id, initialQuery);
            }
        } catch (err) {
            console.error('Create chat error:', err);
            setError('Failed to start a new chat.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChat = async (id, e) => {
        e.stopPropagation();
        setError(null);
        try {
            await api.delete(`/assistant/conversations/${id}`);
            setConversations(prev => prev.filter(c => c._id !== id));
            
            if (activeId === id) {
                const remaining = conversations.filter(c => c._id !== id);
                if (remaining.length > 0) {
                    setActiveId(remaining[0]._id);
                } else {
                    setActiveId(null);
                }
            }
        } catch (err) {
            console.error('Delete chat error:', err);
            setError('Failed to delete chat.');
        }
    };

    const sendMessage = async (chatId, textToSend) => {
        const text = textToSend || inputText;
        if (!text || text.trim() === '') return;

        setInputText('');
        setLoading(true);
        setError(null);

        let contentToSend = text;
        if (quotedMessage) {
            contentToSend = `Regarding your statement: "${quotedMessage.content}"\n\nQuestion: ${text}`;
            setQuotedMessage(null);
        }

        const tempUserMessage = {
            role: 'user',
            content: text,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const res = await api.post(`/assistant/conversations/${chatId}/chat`, { content: contentToSend });
            
            if (res.data && res.data.conversation) {
                setMessages(res.data.conversation.messages);
                setConversations(prev => prev.map(c => {
                    if (c._id === chatId) {
                        return {
                            ...c,
                            title: res.data.conversation.title,
                            messageCount: res.data.conversation.messages.length,
                            lastMessage: res.data.reply,
                            updatedAt: new Date()
                        };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            }
        } catch (err) {
            console.error('Send message error:', err);
            setError('Could not get response from Elev AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (activeId) {
            sendMessage(activeId);
        } else {
            handleCreateChat(inputText);
        }
    };

    const handleQuoteLine = (content, type) => {
        setQuotedMessage({
            content: content,
            type: type
        });
    };

    // Date formatting functions
    const formatMessageTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateSeparator = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const shouldShowDateSeparator = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        const currentDate = new Date(currentMsg.createdAt).toDateString();
        const prevDate = new Date(prevMsg.createdAt).toDateString();
        return currentDate !== prevDate;
    };

    // Compact markdown renderer with hover block-level quotes
    const renderMarkdown = (text, isModel) => {
        if (!text) return '';
        const parts = text.split(/(```[\s\S]*?```)/g);
        
        return parts.map((part, i) => {
            if (part.startsWith('```')) {
                const lines = part.slice(3, -3).trim().split('\n');
                let lang = '';
                let code = part.slice(3, -3).trim();
                if (lines.length > 0 && !lines[0].includes(' ') && lines[0].length < 15) {
                    lang = lines[0];
                    code = lines.slice(1).join('\n');
                }
                return (
                    <div key={i} className="relative group/line my-2.5">
                        <div className="font-mono text-[11px] bg-black/45 border border-white/10 rounded-lg p-2.5 overflow-x-auto text-red-200/90 leading-relaxed shadow-inner">
                            {lang && <div className="text-[9px] text-white/30 uppercase font-semibold tracking-wider mb-1.5 border-b border-white/5 pb-1">{lang}</div>}
                            <pre className="custom-scrollbar max-w-full overflow-x-auto whitespace-pre">{code}</pre>
                        </div>
                        {isModel && (
                            <button
                                type="button"
                                onClick={() => handleQuoteLine(code, 'Code Block')}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover/line:opacity-100 p-1 bg-black/85 border border-white/10 text-white/50 hover:text-red-400 rounded transition-all duration-150 flex items-center gap-1 text-[9px] z-10"
                                title="Ask doubt about this code block"
                            >
                                <CornerUpLeft size={8} /> Ask Doubt
                            </button>
                        )}
                    </div>
                );
            } else {
                const lines = part.split('\n');
                return lines.map((line, j) => {
                    if (line.trim() === '') return <div key={j} className="h-1" />;
                    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                    let content = line;
                    if (isBullet) {
                        content = line.replace(/^[\s]*[-*]\s+/, '');
                    }

                    const regex = /(\*\*.*?\*\*|`.*?`)/g;
                    const matches = content.split(regex);
                    
                    const element = matches.map((subPart, k) => {
                        if (subPart.startsWith('**') && subPart.endsWith('**')) {
                            return <strong key={k} className="font-semibold text-white">{subPart.slice(2, -2)}</strong>;
                        } else if (subPart.startsWith('`') && subPart.endsWith('`')) {
                            return <code key={k} className="px-1 py-0.5 mx-0.5 bg-black/50 rounded border border-white/5 font-mono text-red-400 text-[10px]">{subPart.slice(1, -1)}</code>;
                        }
                        return subPart;
                    });

                    if (isBullet) {
                        return (
                            <div key={j} className="relative group/line flex items-start justify-between gap-3 my-1 pl-1">
                                <div className="flex items-start gap-2 flex-1">
                                    <span className="text-red-500 mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                                    <span className="text-xs font-light text-white/80 leading-relaxed">{element}</span>
                                </div>
                                {isModel && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuoteLine(line, 'Bullet Point')} 
                                        className="opacity-0 group-hover/line:opacity-100 p-0.5 text-white/30 hover:text-red-400 rounded transition-all duration-150 flex-shrink-0 mt-0.5"
                                        title="Ask doubt about this line"
                                    >
                                        <CornerUpLeft size={9} />
                                    </button>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={j} className="relative group/line flex items-start justify-between gap-3 my-1">
                            <p className="text-xs font-light text-white/80 leading-relaxed flex-1">
                                {element}
                            </p>
                            {isModel && (
                                <button 
                                    type="button" 
                                    onClick={() => handleQuoteLine(line, 'Line')} 
                                    className="opacity-0 group-hover/line:opacity-100 p-0.5 text-white/30 hover:text-red-400 rounded transition-all duration-150 flex-shrink-0"
                                    title="Ask doubt about this line"
                                >
                                    <CornerUpLeft size={9} />
                                </button>
                            )}
                        </div>
                    );
                });
            }
        });
    };

    // Drag-click disambiguation
    const handleDragStart = (e, info) => {
        dragStart.current = { x: info.point.x, y: info.point.y };
        isDragging.current = false;
    };

    const handleDragEnd = (e, info) => {
        const distance = Math.sqrt(
            Math.pow(info.point.x - dragStart.current.x, 2) +
            Math.pow(info.point.y - dragStart.current.y, 2)
        );
        if (distance > 6) {
            isDragging.current = true;
            setTimeout(() => { isDragging.current = false; }, 80);
        }
    };

    const handleToggleOpen = () => {
        if (!isDragging.current) {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (nextOpen) {
                // Open a clean new chat session locally by default (prevents database pollution)
                setActiveId(null);
                setMessages([]);
                setView('chat');
            }
        }
    };

    const handleMaximize = () => {
        setIsOpen(false);
        navigate('/assistant');
    };

    const handleHeaderPointerDown = (e) => {
        if (e.target.closest('button')) return;
        dragControls.start(e);
    };

    const suggestions = [
        { title: "Recommend tasks", query: "Recommend open tasks matching my profile." },
        { title: "Understand Alchemy", query: "Explain the Focus Alchemy and Relics system." },
        { title: "Earn more Coins", query: "Suggest ways I can earn more coins." }
    ];

    if (!currentUser) return null;

    return (
        <>
            {/* ════════════════════════════════════════
                FLOATING ACTION BUTTON (Launcher) & PANEL COMBO
            ════════════════════════════════════════ */}
            <motion.div
                drag
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={dragConstraints}
                dragElastic={0.08}
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="fixed z-[9999] pointer-events-none flex flex-col-reverse items-end gap-3"
                style={{ 
                    right: isMobile ? '16px' : '24px', 
                    bottom: isMobile ? '76px' : '88px',
                    width: width,
                    height: containerHeight
                }}
            >
                {/* Bot Icon Button (acts as launcher + drag handle) */}
                <div 
                    onClick={handleToggleOpen}
                    onPointerDown={(e) => dragControls.start(e)}
                    className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-red-950/90 to-red-600/90 border border-red-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.45)] transition-shadow duration-300 flex-shrink-0 cursor-grab active:cursor-grabbing pointer-events-auto"
                >
                    <Bot size={22} className="text-white filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="absolute inset-0 rounded-full bg-red-600/10 animate-ping -z-10" />
                </div>

                {/* COMPACT CHAT PANEL DRAWER */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.92 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                            className="w-full flex flex-col bg-[#050505]/95 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto"
                            style={{ height: panelHeight }}
                        >
                            {/* Error Banner */}
                            {error && (
                                <div className="absolute top-0 inset-x-0 z-50 bg-red-950/90 border-b border-red-500/30 p-2.5 flex items-center justify-between text-[11px] text-red-200 backdrop-blur-md">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                                        <span className="truncate">{error}</span>
                                    </div>
                                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-1">Dismiss</button>
                                </div>
                            )}

                            {/* BREATHABLE HEADER (acts as drag handle) */}
                            <div 
                                onPointerDown={handleHeaderPointerDown}
                                className="h-[80px] px-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent cursor-grab active:cursor-grabbing select-none"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-red-600/15 to-red-900/15 border border-red-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.1)] flex-shrink-0">
                                        <Bot size={20} className="text-red-500 filter drop-shadow-[0_0_3px_rgba(239,68,68,0.3)]" />
                                    </div>
                                    <div className="min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[14px] font-semibold text-white tracking-wide leading-none">Elev AI Assistant</h3>
                                            <div className="flex items-center justify-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" style={{ transform: 'translateY(0.5px)' }} />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-white/40 font-medium leading-none mt-1.5">AI Companion</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Maximize Button */}
                                    <button
                                        onClick={handleMaximize}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-200"
                                        title="Maximize to full view"
                                    >
                                        <Maximize2 size={15} />
                                    </button>
                                    {/* View Toggle */}
                                    <button
                                        onClick={() => setView(view === 'chat' ? 'history' : 'chat')}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-200 ${view === 'history' ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
                                        title={view === 'chat' ? 'View Chat History' : 'Back to Chat'}
                                    >
                                        <History size={15} />
                                    </button>
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-200"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT AREA */}
                            <div className="flex-1 overflow-hidden relative flex flex-col">
                                {view === 'history' ? (
                                    /* Chat History list */
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2.5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">Chat Sessions</span>
                                            <button
                                                onClick={() => {
                                                    setActiveId(null);
                                                    setMessages([]);
                                                    setView('chat');
                                                }}
                                                className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/10 border border-red-500/10 px-2 py-1 rounded-md"
                                            >
                                                <Plus size={10} /> New Chat
                                            </button>
                                        </div>

                                        {fetchingChats ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-2">
                                                <Loader size={16} className="animate-spin text-red-500" />
                                                <span className="text-[11px]">Loading sessions...</span>
                                            </div>
                                        ) : conversations.length === 0 ? (
                                            <div className="text-center py-20 text-white/30 text-xs">
                                                No previous chats found.
                                            </div>
                                        ) : (
                                            conversations.map((chat) => (
                                                <div
                                                    key={chat._id}
                                                    onClick={() => {
                                                        setActiveId(chat._id);
                                                        setView('chat');
                                                    }}
                                                    className={`group relative p-3 rounded-xl flex items-center gap-3 cursor-pointer border transition-all duration-200 ${activeId === chat._id ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04] hover:text-white'}`}
                                                >
                                                    <MessageSquare size={14} className={activeId === chat._id ? 'text-red-500' : 'text-white/20'} />
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold truncate leading-tight">{chat.title}</p>
                                                        </div>
                                                        <p className="text-[10px] text-white/30 truncate mt-0.5">
                                                            {chat.lastMessage || 'Empty conversation'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteChat(chat._id, e)}
                                                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all duration-200"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    /* Chat Messages viewport */
                                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4">
                                            {!activeId || messages.length === 0 ? (
                                                <div className="h-full flex flex-col justify-center py-4 space-y-5">
                                                    <div className="text-center space-y-2.5">
                                                        <div className="inline-flex p-3 bg-red-950/20 border border-red-500/20 rounded-xl relative mb-1">
                                                            <Bot size={24} className="text-red-500" />
                                                            <Sparkles size={11} className="text-red-400 absolute top-1 right-1 animate-pulse" />
                                                        </div>
                                                        <h4 className="text-sm font-bold text-white">
                                                            How can I assist you, {userProfile?.name ? userProfile.name.split(' ')[0] : 'User'}?
                                                        </h4>
                                                        <p className="text-[11px] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                                                            Ask me about task recommendations, duels, crafting relics, or tracking your XP.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {suggestions.map((s, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleCreateChat(s.query)}
                                                                className="w-full p-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-red-500/[0.03] hover:border-red-500/20 text-left transition-all duration-200 flex items-center justify-between group"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-bold text-white/80 group-hover:text-red-400 transition-colors">{s.title}</p>
                                                                </div>
                                                                <ChevronRight size={11} className="text-white/20 group-hover:text-red-400 group-hover:translate-x-0.5 transition-transform" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {messages.map((m, idx) => (
                                                        <React.Fragment key={idx}>
                                                            {shouldShowDateSeparator(m, messages[idx - 1]) && (
                                                                <div className="flex items-center justify-center my-4">
                                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                                    <span className="px-2.5 text-[9px] text-white/35 font-mono tracking-wider uppercase">
                                                                        {formatDateSeparator(m.createdAt)}
                                                                    </span>
                                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                                </div>
                                                            )}

                                                            <div className={`flex items-start gap-2.5 max-w-[85%] group ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border text-[10px] font-bold ${m.role === 'user' ? 'bg-red-600/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white/70'}`}>
                                                                    {m.role === 'user' ? 'U' : <Bot size={12} />}
                                                                </div>
                                                                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed relative ${m.role === 'user' ? 'bg-red-600/10 border-red-500/20 text-white' : 'bg-white/[0.02] border-white/5 text-white/95'}`}>
                                                                    {m.role === 'user' ? (
                                                                        <p className="font-light whitespace-pre-wrap">{m.content}</p>
                                                                    ) : (
                                                                        <div className="space-y-1">
                                                                            {renderMarkdown(m.content, true)}
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-1.5 text-right">
                                                                        <span className="text-[8px] text-white/20 font-mono leading-none">
                                                                            {formatMessageTime(m.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}

                                                    {loading && (
                                                        <div className="flex items-start gap-2.5 max-w-[85px]">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-white/70">
                                                                <Bot size={12} />
                                                            </div>
                                                            <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                                                <div className="flex items-center gap-1 h-2">
                                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 border-t border-white/10 bg-black/60 backdrop-blur-md">
                                            {quotedMessage && (
                                                <div className="mb-2.5 p-2 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center justify-between text-[10px] text-white/70 animate-slideUp">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <CornerUpLeft size={10} className="text-red-400 flex-shrink-0" />
                                                        <span className="truncate">Replying to: "{quotedMessage.content.substring(0, 50)}"</span>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setQuotedMessage(null)}
                                                        className="text-white/30 hover:text-white p-0.5 hover:bg-white/5 rounded"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                            <form onSubmit={handleFormSubmit} className="flex gap-2 relative">
                                                <input
                                                    type="text"
                                                    value={inputText}
                                                    onChange={(e) => setInputText(e.target.value)}
                                                    disabled={loading}
                                                    placeholder={activeId ? "Ask a doubt about anything..." : "Start a new chat session..."}
                                                    className="flex-1 h-9 px-3 pr-10 rounded-lg bg-white/[0.02] border border-white/10 focus:border-red-500/40 text-xs text-white placeholder-white/30 focus:outline-none input-glow-red transition-all duration-200"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading || !inputText.trim()}
                                                    className="absolute right-1 top-1 w-7 h-7 rounded-md bg-red-600 hover:bg-red-500 disabled:bg-white/5 text-white disabled:text-white/20 flex items-center justify-center transition-all duration-150"
                                                >
                                                    <Send size={11} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default FloatingAIAssistant;
