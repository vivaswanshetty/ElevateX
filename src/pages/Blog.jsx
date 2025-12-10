import React from 'react';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const navigate = useNavigate();

    const blogPosts = [
        {
            id: 1,
            title: 'The Future of Collaborative Work: How ElevateX is Changing the Game',
            excerpt: 'Discover how our platform is revolutionizing the way people connect, collaborate, and complete tasks in the digital age.',
            author: 'Sarah Johnson',
            date: 'November 25, 2025',
            category: 'Platform Updates',
            image: '🚀',
            readTime: '5 min read'
        },
        {
            id: 2,
            title: '10 Tips to Maximize Your Earnings on ElevateX',
            excerpt: 'Expert strategies to help you stand out, win more tasks, and boost your coin balance on the platform.',
            author: 'Michael Chen',
            date: 'November 22, 2025',
            category: 'Tips & Tricks',
            image: '💰',
            readTime: '7 min read'
        },
        {
            id: 3,
            title: 'Building Your Profile: Best Practices for Success',
            excerpt: 'Learn how to create a compelling profile that attracts task creators and showcases your unique skills.',
            author: 'Emma Williams',
            date: 'November 20, 2025',
            category: 'Guides',
            image: '✨',
            readTime: '6 min read'
        },
        {
            id: 4,
            title: 'Community Spotlight: Success Stories from Top Users',
            excerpt: 'Meet the achievers who have transformed their ElevateX journey into remarkable success stories.',
            author: 'David Park',
            date: 'November 18, 2025',
            category: 'Community',
            image: '🌟',
            readTime: '8 min read'
        },
        {
            id: 5,
            title: 'Understanding the ElevateX Coin Economy',
            excerpt: 'A deep dive into how our virtual currency works and how to make the most of it.',
            author: 'Lisa Anderson',
            date: 'November 15, 2025',
            category: 'Features',
            image: '🪙',
            readTime: '4 min read'
        },
        {
            id: 6,
            title: 'New Feature Alert: Productivity Duels Are Here!',
            excerpt: 'Challenge your peers and showcase your skills in our exciting new competitive feature.',
            author: 'James Rodriguez',
            date: 'November 12, 2025',
            category: 'Product News',
            image: '⚔️',
            readTime: '3 min read'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/10 dark:to-black py-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight pb-2">
                        ElevateX Blog
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                        Insights, tips, and stories from the ElevateX community
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
                        >
                            {/* Image/Icon */}
                            <div className="h-48 bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                                {post.image}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {post.readTime}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-black dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{post.date}</span>
                                    </div>
                                </div>

                                <button className="mt-4 flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 transition-all">
                                    Read More
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Section */}
                <div className="mt-16 text-center bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Stay Tuned for More!</h2>
                    <p className="text-lg text-orange-100 mb-6">
                        We're constantly publishing new content to help you succeed on ElevateX.
                    </p>
                    <button className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105">
                        Subscribe to Newsletter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;
