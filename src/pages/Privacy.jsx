import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const sections = [
    {
        title: '1. Information We Collect',
        content: 'At ElevateX, we collect information that you provide directly to us when you create an account, complete tasks, or communicate with other users. This includes:',
        list: ['Name, email address, and profile information', 'Skills, experience, and portfolio details', 'Task creation and completion data', 'Payment and transaction information', 'Communication and chat data'],
    },
    {
        title: '2. How We Use Your Information',
        content: 'We use the information we collect to:',
        list: ['Provide, maintain, and improve our services', 'Process transactions and send related information', 'Send you technical notices, updates, and support messages', 'Respond to your comments and questions', 'Monitor and analyze trends, usage, and activities', 'Detect, prevent, and address technical issues and fraud'],
    },
    {
        title: '3. Information Sharing',
        content: 'We do not sell your personal information. We may share your information only in the following circumstances:',
        list: ['With your consent or at your direction', 'With service providers who perform services on our behalf', 'To comply with legal obligations', 'To protect the rights and safety of ElevateX, our users, and the public'],
    },
    {
        title: '4. Data Security',
        content: 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the internet is 100% secure.',
    },
    {
        title: '5. Your Rights',
        content: 'You have the right to:',
        list: ['Access and receive a copy of your personal data', 'Rectify inaccurate personal data', 'Request deletion of your personal data', 'Object to or restrict processing of your data', 'Data portability', 'Withdraw consent at any time'],
    },
    {
        title: '6. Contact Us',
        content: null,
        custom: (
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@elevatex.com" style={{ color: '#ef4444' }} className="hover:underline">privacy@elevatex.com</a>
            </p>
        ),
    },
];

const Privacy = () => {
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
                        <Shield className="w-3 h-3" /> Legal
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-3">Privacy <span style={{ color: '#ef4444' }}>Policy</span></h1>
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

export default Privacy;
