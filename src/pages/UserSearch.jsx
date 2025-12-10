import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Award, Briefcase, Mail, Linkedin, Twitter, Github, ExternalLink, Filter, X, UserPlus, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserProfileModal from '../components/UserProfileModal';

const UserSearch = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        minXP: '',
        maxXP: '',
        minLevel: '',
        maxLevel: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateLevel = (xp) => Math.floor(xp / 500) + 1;

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
            const userLevel = calculateLevel(user.xp);

            const matchesMinXP = !filters.minXP || user.xp >= parseInt(filters.minXP);
            const matchesMaxXP = !filters.maxXP || user.xp <= parseInt(filters.maxXP);
            const matchesMinLevel = !filters.minLevel || userLevel >= parseInt(filters.minLevel);
            const matchesMaxLevel = !filters.maxLevel || userLevel <= parseInt(filters.maxLevel);

            return matchesSearch && matchesMinXP && matchesMaxXP && matchesMinLevel && matchesMaxLevel;
        });
    }, [users, searchQuery, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minXP: '',
            maxXP: '',
            minLevel: '',
            maxLevel: ''
        });
    };

    const handleFollow = useCallback(async (userId) => {
        if (!currentUser) {
            alert('Please login to follow users');
            return;
        }

        try {
            await api.put(`/users/${userId}/follow`);
            // Refresh users to update follow status
            fetchUsers();
            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser({ ...selectedUser, followers: [...selectedUser.followers, currentUser._id] });
            }
        } catch (error) {
            console.error('Error following user:', error);
            alert(error.response?.data?.message || 'Failed to follow user');
        }
    }, [currentUser, selectedUser]);

    const handleUnfollow = useCallback(async (userId) => {
        if (!currentUser) return;

        try {
            await api.put(`/users/${userId}/unfollow`);
            // Refresh users to update follow status
            fetchUsers();
            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser({
                    ...selectedUser,
                    followers: selectedUser.followers.filter(id => id !== currentUser._id)
                });
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
            alert(error.response?.data?.message || 'Failed to unfollow user');
        }
    }, [currentUser, selectedUser]);

    const isFollowing = (user) => {
        if (!currentUser || !user.followers) return false;
        return user.followers.includes(currentUser._id);
    };

    const getSocialIcon = (platform) => {
        switch (platform) {
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            case 'twitter': return <Twitter className="w-4 h-4" />;
            case 'github': return <Github className="w-4 h-4" />;
            default: return <ExternalLink className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 bg-clip-text text-transparent leading-tight pb-2">
                    Discover Talent
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Connect with talented individuals from around the community
                </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-black dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:bg-gray-50 dark:focus:bg-white/10 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-6 py-4 rounded-xl border flex items-center gap-2 font-medium transition-all ${showFilters
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-black dark:text-white hover:border-yellow-500'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-black dark:text-white">Filter Options</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Min XP
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={filters.minXP}
                                            onChange={(e) => handleFilterChange('minXP', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white outline-none focus:ring-2 focus:ring-yellow-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Max XP
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="10000"
                                            value={filters.maxXP}
                                            onChange={(e) => handleFilterChange('maxXP', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white outline-none focus:ring-2 focus:ring-yellow-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Min Level
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="1"
                                            value={filters.minLevel}
                                            onChange={(e) => handleFilterChange('minLevel', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white outline-none focus:ring-2 focus:ring-yellow-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Max Level
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            value={filters.maxLevel}
                                            onChange={(e) => handleFilterChange('maxLevel', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white outline-none focus:ring-2 focus:ring-2 focus:ring-red-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Count */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </div>
            </div>

            {/* User Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <motion.div
                            key={user._id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedUser(user)}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl cursor-pointer hover:border-yellow-500 transition-all group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(user.name)}&mouth=smile,laughing,smirk`}
                                        alt={user.name}
                                        className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-white/10 object-cover group-hover:border-yellow-500 transition-colors"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-1">
                                        <span className="text-xs font-bold text-white px-2">L{calculateLevel(user.xp)}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg capitalize text-black dark:text-white truncate group-hover:text-yellow-600 transition-colors">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {user.bio || 'No bio yet'}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">XP</span>
                                    </div>
                                    <p className="text-lg font-bold text-black dark:text-white">{user.xp || 0}</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Coins</span>
                                    </div>
                                    <p className="text-lg font-bold text-black dark:text-white">{user.coins || 0}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <button className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                View Profile
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <User className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                        </p>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            <UserProfileModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onFollowChange={fetchUsers}
            />
        </div>
    );
};

export default UserSearch;
