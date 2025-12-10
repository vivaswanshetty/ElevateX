import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Lock, Users, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
    {
        id: 1,
        title: "Post a Task",
        desc: "Describe your needs, set a budget, and choose a category.",
        icon: FileText,
        color: "from-blue-500 to-cyan-500",
        iconColor: "text-blue-500",
        bgColor: "bg-blue-500/10 dark:bg-blue-500/5"
    },
    {
        id: 2,
        title: "Lock Coins",
        desc: "Secure the payment in escrow. Funds are safe until you're satisfied.",
        icon: Lock,
        color: "from-yellow-500 to-orange-500",
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-500/10 dark:bg-yellow-500/5"
    },
    {
        id: 3,
        title: "Collaborate",
        desc: "Chat with applicants, review work, and provide feedback.",
        icon: Users,
        color: "from-purple-500 to-pink-500",
        iconColor: "text-purple-500",
        bgColor: "bg-purple-500/10 dark:bg-purple-500/5"
    },
    {
        id: 4,
        title: "Release & Rate",
        desc: "Approve the work to release funds and rate your experience.",
        icon: CheckCircle,
        color: "from-green-500 to-emerald-500",
        iconColor: "text-green-500",
        bgColor: "bg-green-500/10 dark:bg-green-500/5"
    }
];

const HowItWorks = () => {
    const navigate = useNavigate();

    return (
        <section className="py-16 bg-transparent relative overflow-hidden">
            {/* Background Decorations */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl pointer-events-none"
            />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800/30 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Simple Process</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 pb-2">
                        How ElevateX Works
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A simple, secure, and gamified workflow to get things done.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { delay: index * 0.15, duration: 0.6 }
                                }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                whileHover={{
                                    scale: 1.05,
                                    y: -10,
                                    transition: { duration: 0.2 }
                                }}
                                className={`relative group ${(index === 0 || index === 2) ? 'z-20' : 'z-10'}`}
                            >
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 z-10">
                                    {/* Gradient Glow on Hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                                    />

                                    {/* Radial Glow Effect on Hover */}
                                    <div
                                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
                                        style={{
                                            background: `radial-gradient(circle at center, ${index === 0 ? 'rgba(59, 130, 246, 0.3)' :
                                                index === 1 ? 'rgba(234, 179, 8, 0.3)' :
                                                    index === 2 ? 'rgba(168, 85, 247, 0.3)' :
                                                        'rgba(34, 197, 94, 0.3)'
                                                }, transparent 70%)`
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 flex gap-6">
                                        {/* Number Badge */}
                                        <motion.div
                                            className="flex-shrink-0"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                                                <span className="text-2xl font-black text-white">{step.id}</span>
                                            </div>
                                        </motion.div>

                                        {/* Text Content */}
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Arrow - perfectly centered between cards */}
                                {(index === 0 || index === 2) && (
                                    <div
                                        className="hidden md:block absolute top-1/2 -translate-y-1/2 z-50"
                                        style={{
                                            right: 'calc(-2rem - 5px)',
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl cursor-pointer relative z-50 ring-4 ring-white dark:ring-gray-900"
                                            style={{
                                                background:
                                                    index % 4 === 0
                                                        ? 'radial-gradient(circle, #3b82f6, #1d4ed8)' // Blue
                                                        : index % 4 === 1
                                                            ? 'radial-gradient(circle, #6366f1, #4338ca)' // Indigo
                                                            : index % 4 === 2
                                                                ? 'radial-gradient(circle, #8b5cf6, #6d28d9)' // Purple
                                                                : 'radial-gradient(circle, #ec4899, #db2777)', // Pink
                                            }}
                                        >
                                            <ArrowRight className="w-6 h-6 text-white" />
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/explore')}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-3 shadow-xl"
                    >
                        Start Your Journey
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
