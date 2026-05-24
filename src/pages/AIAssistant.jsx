import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Bot, Sparkles, Plus, Trash2, Brain, User, 
    Loader, ChevronRight, MessageSquare, AlertCircle, Menu, X, ArrowLeft, CornerUpLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AIAssistant = () => {
    const { currentUser, getUserProfile } = useAuth();
    const userProfile = getUserProfile() || currentUser;

    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingChats, setFetchingChats] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const [quotedMessage, setQuotedMessage] = useState(null);

    const chatContainerRef = useRef(null);
    const chatEndRef = useRef(null);

    // Fetch conversation list on mount
    useEffect(() => {
        if (currentUser) {
            fetchConversations();
        }
    }, [currentUser]);

    // Fetch messages when activeId changes
    useEffect(() => {
        if (activeId) {
            fetchMessages(activeId);
            scrollToTop('auto');
        } else {
            setMessages([]);
        }
    }, [activeId]);

    // Scroll to top immediately on loading / chat loading completed
    useEffect(() => {
        if (!fetchingMessages && messages.length > 0) {
            scrollToTop('auto');
        }
    }, [fetchingMessages]);

    // Scroll to bottom during active conversation (loading toggles)
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('smooth');
        }
    }, [loading]);

    const scrollToTop = (behavior = 'auto') => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = 0;
            }
        }, 50);
    };

    const scrollToBottom = (behavior = 'smooth') => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 50);
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

    const handleQuoteLine = (content, type) => {
        setQuotedMessage({
            content: content,
            type: type
        });
    };

    const fetchConversations = async () => {
        setFetchingChats(true);
        setError(null);
        try {
            const res = await api.get('/assistant/conversations');
            setConversations(res.data);
            // Auto-select latest conversation if exists
            if (res.data.length > 0 && !activeId) {
                setActiveId(res.data[0]._id);
            }
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
            setError('Failed to load chat messages.');
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
            
            // Update conversations list
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
            
            // Set as active
            setActiveId(newChat._id);
            setMessages([]);
            setSidebarOpenMobile(false);

            // If there's an initial query, send it
            if (initialQuery) {
                await sendMessage(newChat._id, initialQuery);
            }
        } catch (err) {
            console.error('Create chat error:', err);
            setError('Failed to start a new chat session.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChat = async (id, e) => {
        e.stopPropagation(); // Prevent selecting the chat
        setError(null);
        try {
            await api.delete(`/assistant/conversations/${id}`);
            
            // Remove from list
            setConversations(prev => prev.filter(c => c._id !== id));
            
            // If the deleted chat was active, select another one or reset
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
            setError('Failed to delete chat session.');
        }
    };

    const sendMessage = async (chatId, textToSend) => {
        const text = textToSend || inputText;
        if (!text || text.trim() === '') return;

        setInputText('');
        setLoading(true);
        setError(null);

        // Prepend quote to content sent to API if quotedMessage is set
        let contentToSend = text;
        if (quotedMessage) {
            contentToSend = `Regarding your statement: "${quotedMessage.content}"\n\nQuestion: ${text}`;
            setQuotedMessage(null); // Clear quoted message state
        }

        // Optimistically add user message to UI
        const tempUserMessage = {
            role: 'user',
            content: text,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const res = await api.post(`/assistant/conversations/${chatId}/chat`, { content: contentToSend });
            
            // Replace with actual messages from DB
            if (res.data && res.data.conversation) {
                setMessages(res.data.conversation.messages);
                
                // Update title & last message in sidebar list
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
            setError('Something went wrong. Elev AI could not respond.');
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

    const handleSuggestionClick = (query) => {
        handleCreateChat(query);
    };

    // Custom renderer for markdown content
    // Custom renderer for markdown content with block-level quoting support
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
                    <div key={i} className="relative group/line my-3">
                        <div className="font-mono text-xs bg-black/45 border border-white/10 rounded-xl p-3.5 overflow-x-auto text-red-200/90 leading-relaxed shadow-inner">
                            {lang && <div className="text-[10px] text-white/30 uppercase font-semibold tracking-wider mb-2 border-b border-white/5 pb-1">{lang}</div>}
                            <pre className="custom-scrollbar">{code}</pre>
                        </div>
                        {isModel && (
                            <button
                                type="button"
                                onClick={() => handleQuoteLine(code, 'Code Block')}
                                className="absolute top-2 right-2 opacity-0 group-hover/line:opacity-100 p-1.5 bg-black/85 border border-white/10 text-white/50 hover:text-red-400 rounded-md transition-all duration-150 flex items-center gap-1 text-[10px] z-10"
                                title="Ask doubt about this code block"
                            >
                                <CornerUpLeft size={10} /> Ask Doubt
                            </button>
                        )}
                    </div>
                );
            } else {
                const lines = part.split('\n');
                return lines.map((line, j) => {
                    if (line.trim() === '') return <div key={j} className="h-1.5" />;
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
                            return <code key={k} className="px-1.5 py-0.5 mx-0.5 bg-black/50 rounded border border-white/5 font-mono text-red-400 text-[11px]">{subPart.slice(1, -1)}</code>;
                        }
                        return subPart;
                    });

                    if (isBullet) {
                        return (
                            <div key={j} className="relative group/line flex items-start justify-between gap-4 my-1.5 pl-1.5">
                                <div className="flex items-start gap-2.5 flex-1">
                                    <span className="text-red-500 mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                                    <span className="text-sm font-light text-white/80 leading-relaxed">{element}</span>
                                </div>
                                {isModel && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleQuoteLine(line, 'Bullet Point')} 
                                        className="opacity-0 group-hover/line:opacity-100 p-1 text-white/30 hover:text-red-400 rounded transition-all duration-150 flex-shrink-0 mt-0.5"
                                        title="Ask doubt about this line"
                                    >
                                        <CornerUpLeft size={10} />
                                    </button>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={j} className="relative group/line flex items-start justify-between gap-4 my-1">
                            <p className="text-sm font-light text-white/80 leading-relaxed flex-1">
                                {element}
                            </p>
                            {isModel && (
                                <button 
                                    type="button" 
                                    onClick={() => handleQuoteLine(line, 'Line')} 
                                    className="opacity-0 group-hover/line:opacity-100 p-1 text-white/30 hover:text-red-400 rounded transition-all duration-150 flex-shrink-0"
                                    title="Ask doubt about this line"
                                >
                                    <CornerUpLeft size={10} />
                                </button>
                            )}
                        </div>
                    );
                });
            }
        });
    };

    const suggestions = [
        { title: "Recommend tasks", query: "Recommend open tasks matching my profile." },
        { title: "Understand Alchemy", query: "Explain the Focus Alchemy and Relics system." },
        { title: "Productivity Duels", query: "How do Productivity Duels work?" },
        { title: "Earn more Coins", query: "Suggest ways I can earn more coins." }
    ];

    const activeConversation = conversations.find(c => c._id === activeId);

    return (
        <div className="pt-20 min-h-screen bg-black text-white flex justify-center">
            {/* Glowing background highlights */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-red-900/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-6xl px-4 md:px-6 h-[calc(100vh-90px)] max-h-[850px] flex gap-5 overflow-hidden contain-layout">
                
                {/* ════════════════════════════════════════
                    SIDEBAR (Chat History) — Responsive
                ════════════════════════════════════════ */}
                <div className={`
                    fixed md:relative inset-y-0 left-0 w-[280px] z-50 md:z-auto
                    md:flex flex-col bg-[#050505] md:bg-transparent border-r md:border border-white/5 md:border-white/10
                    md:rounded-2xl backdrop-blur-2xl p-4 transition-transform duration-300 ease-out
                    ${sidebarOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    
                    {/* Header of Mobile Sidebar */}
                    <div className="flex md:hidden items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <span className="font-bold text-sm text-white/90">Chat History</span>
                        <button 
                            onClick={() => setSidebarOpenMobile(false)}
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={() => {
                            setActiveId(null);
                            setMessages([]);
                        }}
                        className="w-full h-11 mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700/80 to-red-600/80 border border-red-500/30 text-white font-bold text-sm hover:from-red-600 hover:to-red-500 hover:scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.15)] active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        New Chat Session
                    </button>

                    {/* Chat Session List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                        {fetchingChats ? (
                            <div className="flex flex-col items-center justify-center py-10 text-white/30 space-y-2">
                                <Loader size={20} className="animate-spin text-red-500" />
                                <span className="text-xs">Loading sessions...</span>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-10 text-white/30 text-xs">
                                No previous chat sessions.
                            </div>
                        ) : (
                            conversations.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => {
                                        setActiveId(chat._id);
                                        setSidebarOpenMobile(false);
                                    }}
                                    className={`
                                        group relative w-full p-3 rounded-xl flex items-center gap-3 cursor-pointer border transition-all duration-200
                                        ${activeId === chat._id
                                            ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_12px_rgba(239,68,68,0.05)]'
                                            : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04] hover:border-white/10 hover:text-white/80'
                                        }
                                    `}
                                >
                                    <MessageSquare size={16} className={activeId === chat._id ? 'text-red-500' : 'text-white/30'} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold truncate leading-tight pr-2">{chat.title}</p>
                                            <span className="text-[8px] text-white/20 font-mono flex-shrink-0">
                                                {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/30 truncate mt-0.5">
                                            {chat.lastMessage || 'Empty chat'}
                                        </p>
                                    </div>
                                    
                                    {/* Delete icon */}
                                    <button
                                        onClick={(e) => handleDeleteChat(chat._id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                                        title="Delete Conversation"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* User profile capsule in sidebar footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
                        <img 
                            src={userProfile?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=fallback`} 
                            alt="avatar" 
                            className="w-8 h-8 rounded-lg object-cover border border-white/10 bg-[#111]"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white/80 truncate leading-none">{userProfile?.name}</p>
                            <p className="text-[10px] text-red-400 font-semibold mt-1">Level {Math.floor((userProfile?.xp || 0) / 500) + 1} Helper</p>
                        </div>
                    </div>
                </div>

                {/* Mobile sidebar overlay */}
                {sidebarOpenMobile && (
                    <div 
                        onClick={() => setSidebarOpenMobile(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}

                {/* ════════════════════════════════════════
                    MAIN CHAT PANEL
                ════════════════════════════════════════ */}
                <div className="flex-1 h-full flex flex-col bg-[#050505]/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden relative shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
                    
                    {/* Error Banner */}
                    {error && (
                        <div className="absolute top-0 inset-x-0 z-20 bg-red-950/80 border-b border-red-500/30 p-2.5 flex items-center justify-between text-xs text-red-200 backdrop-blur-md animate-slideDown">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-400" />
                                <span>{error}</span>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-semibold">Dismiss</button>
                        </div>
                    )}

                    {/* Chat header */}
                    <div className="h-[80px] px-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent select-none">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu trigger */}
                            <button
                                onClick={() => setSidebarOpenMobile(true)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/60 hover:text-white md:hidden"
                                title="Open history"
                            >
                                <Menu size={16} />
                            </button>
                            
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
                        </div>

                        {activeConversation && (
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline text-[10px] text-white/30 font-mono">
                                    {activeConversation.messageCount} messages
                                </span>
                                <button
                                    onClick={(e) => handleDeleteChat(activeId, e)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-200"
                                    title="Delete this chat"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Chat Messages Body */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                        
                        {/* Welcome / Empty State */}
                        {!activeId || messages.length === 0 ? (
                            <div className="h-full flex flex-col justify-center max-w-xl mx-auto py-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center space-y-4 mb-8"
                                >
                                    <div className="inline-flex p-3.5 bg-gradient-to-br from-red-600/15 to-red-900/15 border border-red-500/25 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.1)] relative">
                                        <Brain size={32} className="text-red-500" />
                                        <Sparkles size={14} className="text-red-400 absolute top-2 right-2 animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                                            Hey {userProfile?.name ? userProfile.name.split(' ')[0] : 'User'}! Ready to level up?
                                        </h2>
                                        <p className="text-xs text-white/55 font-light mt-1.5 max-w-md mx-auto leading-relaxed">
                                            I'm **Elev AI**, your companion at ElevateX. Ask me about matching tasks, crafting relics, dueling, or improving your productivity.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                >
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(s.query)}
                                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-red-500/[0.04] hover:border-red-500/25 hover:-translate-y-0.5 text-left transition-all duration-300 group shadow-sm"
                                        >
                                            <div className="flex items-center justify-between text-xs font-bold text-white/80 group-hover:text-red-400">
                                                <span>{s.title}</span>
                                                <ChevronRight size={13} className="text-white/20 group-hover:text-red-400 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                            <p className="text-[10px] text-white/35 font-light leading-normal mt-1 truncate">
                                                "{s.query}"
                                            </p>
                                        </button>
                                    ))}
                                </motion.div>
                            </div>
                        ) : (
                            /* Messages Thread */
                            <div className="space-y-6">
                                {messages.map((m, idx) => (
                                    <React.Fragment key={idx}>
                                        {/* WhatsApp style date separator */}
                                        {shouldShowDateSeparator(m, messages[idx - 1]) && (
                                            <div className="flex items-center justify-center my-6">
                                                <div className="h-[1px] flex-1 bg-white/5" />
                                                <span className="px-3 text-[10px] text-white/35 font-mono tracking-wider uppercase">
                                                    {formatDateSeparator(m.createdAt)}
                                                </span>
                                                <div className="h-[1px] flex-1 bg-white/5" />
                                            </div>
                                        )}

                                        <div 
                                            className={`flex items-start gap-3.5 max-w-2xl group ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                        >
                                            {/* Avatar bubble */}
                                            <div className={`
                                                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs font-bold
                                                ${m.role === 'user'
                                                    ? 'bg-red-600/10 border-red-500/30 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-white/80'
                                                }
                                            `}>
                                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>

                                            {/* Content Bubble */}
                                            <div className={`
                                                p-4 rounded-2xl border text-sm leading-relaxed
                                                ${m.role === 'user'
                                                    ? 'bg-[#ef4444]/10 border-red-500/20 text-white'
                                                    : 'bg-white/[0.02] border-white/5 text-white/90 shadow-sm'
                                                }
                                            `}>
                                                {m.role === 'user' ? (
                                                    <p className="font-light whitespace-pre-wrap">{m.content}</p>
                                                ) : (
                                                    <div className="space-y-1 font-sans">
                                                        {renderMarkdown(m.content, true)}
                                                    </div>
                                                )}
                                                
                                                {/* Footer details: Time-only Timestamp */}
                                                <div className="mt-2 text-right">
                                                    <span className="text-[9px] text-white/25 font-mono leading-none">
                                                        {formatMessageTime(m.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}

                                {/* Thinking loader */}
                                {loading && (
                                    <div className="flex items-start gap-3.5 max-w-[100px]">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-white/80">
                                            <Bot size={14} />
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                            <div className="flex items-center gap-1.5 h-3">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Message Input Area */}
                    <div className="p-4 border-t border-white/10 bg-[#050505]/60 backdrop-blur-md">
                        {quotedMessage && (
                            <div className="mb-3 p-2.5 bg-red-500/5 border border-red-500/25 rounded-xl flex items-center justify-between text-xs text-white/70 animate-slideUp">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CornerUpLeft size={12} className="text-red-400 flex-shrink-0" />
                                    <span className="truncate">Ask doubt about: "{quotedMessage.content.substring(0, 80)}"</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setQuotedMessage(null)}
                                    className="text-white/30 hover:text-white flex-shrink-0 p-1 hover:bg-white/5 rounded"
                                    title="Cancel reply"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleFormSubmit} className="flex gap-2.5 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={loading}
                                placeholder={activeId ? "Message Elev AI (Productivity Assistant)..." : "Ask something to start a new chat..."}
                                className="flex-1 h-11 px-4 pr-12 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-red-500/50 focus:bg-white/[0.04] text-sm text-white placeholder-white/30 focus:outline-none input-glow-red transition-all duration-300 disabled:opacity-50"
                            />
                            
                            <button
                                type="submit"
                                disabled={loading || !inputText.trim()}
                                className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-white/5 text-white disabled:text-white/20 flex items-center justify-center transition-all duration-200 shadow-md shadow-red-950/20"
                                title="Send Message"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AIAssistant;
