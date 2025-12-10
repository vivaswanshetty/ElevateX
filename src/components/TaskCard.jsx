import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Star, Zap, Calendar, User } from 'lucide-react';

const TaskCard = ({ task }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const creatorName = task.createdBy?.name || task.by || 'Anonymous';
    const creatorAvatar = task.createdBy?.avatar;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="h-full flex flex-col glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer border border-white/10 hover:border-indigo-500/30 transition-colors shadow-xl"
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${task.category === 'Development' ? 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/10' :
                        task.category === 'Design' ? 'border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/10' :
                            task.category === 'Marketing' ? 'border-pink-500/20 text-pink-600 dark:text-pink-400 bg-pink-500/10' :
                                'border-green-500/20 text-green-600 dark:text-green-400 bg-green-500/10'
                        }`}>
                        {task.category}
                    </span>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">{task.rating || '5.0'}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {task.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {task.description || task.desc}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Reward</span>
                            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{task.coins || task.price?.replace(' Coins', '')}</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Deadline</span>
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium text-xs">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(task.deadline)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt={creatorName} className="w-6 h-6 rounded-full object-cover ring-2 ring-white/10" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white/10">
                                    {creatorName.charAt(0)}
                                </div>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">by <span className="text-gray-900 dark:text-gray-200">{creatorName}</span></span>
                        </div>

                        {task.xp && (
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                +{task.xp} XP
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
