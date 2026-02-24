import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Heart, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';
import UserProfileModal from './UserProfileModal';

const PostCard = ({ post, onUpdate, onDelete }) => {
    const { currentUser } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const handleLike = async () => {
        if (!currentUser || isLiking) return;
        setIsLiking(true);
        try {
            const response = await api.put(`/posts/${post._id}/like`);
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const response = await api.post(`/posts/${post._id}/comment`, { text: commentText });
            if (onUpdate) onUpdate(response.data);
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const handleDelete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/posts/${post._id}`);
                    showToast('cleared', 'Post deleted successfully');
                    if (onDelete) onDelete(post._id);
                } catch (error) {
                    console.error('Error deleting post:', error);
                    showToast('error', 'Failed to delete post');
                }
            }
        });
    };

    return (
        <motion.div
            id={`post-${post._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                        alt={post.author?.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/10 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (post.author) setSelectedUser(post.author);
                        }}
                    />
                    <div>
                        <h3
                            className="font-bold text-white capitalize cursor-pointer hover:text-red-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (post.author) setSelectedUser(post.author);
                            }}
                        >
                            {post.author?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </div>
                {currentUser && post.author?._id === currentUser._id && (
                    <button
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Post Content */}
            <p className="text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed">
                {post.content}
            </p>

            {/* Post Image */}
            {post.image && (
                <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-xl mb-4 max-h-96 object-cover border border-white/5"
                />
            )}

            {/* Post Actions */}
            <div className="flex items-center gap-6 py-3 border-t border-b border-white/5 mb-4">
                <button
                    onClick={handleLike}
                    disabled={!currentUser}
                    className={`flex items-center gap-2 transition-colors ${currentUser && post.likes?.includes(currentUser._id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                        } ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
                >
                    <Heart className={`w-5 h-5 ${currentUser && post.likes?.includes(currentUser._id) ? 'fill-red-500' : ''}`} />
                    <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                </div>
            </div>

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 mb-5">
                    {post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-3">
                            <img
                                src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}`}
                                alt={comment.user?.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                            />
                            <div className="flex-1 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <p className="font-semibold text-sm text-white capitalize mb-1">
                                    {comment.user?.name}
                                </p>
                                <p className="text-sm text-gray-300">
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Comment */}
            {currentUser && (
                <div className="flex gap-3">
                    <img
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                        />
                        <button
                            onClick={handleComment}
                            disabled={!commentText.trim()}
                            className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDestructive={confirmModal.isDestructive}
            />

            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </motion.div>
    );
};

export default PostCard;
