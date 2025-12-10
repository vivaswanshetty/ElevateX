import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Users, CheckCircle, Coins, Zap } from 'lucide-react';

const StatsSection = () => {
    const { tasks } = useData();

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalValue = tasks.reduce((acc, curr) => acc + (curr.coins || 0), 0);

    // Simulated active users (base + dynamic based on tasks)
    const activeUsers = 120 + tasks.length * 2;

    const stats = [
        {
            id: 1,
            label: 'Active Users',
            value: activeUsers,
            suffix: '+',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            id: 2,
            label: 'Tasks Posted',
            value: totalTasks,
            suffix: '',
            icon: Zap,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            id: 3,
            label: 'Tasks Completed',
            value: completedTasks,
            suffix: '',
            icon: CheckCircle,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            id: 4,
            label: 'Total Value (Coins)',
            value: totalValue,
            suffix: '',
            icon: Coins,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ];

    return (
        <section className="py-12 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className={`p-4 rounded-full mb-4 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
                                {stat.value}{stat.suffix}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
