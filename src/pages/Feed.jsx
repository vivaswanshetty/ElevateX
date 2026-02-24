import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Send, Trash2, X, Upload, Check, Bookmark,
    Share2, MoreHorizontal, ImageIcon, Smile, TrendingUp, Users,
    Sparkles, ChevronDown, ChevronUp, Globe, Lock, UserPlus, UserMinus,
    Zap, Award, Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';
import ConfirmModal from '../components/ConfirmModal';
import LikesModal from '../components/LikesModal';
import Toast from '../components/Toast';

const MAX_CHARS = 500;

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5001/api';
    }
    return `${baseUrl.replace('/api', '')}${path}`;
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const calculateLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

// ─── Post Composer ────────────────────────────────────────────────────────────
const PostComposer = ({ user, onPost }) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
        if (file.size > 80 * 1024 * 1024) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const reset = () => { setText(''); setImage(null); setPreview(''); setOpen(false); };

    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('content', text);
            if (image) fd.append('image', image);
            const res = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onPost(res.data);
            reset();
        } catch { /* handled by parent */ }
        finally { setUploading(false); }
    };

    const remaining = MAX_CHARS - text.length;
    const isOverLimit = remaining < 0;

    return (
        <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Collapsed trigger */}
            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                    <img
                        src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <span className="flex-1 text-left text-sm rounded-full px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                        What's on your mind, {user.name?.split(' ')[0]}?
                    </span>
                    <div className="flex gap-2">
                        <span className="p-2 rounded-full hover:bg-white/10" style={{ color: '#ef4444' }}><ImageIcon className="w-5 h-5" /></span>
                    </div>
                </button>
            ) : (
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={submit}
                    className="p-4 space-y-3"
                >
                    <div className="flex items-start gap-3">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-red-500/30 flex-shrink-0"
                        />
                        <textarea
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Share something with the community..."
                            className="flex-1 bg-transparent text-white placeholder-white/30 resize-none outline-none text-base leading-relaxed min-h-[80px]"
                            maxLength={MAX_CHARS + 50}
                        />
                    </div>

                    {/* Media preview */}
                    {preview && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 ml-13">
                            {image?.type?.startsWith('video/') ? (
                                <video src={preview} controls className="w-full max-h-72 object-cover" />
                            ) : (
                                <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => { setImage(null); setPreview(''); }}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                                style={{ color: '#ef4444' }}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Photo/Video
                            </button>
                            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-mono ${isOverLimit ? 'text-red-500' : remaining < 50 ? 'text-orange-500' : 'text-gray-500'}`}>
                                {remaining}
                            </span>
                            <button type="button" onClick={reset} className="px-3 py-1.5 text-sm text-gray-500 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={(!text.trim() && !image) || uploading || isOverLimit}
                                className="px-5 py-1.5 rounded-lg text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-white"
                                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                            >
                                {uploading ? (
                                    <><div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /> Posting...</>
                                ) : (
                                    <><Sparkles className="w-3.5 h-3.5" /> Post</>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.form>
            )}
        </div>
    );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onLike, onComment, onDelete, onUserClick, onShowLikes }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(currentUser && post.likes?.includes(currentUser._id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

    // Persist bookmark in localStorage
    const savedKey = currentUser ? `saved_posts_${currentUser._id}` : null;
    const getSaved = () => savedKey ? JSON.parse(localStorage.getItem(savedKey) || '[]') : [];
    const [bookmarked, setBookmarked] = useState(() => getSaved().includes(post._id));
    const isOwn = currentUser && post.author?._id === currentUser._id;

    const handleLike = async () => {
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount(c => wasLiked ? c - 1 : c + 1);
        await onLike(post._id);
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        await onComment(post._id, commentText);
        setCommentText('');
    };

    const handleShare = () => {
        const url = `${window.location.origin}/feed?postId=${post._id}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <motion.div
            id={`post-${post._id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden transition-all hover:border-red-500/20"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onUserClick(post.author)}
                >
                    <div className="relative">
                        <img
                            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                            alt={post.author?.name}
                            className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:border-red-500 transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5" style={{ background: '#ef4444' }}>
                            <span className="text-[9px] font-bold text-white">L{calculateLevel(post.author?.xp)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-white capitalize group-hover:text-red-500 transition-colors leading-tight">
                            {post.author?.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            {formatTimeAgo(post.createdAt)}
                            <span className="text-gray-600">·</span>
                            <Globe className="w-3 h-3" />
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(m => !m)}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                className="absolute right-0 top-10 z-20 rounded-xl shadow-xl py-1 min-w-[140px]"
                                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <button
                                    onClick={() => { handleShare(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                                >
                                    <Share2 className="w-4 h-4" /> Copy Link
                                </button>
                                {isOwn && (
                                    <button
                                        onClick={() => { onDelete(post._id); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Post
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            {post.content && (
                <p className="px-5 pb-3 text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>
            )}

            {/* Media */}
            {post.image && (
                <div className="border-t border-b border-white/5">
                    {post.image.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={getImageUrl(post.image)} controls className="w-full max-h-[500px] object-cover" />
                    ) : (
                        <img src={getImageUrl(post.image)} alt="Post" className="w-full max-h-[500px] object-cover" />
                    )}
                </div>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-between px-5 py-2.5 text-xs text-gray-400">
                <button
                    onClick={() => onShowLikes(post._id)}
                    className="hover:text-white hover:underline transition-colors"
                >
                    {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}` : ''}
                </button>
                <button
                    onClick={() => setShowComments(c => !c)}
                    className="hover:text-white transition-colors"
                >
                    {post.comments?.length > 0 ? `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}` : ''}
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 px-3 py-1 border-t border-white/5">
                <button
                    onClick={handleLike}
                    disabled={!currentUser}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <motion.div
                        animate={liked ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
                    </motion.div>
                    Like
                </button>
                <button
                    onClick={() => setShowComments(c => !c)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                    <MessageCircle className="w-5 h-5" /> Comment
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                >
                    <Share2 className="w-5 h-5" /> Share
                </button>
                <button
                    onClick={() => {
                        if (!savedKey) return;
                        const saved = getSaved();
                        const next = bookmarked ? saved.filter(id => id !== post._id) : [...saved, post._id];
                        localStorage.setItem(savedKey, JSON.stringify(next));
                        setBookmarked(!bookmarked);
                    }}
                    className={`p-2 rounded-xl transition-all ${bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-yellow-500' : ''}`} />
                </button>
            </div>

            {/* Comments section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="px-5 py-4 space-y-3">
                            {post.comments?.map((comment, i) => (
                                <div key={i} className="flex gap-3">
                                    <img
                                        src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}`}
                                        alt={comment.user?.name}
                                        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0 ring-1 ring-white/10"
                                        onClick={() => onUserClick(comment.user)}
                                    />
                                    <div className="flex-1 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <p
                                            className="text-xs font-bold text-white capitalize mb-0.5 cursor-pointer hover:text-red-500 transition-colors"
                                            onClick={() => onUserClick(comment.user)}
                                        >
                                            {comment.user?.name}
                                        </p>
                                        <p className="text-sm text-gray-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))}

                            {currentUser && (
                                <form onSubmit={handleComment} className="flex gap-3 pt-1">
                                    <img
                                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                                        alt={currentUser.name}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                                    />
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Who to Follow Sidebar ────────────────────────────────────────────────────
const WhoToFollow = ({ currentUser, onUserClick }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [following, setFollowing] = useState({});

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get('/users');
                const filtered = res.data
                    .filter(u => u._id !== currentUser?._id)
                    .slice(0, 5);
                setSuggestions(filtered);
            } catch { /* silent */ }
        };
        if (currentUser) fetchSuggestions();
    }, [currentUser]);

    const handleFollow = async (userId) => {
        try {
            await api.put(`/users/${userId}/follow`);
            setFollowing(f => ({ ...f, [userId]: true }));
        } catch { /* silent */ }
    };

    if (!currentUser || suggestions.length === 0) return null;

    return (
        <div className="rounded-2xl p-5" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-white text-sm">Who to Follow</h3>
            </div>
            <div className="space-y-4">
                {suggestions.map(u => (
                    <div key={u._id} className="flex items-center gap-3">
                        <img
                            src={u.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                            onClick={() => onUserClick(u)}
                        />
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-sm font-semibold text-white capitalize truncate cursor-pointer hover:text-red-500 transition-colors"
                                onClick={() => onUserClick(u)}
                            >
                                {u.name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                {u.xp || 0} XP · Lv {calculateLevel(u.xp)}
                            </p>
                        </div>
                        {!following[u._id] ? (
                            <button
                                onClick={() => handleFollow(u._id)}
                                className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                                Follow
                            </button>
                        ) : (
                            <span className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Done
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Trending Topics ──────────────────────────────────────────────────────────
const TrendingPanel = () => {
    const topics = [
        { tag: '#ElevateX', count: '2.4k posts' },
        { tag: '#Productivity', count: '1.8k posts' },
        { tag: '#WebDev', count: '1.2k posts' },
        { tag: '#AITools', count: '980 posts' },
        { tag: '#OpenSource', count: '760 posts' },
    ];
    return (
        <div className="rounded-2xl p-5" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-white text-sm">Trending</h3>
            </div>
            <div className="space-y-3">
                {topics.map((t, i) => (
                    <div key={t.tag} className="flex items-center justify-between group cursor-pointer">
                        <div>
                            <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{t.tag}</p>
                            <p className="text-xs text-gray-400">{t.count}</p>
                        </div>
                        <span className="text-xs text-gray-600 font-mono">#{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Feed ────────────────────────────────────────────────────────────────
const Feed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [likesModalPostId, setLikesModalPostId] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'following'

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const postId = params.get('postId');
            let feedPosts = [];
            try {
                const res = user ? await api.get('/posts/feed') : await api.get('/posts');
                feedPosts = res.data;
            } catch { /* silent */ }

            if (postId && !feedPosts.find(p => p._id === postId)) {
                try {
                    const res = await api.get(`/posts/${postId}`);
                    if (res.data) feedPosts = [res.data, ...feedPosts];
                } catch { /* silent */ }
            }
            setPosts(feedPosts);
            setLoading(false);
        };
        init();

        if (location.state?.restoreUser) {
            setSelectedUser(location.state.restoreUser);
            window.history.replaceState({ ...window.history.state, restoreUser: null }, '');
        }
    }, [user, location.search]);

    useEffect(() => {
        if (!loading && posts.length > 0) {
            const params = new URLSearchParams(location.search);
            const postId = params.get('postId');
            if (postId) {
                setTimeout(() => {
                    const el = document.getElementById(`post-${postId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-red-500', 'ring-offset-2', 'ring-offset-black');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2', 'ring-offset-black'), 2500);
                    }
                }, 500);
            }
        }
    }, [loading, posts, location.search]);

    const handleLike = async (postId) => {
        try {
            const res = await api.put(`/posts/${postId}/like`);
            setPosts(ps => ps.map(p => p._id === postId ? res.data : p));
        } catch { /* silent */ }
    };

    const handleComment = async (postId, text) => {
        try {
            const res = await api.post(`/posts/${postId}/comment`, { text });
            setPosts(ps => ps.map(p => p._id === postId ? res.data : p));
        } catch { /* silent */ }
    };

    const handleDelete = (postId) => { setPostToDelete(postId); setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        try {
            await api.delete(`/posts/${postToDelete}`);
            setPosts(ps => ps.filter(p => p._id !== postToDelete));
            setToast({ type: 'success', message: 'Post deleted successfully' });
        } catch {
            setToast({ type: 'error', message: 'Failed to delete post' });
        } finally {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
        }
    };

    const displayedPosts = filter === 'following'
        ? posts.filter(p => user?.following?.includes(p.author?._id) || p.author?._id === user?._id)
        : posts;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
                    <p className="text-gray-400 text-sm animate-pulse">Loading your feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen pb-20 bg-[#050505]">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* ── Main column ── */}
                    <div>
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent leading-tight pb-1">
                                {user ? 'Your Feed' : 'Explore'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {user ? 'See what your community is sharing' : 'Discover what the community is up to'}
                            </p>
                        </div>

                        {/* Filter tabs */}
                        {user && (
                            <div className="flex gap-1 mb-5 rounded-xl p-1 w-fit" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {[['all', 'All Posts', Globe], ['following', 'Following', Users]].map(([val, label, Icon]) => (
                                    <button
                                        key={val}
                                        onClick={() => setFilter(val)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === val
                                            ? 'bg-red-500/10 text-red-500 shadow-sm border border-red-500/20'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" /> {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Composer */}
                        {user && (
                            <PostComposer
                                user={user}
                                onPost={(newPost) => setPosts(ps => [newPost, ...ps])}
                            />
                        )}

                        {/* Posts */}
                        <div className="space-y-4">
                            {displayedPosts.length > 0 ? (
                                displayedPosts.map(post => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        currentUser={user}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        onDelete={handleDelete}
                                        onUserClick={setSelectedUser}
                                        onShowLikes={setLikesModalPostId}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-24 rounded-2xl"
                                    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <MessageCircle className="w-14 h-14 mx-auto mb-4 text-gray-700" />
                                    <p className="text-gray-400 font-medium">
                                        {filter === 'following' ? 'No posts from people you follow yet.' : 'No posts yet.'}
                                    </p>
                                    {filter === 'following' && (
                                        <button
                                            onClick={() => navigate('/search')}
                                            className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all"
                                        >
                                            Discover People
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="hidden lg:flex flex-col gap-5 sticky top-28 self-start">
                        <TrendingPanel />
                        <WhoToFollow currentUser={user} onUserClick={setSelectedUser} />
                    </div>
                </div>
            </div>

            <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => { setShowDeleteConfirm(false); setPostToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />

            {likesModalPostId && (
                <LikesModal
                    postId={likesModalPostId}
                    onClose={() => setLikesModalPostId(null)}
                    onUserClick={(u) => { setSelectedUser(u); setLikesModalPostId(null); }}
                />
            )}

            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default Feed;
