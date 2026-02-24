import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import api from '../api/axios';

const SinglePost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Post not found or deleted');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleUpdate = (updatedPost) => {
        setPost(updatedPost);
    };

    const handleDelete = () => {
        // Navigate back to profile with the correct tab if coming from profile
        if (location.state?.from === 'profile' && location.state?.activeTab && location.state?.postId) {
            const url = `/profile?tab=${location.state.activeTab}&scrollTo=${location.state.postId}`;
            navigate(url);
        } else {
            navigate(-1);
        }
    };

    const handleBack = () => {
        // Navigate back to profile with the correct tab if coming from profile
        if (location.state?.from === 'profile' && location.state?.activeTab && location.state?.postId) {
            const url = `/profile?tab=${location.state.activeTab}&scrollTo=${location.state.postId}`;
            navigate(url);
        } else {
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-[#050505]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4 bg-[#050505]">
                <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
                <button
                    onClick={() => navigate('/feed')}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen pb-20 bg-[#050505]">
            <div className="container mx-auto px-6 max-w-2xl">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {post && (
                    <PostCard
                        post={post}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </div>
    );
};

export default SinglePost;
