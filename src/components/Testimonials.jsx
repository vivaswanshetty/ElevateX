import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, Sparkles, Heart } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: "Alex Johnson",
        role: "Freelance Developer",
        content: "ElevateX helped me find quick gigs to fill my schedule. The coin system is addictive!",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        rating: 5,
        gradient: "from-blue-500 to-cyan-500",
        glowColor: "59, 130, 246"
    },
    {
        id: 2,
        name: "Sarah Williams",
        role: "Digital Artist",
        content: "I love the gamification. Leveling up while earning real value is a game changer.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        rating: 5,
        gradient: "from-pink-500 to-rose-500",
        glowColor: "236, 72, 153"
    },
    {
        id: 3,
        name: "Michael Chen",
        role: "Student",
        content: "Perfect for students. I can do small tasks between classes and earn extra pocket money.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        rating: 5,
        gradient: "from-purple-500 to-indigo-500",
        glowColor: "168, 85, 247"
    },
    {
        id: 4,
        name: "Emily Davis",
        role: "Content Creator",
        content: "The community is so supportive. It's not just a marketplace, it's a hub for growth.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        rating: 5,
        gradient: "from-orange-500 to-amber-500",
        glowColor: "251, 146, 60"
    },
    {
        id: 5,
        name: "David Kim",
        role: "UI Designer",
        content: "Found my first long-term client here through a micro-task. Highly recommend!",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        rating: 5,
        gradient: "from-emerald-500 to-teal-500",
        glowColor: "16, 185, 129"
    }
];

const Testimonials = () => {
    return (
        <section className="py-16 bg-transparent overflow-hidden relative">
            {/* Reduced Particle System */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`testimonial-particle-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 3 + 2,
                        height: Math.random() * 3 + 2,
                        background: i % 2 === 0
                            ? 'radial-gradient(circle, #3b82f6, #06b6d4)'
                            : 'radial-gradient(circle, #ec4899, #f43f5e)',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                        zIndex: 1,
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                        y: Math.random() * 800,
                        opacity: 0.2
                    }}
                    animate={{
                        y: [null, Math.random() * 800],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 15 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Static Background Blobs */}
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-rose-500/20 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 mb-20 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Static Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/40 dark:to-pink-900/40 border-2 border-orange-300 dark:border-orange-500/50 mb-6 shadow-xl backdrop-blur-md">
                        <Heart className="w-5 h-5 text-orange-600 dark:text-orange-300 fill-orange-600 dark:fill-orange-300" />
                        <span className="text-sm font-black text-orange-700 dark:text-orange-200 tracking-wider">User Love</span>
                        <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                    </div>

                    {/* Epic Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="relative text-5xl md:text-7xl font-black mb-6"
                    >
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-400 pb-2"
                        >
                            Community Stories
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium"
                    >
                        Hear from the people who are <span className="font-black text-pink-600 dark:text-pink-400">elevating their skills</span> and earnings.
                    </motion.p>
                </motion.div>
            </div>

            {/* INSANE Testimonial Cards Carousel */}
            <div className="relative flex overflow-x-hidden group">
                <motion.div
                    className="flex animate-marquee whitespace-nowrap gap-8 py-8"
                    whileHover={{ animationPlayState: "paused" }}
                >
                    {[...testimonials, ...testimonials, ...testimonials].map((item, index) => (
                        <motion.div
                            key={`${item.id}-${index}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.5,
                                    delay: index * 0.03,
                                    ease: "easeOut"
                                }
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            whileHover={{
                                scale: 1.05,
                                y: -10,
                                transition: { duration: 0.2 }
                            }}
                            className="w-[380px] md:w-[450px] flex-shrink-0 relative group/card cursor-pointer"
                        >
                            {/* Card Container */}
                            <div className="relative h-full p-8 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl shadow-2xl border-2 border-white/30 dark:border-white/10 overflow-hidden">
                                {/* Static Background Gradient */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
                                    style={{
                                        background: `linear-gradient(135deg, transparent, rgba(${item.glowColor}, 0.15), transparent)`
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-start gap-4 mb-5">
                                        {/* Simple Avatar */}
                                        <div className="relative">
                                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} p-1 shadow-xl`}>
                                                <img
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    className="w-full h-full rounded-full bg-white dark:bg-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-black text-xl text-gray-900 dark:text-white mb-1">{item.name}</h4>
                                            <p className={`text-sm font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-2 pb-1`}
                                                style={{
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent"
                                                }}
                                            >
                                                {item.role}
                                            </p>
                                            {/* Static Star Rating */}
                                            <div className="flex gap-1">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quote Icon */}
                                        <Quote className={`w-10 h-10 text-${item.gradient.split(' ')[1].replace('to-', '')} opacity-20`} />
                                    </div>

                                    {/* Content */}
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-normal leading-relaxed text-base font-medium">
                                        "{item.content}"
                                    </p>

                                    {/* Bottom Accent Line */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} />
                                </div>
                            </div>

                            {/* Mega Glow Around Card */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl blur-2xl -z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: `linear-gradient(135deg, rgba(${item.glowColor}, 0.4), rgba(${item.glowColor}, 0.2))`
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Enhanced Gradient Fade Edges */}
            <div className="absolute top-0 left-0 h-full w-40 bg-gradient-to-r from-white dark:from-black via-white/90 dark:via-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-white dark:from-black via-white/90 dark:via-black/90 to-transparent z-10 pointer-events-none" />
        </section>
    );
};

export default Testimonials;
