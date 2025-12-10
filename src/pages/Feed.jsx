import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Trash2, Image as ImageIcon, X, Upload, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [newImage, setNewImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const initializeFeed = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const postId = params.get('postId');

            let feedPosts = [];
            try {
                const response = user
                    ? await api.get('/posts/feed')
                    : await api.get('/posts');
                feedPosts = response.data;
            } catch (error) {
                console.error('Error fetching feed:', error);
            }

            if (postId) {
                // Check if post is in feed
                const postInFeed = feedPosts.find(p => p._id === postId);
                if (!postInFeed) {
                    try {
                        const response = await api.get(`/posts/${postId}`);
                        // Add to top of feed if found
                        if (response.data) {
                            feedPosts = [response.data, ...feedPosts];
                        }
                    } catch (error) {
                        console.error('Error fetching specific post:', error);
                    }
                }
            }

            setPosts(feedPosts);
            setLoading(false);
        };

        initializeFeed();

        // Check if we need to restore profile modal (e.g. coming back from leaderboard)
        if (location.state?.restoreUser) {
            setSelectedUser(location.state.restoreUser);
            // Clear the state so it doesn't persist on refresh/future navigations
            window.history.replaceState({ ...window.history.state, restoreUser: null }, '');
        }
    }, [user, location.search]);

    // Scroll to post if postId is in URL
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const params = new URLSearchParams(location.search);
            const postId = params.get('postId');

            if (postId) {
                setTimeout(() => {
                    const element = document.getElementById(`post-${postId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add highlight effect
                        element.classList.add('ring-2', 'ring-yellow-500', 'ring-offset-2', 'dark:ring-offset-black');
                        setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-yellow-500', 'ring-offset-2', 'dark:ring-offset-black');
                        }, 2000);
                    }
                }, 500);
            }
        }
    }, [loading, posts, location.search]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setToast({ type: 'error', message: 'Please select an image file' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToast({ type: 'error', message: 'Image size should be less than 5MB' });
            return;
        }

        setUploadingImage(true);
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setNewImage(base64String);
                setImagePreview(base64String);
                setUploadingImage(false);
            };
            reader.onerror = () => {
                setToast({ type: 'error', message: 'Error reading file' });
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setToast({ type: 'error', message: 'Failed to upload image' });
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setNewImage('');
        setImagePreview('');
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            const response = await api.post('/posts', {
                content: newPost,
                image: newImage
            });
            setPosts([response.data, ...posts]);
            setNewPost('');
            setNewImage('');
            setImagePreview('');
            setShowCreatePost(false);
        } catch (error) {
            console.error('Error creating post:', error);
            setToast({ type: 'error', message: 'Failed to create post. Please try again.' });
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await api.put(`/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? response.data : p));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentText[postId];
        if (!text?.trim()) return;

        try {
            const response = await api.post(`/posts/${postId}/comment`, { text });
            setPosts(posts.map(p => p._id === postId ? response.data : p));
            setCommentText({ ...commentText, [postId]: '' });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        setPostToDelete(postId);
        setShowDeleteConfirm(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;

        try {
            await api.delete(`/posts/${postToDelete}`);
            setPosts(posts.filter(p => p._id !== postToDelete));
            setToast({ type: 'success', message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            setToast({ type: 'error', message: 'Failed to delete post' });
        } finally {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 bg-clip-text text-transparent leading-tight pb-2">
                    Feed
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                    {user ? 'See what people you follow are sharing' : 'Explore what the community is sharing'}
                </p>
            </div>

            {/* Create Post */}
            {user && (
                <div className="mb-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                    {!showCreatePost ? (
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            What's on your mind?
                        </button>
                    ) : (
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Share something with the community..."
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none"
                                rows="4"
                                maxLength="500"
                            />

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full rounded-xl max-h-96 object-cover border border-gray-200 dark:border-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {/* File Upload Button */}
                                    <label className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors cursor-pointer">
                                        <Upload className="w-5 h-5" />
                                        <span className="text-sm font-medium">
                                            {uploadingImage ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Image added
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreatePost(false);
                                            setNewPost('');
                                            setNewImage('');
                                            setImagePreview('');
                                        }}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPost.trim() || uploadingImage}
                                        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingImage ? 'Uploading...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <motion.div
                            key={post._id}
                            id={`post-${post._id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300"
                        >
                            {/* Post Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedUser(post.author)}
                                >
                                    <img
                                        src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                                        alt={post.author?.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-white/10"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-black dark:text-white capitalize hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                                            {post.author?.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(post.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {user && post.author?._id === user._id && (
                                    <button
                                        onClick={() => handleDeletePost(post._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Post Content */}
                            <p className="text-black dark:text-white mb-4 whitespace-pre-wrap">
                                {post.content}
                            </p>

                            {/* Post Image */}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full rounded-xl mb-4 max-h-96 object-cover"
                                />
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center gap-6 py-3 border-t border-b border-gray-200 dark:border-white/10 mb-4">
                                <button
                                    onClick={() => handleLikePost(post._id)}
                                    disabled={!user}
                                    className={`flex items-center gap-2 transition-colors ${user && post.likes?.includes(user._id)
                                        ? 'text-red-500'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                                        } ${!user && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <Heart className={`w-5 h-5 ${user && post.likes?.includes(user._id) ? 'fill-red-500' : ''}`} />
                                    <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                                </button>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                                </div>
                            </div>

                            {/* Comments */}
                            {post.comments && post.comments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {post.comments.map((comment, index) => (
                                        <div key={index} className="flex gap-3">
                                            <img
                                                src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}`}
                                                alt={comment.user?.name}
                                                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(comment.user);
                                                }}
                                            />
                                            <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-lg p-3">
                                                <p
                                                    className="font-semibold text-sm text-black dark:text-white capitalize mb-1 cursor-pointer hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(comment.user);
                                                    }}
                                                >
                                                    {comment.user?.name}
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            {user && (
                                <div className="flex gap-3">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={commentText[post._id] || ''}
                                            onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                            placeholder="Write a comment..."
                                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-black dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none"
                                        />
                                        <button
                                            onClick={() => handleAddComment(post._id)}
                                            disabled={!commentText[post._id]?.trim()}
                                            className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {user ? 'No posts yet. Follow some users to see their posts!' : 'No posts available'}
                        </p>
                    </div>
                )}
            </div>

            {/* User Profile Modal */}
            <UserProfileModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setPostToDelete(null);
                }}
                onConfirm={confirmDeletePost}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Feed;
