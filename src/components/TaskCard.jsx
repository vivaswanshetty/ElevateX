import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Zap, Calendar, User, Coins } from 'lucide-react';

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
    const coins = Number(task.coins || task.price?.replace(/[^0-9]/g, '') || 0);
    const xp = Math.floor(10 + (coins / 10));

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="flex flex-col p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300"
            style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)'
                        }}
                    >
                        {task.category || 'General'}
                    </span>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">{task.rating || '5.0'}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-red-500 transition-colors line-clamp-1 leading-snug">
                    {task.title}
                </h3>

                <p className="text-sm mb-6 line-clamp-2 flex-grow leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {task.description || task.desc}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Reward</span>
                            <div className="flex items-center gap-1.5 font-black text-white">
                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                <span>{coins}</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Deadline</span>
                            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                                <Calendar className="w-3.5 h-3.5 text-white/40" />
                                <span>{formatDate(task.deadline)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2.5">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt={creatorName} className="w-7 h-7 rounded-full object-cover ring-2 ring-[#111]" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#111]">
                                    {creatorName.charAt(0)}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>Posted by</span>
                                <span className="text-xs font-bold text-white">{creatorName}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                            <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                            <span className="text-xs font-bold text-purple-400">
                                +{xp} XP
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
