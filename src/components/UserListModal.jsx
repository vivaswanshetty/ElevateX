import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserListModal = ({ isOpen, onClose, title, users, loading, onUserClick }) => {
    const navigate = useNavigate();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleUserClick = (userId) => {
        onClose();
        if (onUserClick) {
            onUserClick(userId);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]"
                    />
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col max-h-[80vh]"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#111]">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
                                <button
                                    type="button"
                                    onClick={() => onClose()}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto p-2">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                                    </div>
                                ) : users.length > 0 ? (
                                    <div className="space-y-1">
                                        {users.map((user) => (
                                            <div
                                                key={user._id}
                                                onClick={() => handleUserClick(user)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Level {Math.floor((user.xp || 0) / 500) + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No users found
                                    </div>
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
