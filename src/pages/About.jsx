import React from 'react';
import { ArrowLeft, Target, Users, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();

    const values = [
        {
            icon: Target,
            title: 'Mission-Driven',
            description: 'Empowering individuals to achieve more through collaborative task completion and skill development.'
        },
        {
            icon: Users,
            title: 'Community First',
            description: 'Building a vibrant ecosystem where everyone can contribute, learn, and grow together.'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Leveraging cutting-edge technology to create seamless and engaging user experiences.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'Committed to delivering high-quality solutions that exceed expectations every time.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-black pt-24 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight pb-2">
                        About ElevateX
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        A revolutionary platform that connects task creators with skilled doers,
                        fostering collaboration and productivity in a gamified environment.
                    </p>
                </div>

                {/* Story Section */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Our Story</h2>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <p>
                            ElevateX was born from a simple observation: talented individuals often struggle to find
                            meaningful opportunities to showcase their skills, while others need help completing tasks
                            that fall outside their expertise.
                        </p>
                        <p>
                            We envisioned a platform that bridges this gap—a space where anyone can post tasks they need
                            help with, and skilled individuals can apply to complete them for rewards. What started as an
                            idea has grown into a thriving community of doers, creators, and collaborators.
                        </p>
                        <p>
                            Today, ElevateX stands as a testament to the power of collaboration, combining gamification,
                            social features, and cutting-edge technology to create an ecosystem where everyone wins.
                        </p>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">Our Core Values</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">{value.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-xl p-12 text-white text-center">
                    <h2 className="text-3xl font-bold mb-8">ElevateX By The Numbers</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="transform hover:scale-110 transition-transform">
                            <div className="text-5xl font-bold mb-2">10K+</div>
                            <div className="text-purple-100">Active Users</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform">
                            <div className="text-5xl font-bold mb-2">50K+</div>
                            <div className="text-purple-100">Tasks Completed</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform">
                            <div className="text-5xl font-bold mb-2">100K+</div>
                            <div className="text-purple-100">Coins Earned</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
