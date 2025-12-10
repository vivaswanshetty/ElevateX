import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Layout, Server, Database, ArrowLeft, Code, Layers, Zap,
    Shield, Lock, Users, MessageSquare, TrendingUp, FileText,
    CheckCircle, Coffee, Sparkles, Terminal, Globe, Box
} from 'lucide-react';

const techDetails = {
    frontend: {
        title: "Frontend Architecture",
        icon: Layout,
        color: "from-blue-500 to-cyan-500",
        glowColor: "rgba(59, 130, 246, 0.4)",
        description: "A modern, responsive React application built with cutting-edge technologies for optimal user experience.",
        technologies: [
            {
                name: "React 18",
                icon: Code,
                description: "Latest React with concurrent features and automatic batching for better performance.",
                features: ["Concurrent Rendering", "Suspense", "Server Components", "Hooks API"]
            },
            {
                name: "Framer Motion",
                icon: Sparkles,
                description: "Production-ready motion library for React with stunning animations.",
                features: ["Gesture Animations", "Layout Animations", "SVG Animations", "3D Transforms"]
            },
            {
                name: "Tailwind CSS",
                icon: Layers,
                description: "Utility-first CSS framework for rapid UI development.",
                features: ["Dark Mode Support", "Custom Design System", "Responsive Design", "JIT Compiler"]
            },
            {
                name: "React Router",
                icon: Globe,
                description: "Declarative routing for React applications with dynamic navigation.",
                features: ["Nested Routes", "Lazy Loading", "Protected Routes", "URL Parameters"]
            }
        ],
        features: [
            {
                title: "Trending Home Feed",
                icon: TrendingUp,
                description: "Real-time feed with trending tasks and community activity",
                details: ["Infinite scroll", "Live updates", "Smart filtering", "Personalized content"]
            },
            {
                title: "User Dashboard",
                icon: Users,
                description: "Comprehensive dashboard for managing tasks and tracking progress",
                details: ["Analytics overview", "Activity timeline", "Quick actions", "Performance metrics"]
            },
            {
                title: "Weekly Leaderboard",
                icon: TrendingUp,
                description: "Competitive rankings and achievement tracking",
                details: ["Real-time rankings", "XP progression", "Badge system", "Weekly resets"]
            },
            {
                title: "Task Creation Page",
                icon: FileText,
                description: "Intuitive interface for creating and managing tasks",
                details: ["Rich text editor", "File uploads", "Category selection", "Coin rewards"]
            },
            {
                title: "Real-time Chat",
                icon: MessageSquare,
                description: "Instant messaging with WebSocket support",
                details: ["Read receipts", "Typing indicators", "File sharing", "Emoji reactions"]
            }
        ]
    },
    backend: {
        title: "Backend Infrastructure",
        icon: Server,
        color: "from-purple-500 to-pink-500",
        glowColor: "rgba(168, 85, 247, 0.4)",
        description: "Robust Node.js backend with Express framework ensuring scalability and security.",
        technologies: [
            {
                name: "Node.js",
                icon: Terminal,
                description: "JavaScript runtime built on Chrome's V8 engine for high-performance server-side applications.",
                features: ["Event-driven", "Non-blocking I/O", "NPM Ecosystem", "Cluster Mode"]
            },
            {
                name: "Express.js",
                icon: Server,
                description: "Fast, unopinionated web framework for Node.js.",
                features: ["Middleware Support", "RESTful APIs", "Error Handling", "Static File Serving"]
            },
            {
                name: "Socket.io",
                icon: Zap,
                description: "Real-time bidirectional event-based communication.",
                features: ["WebSocket Protocol", "Auto-reconnection", "Room Support", "Broadcasting"]
            },
            {
                name: "JWT & Bcrypt",
                icon: Shield,
                description: "Industry-standard authentication and encryption.",
                features: ["Token-based Auth", "Password Hashing", "Secure Sessions", "Role Management"]
            }
        ],
        features: [
            {
                title: "Secure REST API",
                icon: Server,
                description: "Well-structured RESTful endpoints with comprehensive documentation",
                details: ["HTTPS only", "Rate limiting", "CORS configured", "API versioning"]
            },
            {
                title: "JWT Authentication",
                icon: Lock,
                description: "Token-based authentication for secure user sessions",
                details: ["Access tokens", "Refresh tokens", "Token rotation", "Expiry management"]
            },
            {
                title: "Role-based Access Control",
                icon: Shield,
                description: "Granular permission system for different user roles",
                details: ["Admin privileges", "User permissions", "Task ownership", "Resource access control"]
            },
            {
                title: "Task Lifecycle Tracking",
                icon: CheckCircle,
                description: "Complete task state management and history",
                details: ["Status transitions", "Audit logs", "Version control", "Activity tracking"]
            },
            {
                title: "Notification System",
                icon: MessageSquare,
                description: "Multi-channel notification delivery system",
                details: ["Real-time alerts", "Email notifications", "Push notifications", "Notification preferences"]
            }
        ]
    },
    database: {
        title: "Database Design",
        icon: Database,
        color: "from-orange-500 to-red-500",
        glowColor: "rgba(249, 115, 22, 0.4)",
        description: "MongoDB NoSQL database optimized for performance with intelligent schema design.",
        technologies: [
            {
                name: "MongoDB",
                icon: Database,
                description: "Flexible NoSQL database for modern applications.",
                features: ["Document-based", "Horizontal Scaling", "ACID Transactions", "Aggregation Pipeline"]
            },
            {
                name: "Mongoose ODM",
                icon: Box,
                description: "Elegant MongoDB object modeling for Node.js.",
                features: ["Schema Validation", "Middleware Hooks", "Virtual Properties", "Population"]
            },
            {
                name: "Redis Cache",
                icon: Zap,
                description: "In-memory data structure store for caching.",
                features: ["Sub-millisecond latency", "Pub/Sub messaging", "Session storage", "Cache expiration"]
            },
            {
                name: "Database Indexing",
                icon: TrendingUp,
                description: "Optimized indexes for fast query performance.",
                features: ["Compound Indexes", "Text Search", "Geospatial Queries", "Index Analytics"]
            }
        ],
        features: [
            {
                title: "Users Schema",
                icon: Users,
                description: "Comprehensive user data model with validation",
                details: ["Profile information", "Authentication data", "Preferences", "Activity history"]
            },
            {
                title: "Tasks Schema",
                icon: FileText,
                description: "Flexible task structure supporting various task types",
                details: ["Task metadata", "Status tracking", "File attachments", "Relationships"]
            },
            {
                title: "Leaderboard Data",
                icon: TrendingUp,
                description: "Efficient ranking system with real-time updates",
                details: ["XP calculations", "Rank positions", "Historical data", "Achievement tracking"]
            },
            {
                title: "Chat History",
                icon: MessageSquare,
                description: "Scalable message storage with search capabilities",
                details: ["Message threading", "Media storage", "Search indexing", "Retention policies"]
            },
            {
                title: "Optimized Indexing",
                icon: Zap,
                description: "Strategic indexes for lightning-fast queries",
                details: ["Query optimization", "Index monitoring", "Performance tuning", "Background indexing"]
            }
        ]
    }
};

