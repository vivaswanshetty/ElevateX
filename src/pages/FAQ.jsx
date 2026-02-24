import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Zap, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'Getting Started',
            questions: [
                { q: 'What is ElevateX?', a: 'ElevateX is a collaborative task marketplace where users can post tasks they need help with and skilled individuals can apply to complete them for virtual coin rewards.' },
                { q: 'How do I create an account?', a: 'Click the "Sign Up" button in the navigation bar, fill in your details including name, email, and password, and you\'re ready to start! Make sure to complete your profile for better opportunities.' },
                { q: 'Is ElevateX free to use?', a: 'Yes! Creating an account and browsing tasks is completely free. You start with an initial coin balance to get started.' },
            ],
        },
        {
            category: 'Tasks & Coins',
            questions: [
                { q: 'How do I earn coins?', a: 'You earn coins by successfully completing tasks posted by other users. Once your work is approved by the task creator, coins are automatically transferred to your wallet.' },
                { q: 'What can I do with coins?', a: 'Coins can be used to post your own tasks, participate in Productivity Duels, unlock premium features, and climb the leaderboard rankings.' },
                { q: 'How do I create a task?', a: 'Navigate to the "Create Task" page, fill in the task details including title, description, category, skill requirements, deadline, and coin reward. Then submit for others to apply!' },
                { q: "Can I get a refund if I'm not satisfied?", a: 'When reviewing submitted work, you have the option to approve or reject it. If you reject, the coins remain in your wallet and the task can be reassigned.' },
            ],
        },
        {
            category: 'Profile & Skills',
            questions: [
                { q: 'How do I update my profile?', a: 'Go to your Profile page and click the "Edit Profile" button. You can update your skills, bio, work experience, education, and portfolio to showcase your expertise.' },
                { q: 'Why should I add skills to my profile?', a: 'Adding skills helps task creators find you for relevant tasks. It also improves your chances of being selected when you apply for tasks matching your expertise.' },
                { q: 'Can I change my username?', a: 'Currently, usernames cannot be changed once set to maintain consistency across the platform. Choose wisely when creating your account!' },
            ],
        },
        {
            category: 'Community & Features',
            questions: [
                { q: 'What is the Leaderboard?', a: 'The Leaderboard ranks users based on their total coins earned. Top performers are showcased on the podium, fostering healthy competition and recognition.' },
                { q: 'What are Productivity Duels?', a: 'Productivity Duels are competitive challenges where you race against another user to complete similar tasks. The winner receives bonus coins and bragging rights!' },
                { q: 'How does the chat feature work?', a: 'The chat feature allows you to communicate with other users about tasks, collaborations, or general networking. Access it from your dashboard.' },
            ],
        },
        {
            category: 'Safety & Support',
            questions: [
                { q: 'How does ElevateX ensure task quality?', a: 'Task creators review and approve all submissions. We also have a rating system (coming soon) and community guidelines to maintain quality standards.' },
                { q: 'What if I encounter inappropriate content?', a: 'Please report any inappropriate content or behavior immediately using our reporting system. We take user safety seriously and will investigate all reports.' },
                { q: 'How can I contact support?', a: 'For any issues or questions, you can reach us at support@elevatex.com or visit our Contact page. We typically respond within 24 hours.' },
                { q: 'Is my personal information safe?', a: 'Absolutely. We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for more details.' },
            ],
        },
    ];

    const toggleFAQ = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen py-20 px-6" style={{ background: '#050505' }}>
            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                        <Zap className="w-3 h-3" fill="currentColor" /> Help Center
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-4">Frequently Asked <span style={{ color: '#ef4444' }}>Questions</span></h1>
                    <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>Everything you need to know about ElevateX</p>
                </motion.div>

                {/* FAQ Sections */}
                <div className="space-y-10">
                    {faqs.map((section, categoryIndex) => (
                        <motion.div key={categoryIndex} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * categoryIndex }}>
                            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                {section.category}
                            </h2>
                            <div className="space-y-2">
                                {section.questions.map((faq, questionIndex) => {
                                    const index = `${categoryIndex}-${questionIndex}`;
                                    const isOpen = openIndex === index;
                                    return (
                                        <div
                                            key={questionIndex}
                                            className="rounded-xl overflow-hidden transition-all"
                                            style={{ background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isOpen ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}
                                        >
                                            <button
                                                onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                                                className="w-full flex items-center justify-between p-5 text-left"
                                            >
                                                <span className="font-semibold text-sm pr-4" style={{ color: isOpen ? '#fff' : 'rgba(255,255,255,0.7)' }}>{faq.q}</span>
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all" style={{ background: isOpen ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isOpen ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                                    {isOpen ? <Minus className="w-3 h-3" style={{ color: '#ef4444' }} /> : <Plus className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.65)' }} />}
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div className="pt-4">{faq.a}</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-16 text-center rounded-2xl p-12"
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
                >
                    <MessageSquare className="w-10 h-10 mx-auto mb-4" style={{ color: '#ef4444' }} />
                    <h2 className="text-2xl font-bold mb-3 text-white">Still have questions?</h2>
                    <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>We're here to help! Reach out to our support team.</p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    >
                        Contact Support
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQ;
