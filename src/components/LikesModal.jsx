import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import api from '../api/axios';

const LikesModal = ({ postId, onClose, onUserClick }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await api.get(`/posts/${postId}/likes`);
                setLikes(response.data);
            } catch (error) {
                console.error('Error fetching likes:', error);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchLikes();
        }
    }, [postId]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0d0d0d] rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-red-500/10">
                                <Trophy className="w-4 h-4 text-red-500" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Liked by</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-red-500"></div>
                            </div>
                        ) : likes.length > 0 ? (
                            likes.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                                    onClick={() => onUserClick && onUserClick(user)}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-red-500/50 transition-colors"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm capitalize truncate group-hover:text-red-500 transition-colors">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                                Lv {Math.floor((user.xp || 0) / 500) + 1}
                                            </span>
                                            {user.xp !== undefined && (
                                                <span className="text-xs text-yellow-500/80 font-medium">
                                                    {user.xp} XP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-sm">No likes yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LikesModal;
