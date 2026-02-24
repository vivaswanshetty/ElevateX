import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserListModal = ({ isOpen, onClose, title, users, loading, onUserClick }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setSearchQuery(''); // Reset search when opened
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleUserClick = (user) => {
        onClose();
        if (onUserClick) {
            onUserClick(user);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    // Animation Variants
    const backdropVariants = {
        hidden: { opacity: 0, backdropFilter: "blur(0px)" },
        visible: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.4 } },
        exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30, rotateX: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
            transition: { type: "spring", damping: 25, stiffness: 300, staggerChildren: 0.1 }
        },
        exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[160]"
                    />
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-[#050505]/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md w-full overflow-hidden border border-white/5 flex flex-col max-h-[85vh] pointer-events-auto relative"
                        >
                            {/* Decorative ambient light */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-[50px]" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px]" />

                            {/* Header */}
                            <div className="p-5 border-b border-white/5 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                        <Users className="w-4 h-4 text-red-400" />
                                    </div>
                                    <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                        {title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onClose()}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white hover:rotate-90 duration-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="px-5 pt-5 pb-2 relative z-10">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none text-white/40 group-focus-within:text-red-400 transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 focus:bg-white/10 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto p-3 custom-scrollbar relative z-10 flex-1">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="relative w-10 h-10">
                                            <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
                                            <div className="absolute inset-0 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <span className="text-xs text-white/50 font-medium tracking-widest uppercase">Loading Spirits...</span>
                                    </div>
                                ) : filteredUsers.length > 0 ? (
                                    <motion.div
                                        className="space-y-2 px-2 pb-2"
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {filteredUsers.map((user) => (
                                            <motion.div
                                                variants={itemVariants}
                                                key={user._id}
                                                onClick={() => handleUserClick(user)}
                                                className="flex items-center gap-4 p-3 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-white/5"
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <img
                                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=171717&color=f43f5e`}
                                                        alt={user.name}
                                                        className="relative w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-red-500 transition-colors duration-300 shadow-lg"
                                                    />
                                                    {/* Online indicator dot - assuming user might have status, fallback to aesthetic dot */}
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#050505]"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white/90 truncate group-hover:text-red-400 transition-colors text-base">
                                                        {user.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 group-hover:border-red-500/30 group-hover:text-red-300 transition-colors">
                                                            LVL {Math.floor((user.xp || 0) / 500) + 1}
                                                        </span>
                                                        {user.username && (
                                                            <span className="text-xs text-white/40 truncate">
                                                                @{user.username}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 pr-2">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-16 text-center px-6"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                            <Search className="w-8 h-8 text-white/20" />
                                        </div>
                                        <p className="text-white/80 font-semibold mb-1">No souls found</p>
                                        <p className="text-xs text-white/40 max-w-[200px]">
                                            {searchQuery ? `We couldn't find anyone matching "${searchQuery}"` : "The void is currently empty"}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserListModal;
