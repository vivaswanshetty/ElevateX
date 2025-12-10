import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal';

const Leaderboard = () => {
    const { users, fetchUsers } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        fetchUsers();

        // Check if we need to restore profile modal
        if (location.state?.restoreUser) {
            setSelectedUser(location.state.restoreUser);
            window.history.replaceState({ ...window.history.state, restoreUser: null }, '');
        }
    }, []);

    const sortedUsers = Object.values(users).sort((a, b) => b.xp - a.xp);
    const top3 = sortedUsers.slice(0, 3);
    const rest = sortedUsers.slice(3);

    const totalXP = sortedUsers.reduce((acc, user) => acc + (user.xp || 0), 0);

    return (
        <div className="pt-24 min-h-screen container mx-auto px-6 max-w-5xl pb-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard
                </h1>
                <p className="text-gray-400 mb-6">Top performers earning the most XP this week.</p>

                <div className="inline-flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-black dark:text-white">{totalXP.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">Total XP Earned</span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-black dark:text-white">{sortedUsers.length}</span>
                        <span className="text-sm text-gray-500">Active Players</span>
                    </div>
                </div>
            </div>

            {/* Podium Section */}
            <div className="flex justify-center items-end gap-4 md:gap-8 mb-16 min-h-[300px]">
                {/* 2nd Place */}
                {top3[1] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => setSelectedUser(top3[1])}
                        className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="relative mb-4">
                            <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-300 shadow-lg" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-300 text-black text-xs font-bold px-2 py-0.5 rounded-full">2nd</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-black dark:text-white truncate max-w-[100px]">{top3[1].name}</div>
                            <div className="text-sm text-indigo-500 font-bold">{top3[1].xp} XP</div>
                        </div>
                        <div className="w-20 md:w-24 h-32 bg-gradient-to-t from-gray-400/20 to-gray-300/20 rounded-t-lg border-t border-gray-300/30 backdrop-blur-sm flex items-end justify-center pb-4">
                            <Medal className="w-8 h-8 text-gray-400 opacity-50" />
                        </div>
                    </motion.div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedUser(top3[0])}
                        className="flex flex-col items-center z-10 cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="relative mb-4">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                                <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                            </div>
                            <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-0.5 rounded-full">1st</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-lg text-black dark:text-white truncate max-w-[120px]">{top3[0].name}</div>
                            <div className="text-indigo-500 font-bold">{top3[0].xp} XP</div>
                        </div>
                        <div className="w-24 md:w-32 h-40 bg-gradient-to-t from-yellow-500/20 to-yellow-400/20 rounded-t-lg border-t border-yellow-500/30 backdrop-blur-sm flex items-end justify-center pb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
                            <Trophy className="w-10 h-10 text-yellow-500 opacity-50 relative z-10" />
                        </div>
                    </motion.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => setSelectedUser(top3[2])}
                        className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="relative mb-4">
                            <img src={top3[2].avatar} alt={top3[2].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-400 shadow-lg" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">3rd</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-black dark:text-white truncate max-w-[100px]">{top3[2].name}</div>
                            <div className="text-sm text-indigo-500 font-bold">{top3[2].xp} XP</div>
                        </div>
                        <div className="w-20 md:w-24 h-24 bg-gradient-to-t from-orange-500/20 to-orange-400/20 rounded-t-lg border-t border-orange-400/30 backdrop-blur-sm flex items-end justify-center pb-4">
                            <Medal className="w-8 h-8 text-orange-400 opacity-50" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* List Section */}
            <div className="space-y-3 max-w-3xl mx-auto">
                {rest.map((user, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        key={user.name}
                        onClick={() => setSelectedUser(user)}
                        className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="font-bold text-gray-500 w-8 text-center">{index + 4}</div>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border border-white/10"
                            />
                            <div>
                                <h3 className="font-bold text-black dark:text-white">{user.name}</h3>
                                <p className="text-xs text-gray-500">Level {Math.floor(user.xp / 500) + 1}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-bold text-indigo-500">{user.xp} XP</div>
                            <div className="text-xs text-gray-500">{user.coins} Coins</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <UserProfileModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onFollowChange={fetchUsers}
            />
        </div>
    );
};
export default Leaderboard;