const TechStack = () => {
    const { category = 'frontend' } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(category);
    const currentSection = techDetails[activeTab];

    const tabs = [
        { key: 'frontend', label: 'Frontend', icon: Layout },
        { key: 'backend', label: 'Backend', icon: Server },
        { key: 'database', label: 'Database', icon: Database }
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-300">
            {/* Animated Background Effects */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-r from-orange-400/20 to-pink-500/20 rounded-full blur-3xl"
            />

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        background: `radial-gradient(circle, ${i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#A78BFA' : '#FB923C'}, transparent)`,
                        boxShadow: `0 0 20px ${i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#A78BFA' : '#FB923C'}`,
                    }}
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * 1000,
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, Math.random() * 1000],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 15,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}

            <div className="container mx-auto px-6 relative z-10">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05, x: -5 }}
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back to Home</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-800/30 mb-6"
                    >
                        <Coffee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">Technical Deep Dive</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 leading-tight pb-2">
                        Technology Stack
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Explore the powerful technologies and architecture that power ElevateX
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mb-12 gap-4 flex-wrap"
                >
                    {tabs.map((tab, index) => (
                        <motion.button
                            key={tab.key}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all ${activeTab === tab.key
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl scale-105'
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg'
                                }`}
                        >
                            <tab.icon className="w-6 h-6" />
                            {tab.label}
                        </motion.button>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Section Header */}
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.div
                                className={`inline-flex p-6 bg-gradient-to-r ${currentSection.color} rounded-3xl shadow-2xl mb-6`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <currentSection.icon className="w-12 h-12 text-white" />
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                                {currentSection.title}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                {currentSection.description}
                            </p>
                        </motion.div>

                        {/* Technologies Section */}
                        <div className="mb-16">
                            <h3 className="text-3xl font-black mb-8 text-center text-gray-900 dark:text-white">
                                Core Technologies
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {currentSection.technologies.map((tech, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                                        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.15 } }}
                                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all group"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <motion.div
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.3 }}
                                                className={`p-4 bg-gradient-to-r ${currentSection.color} rounded-2xl shadow-lg`}
                                            >
                                                <tech.icon className="w-8 h-8 text-white" />
                                            </motion.div>
                                            <div>
                                                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                                    {tech.name}
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {tech.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            {tech.features.map((feature, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 + index * 0.05 + i * 0.02, duration: 0.2 }}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <CheckCircle className={`w-4 h-4 bg-gradient-to-r ${currentSection.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Features Section */}
                        <div>
                            <h3 className="text-3xl font-black mb-8 text-center text-gray-900 dark:text-white">
                                Key Features
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentSection.features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.04, duration: 0.3 }}
                                        whileHover={{ y: -10, scale: 1.05, transition: { duration: 0.15 } }}
                                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all group"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 10, transition: { duration: 0.2 } }}
                                            className={`w-12 h-12 bg-gradient-to-r ${currentSection.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                                        >
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                                            {feature.title}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                            {feature.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className={`w-1.5 h-1.5 bg-gradient-to-r ${currentSection.color} rounded-full`} />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TechStack;
