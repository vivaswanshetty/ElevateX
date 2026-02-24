import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using ElevateX, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.' },
    {
        title: '2. User Accounts',
        content: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:',
        list: ['Maintaining the confidentiality of your account credentials', 'All activities that occur under your account', 'Notifying us immediately of any unauthorized use', 'Ensuring your profile information is truthful and up-to-date'],
    },
    {
        title: '3. Task Creation and Completion',
        content: 'Task Creators must provide clear, accurate task descriptions, set fair coin rewards, review and approve/reject submissions in a timely manner, and cannot discriminate against applicants. Task Doers must complete tasks as described, submit work before deadlines, provide quality work, and cannot plagiarize or submit fraudulent work.',
    },
    {
        title: '4. Coins and Virtual Currency',
        content: 'ElevateX uses a virtual coin system for rewards:',
        list: ['Coins have no real-world monetary value', 'Coins can be earned by completing tasks', 'Coins can be spent on creating tasks or platform features', 'Coins cannot be transferred to external payment systems', 'We reserve the right to adjust coin balances for fraud prevention'],
    },
    {
        title: '5. Prohibited Conduct',
        content: 'You agree not to:',
        list: ['Violate any laws or regulations', 'Infringe on intellectual property rights', 'Upload malicious code or viruses', 'Harass, abuse, or harm other users', 'Create multiple accounts to manipulate the system', 'Engage in fraudulent activities', 'Scrape or collect data without permission'],
    },
    { title: '6. Intellectual Property', content: 'The platform, including its original content, features, and functionality, is owned by ElevateX and protected by international copyright, trademark, and other intellectual property laws.' },
    { title: '7. Dispute Resolution', content: 'In case of disputes between users regarding task completion or quality, ElevateX may intervene to facilitate resolution but is not obligated to do so. Our decision in such matters is final.' },
    { title: '8. Termination', content: 'We reserve the right to suspend or terminate your account at any time for violations of these terms, fraudulent activity, or any other reason we deem necessary to protect the platform and its users.' },
    { title: '9. Limitation of Liability', content: 'ElevateX shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.' },
    { title: '10. Changes to Terms', content: 'We reserve the right to modify these terms at any time. We will notify users of any material changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.' },
    {
        title: '11. Contact',
        custom: (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@elevatex.com" style={{ color: '#ef4444' }} className="hover:underline">legal@elevatex.com</a>
            </p>
        ),
    },
];

const Terms = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen pt-24 pb-20 px-6" style={{ background: '#050505' }}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                        <FileText className="w-3 h-3" /> Legal
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-3">Terms of <span style={{ color: '#ef4444' }}>Service</span></h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Last updated: November 28, 2025</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-2xl p-8 md:p-12"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="space-y-10">
                        {sections.map((section, i) => (
                            <section key={i} style={{ borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: i < sections.length - 1 ? '2.5rem' : 0 }}>
                                <h2 className="text-lg font-bold mb-4 text-white">{section.title}</h2>
                                {section.content && <p className="mb-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{section.content}</p>}
                                {section.list && (
                                    <ul className="space-y-2 ml-4">
                                        {section.list.map((item, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {section.custom}
                            </section>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
