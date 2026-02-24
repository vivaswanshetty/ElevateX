import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Shield, Settings, BarChart2, Share2, ToggleRight, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const LAST_UPDATED = 'February 18, 2026';

const sections = [
    {
        icon: Cookie,
        title: 'What Are Cookies?',
        content: `Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you interact with the site. Cookies are not programs — they cannot carry viruses or install malware on your device.

ElevateX uses cookies and similar tracking technologies (such as local storage and session storage) to deliver a seamless, personalized experience across our platform.`,
    },
    {
        icon: Settings,
        title: 'Essential Cookies',
        content: `These cookies are strictly necessary for the platform to function. Without them, core features like authentication, session management, and security cannot operate.

Examples include:
• Session tokens that keep you logged in as you navigate the platform
• CSRF protection tokens that guard against cross-site request forgery
• Load balancing cookies that ensure stable server connections
• Preference cookies that remember your chosen theme (light/dark)

You cannot opt out of essential cookies while using ElevateX, as they are fundamental to the service.`,
    },
    {
        icon: BarChart2,
        title: 'Analytics Cookies',
        content: `We use analytics cookies to understand how visitors interact with ElevateX — which pages are visited most, how long users spend on each section, and where users drop off. This data helps us improve the platform continuously.

We use the following analytics tools:
• Vercel Analytics — for page view and visitor tracking
• Vercel Speed Insights — for performance monitoring

All analytics data is aggregated and anonymized. We do not use analytics cookies to build personal profiles or track you across third-party websites.`,
    },
    {
        icon: Share2,
        title: 'Third-Party Cookies',
        content: `Some features on ElevateX rely on third-party services that may set their own cookies:

• Razorpay — Our payment processor sets cookies to facilitate secure transactions and fraud prevention. These cookies are governed by Razorpay's own privacy policy.
• Google Fonts — Fonts are loaded from Google's CDN. Google may set cookies as part of this delivery.
• Socket.io — Real-time communication for notifications and live features may use session identifiers stored in memory.

We do not sell your data to third parties, and we carefully vet any third-party service we integrate.`,
    },
    {
        icon: ToggleRight,
        title: 'Managing Your Cookie Preferences',
        content: `You have control over non-essential cookies. Here's how you can manage them:

Browser Settings: All modern browsers allow you to view, block, or delete cookies. Refer to your browser's help documentation:
• Chrome: Settings → Privacy and Security → Cookies
• Firefox: Settings → Privacy & Security → Cookies and Site Data
• Safari: Preferences → Privacy → Manage Website Data
• Edge: Settings → Cookies and Site Permissions

Please note that disabling certain cookies may affect the functionality of ElevateX. For example, disabling session cookies will prevent you from staying logged in.`,
    },
    {
        icon: Shield,
        title: 'Cookie Retention',
        content: `Different cookies have different lifespans:

• Session cookies — Deleted automatically when you close your browser
• Authentication tokens — Retained for up to 30 days (or until you log out)
• Analytics cookies — Retained for up to 12 months
• Preference cookies — Retained for up to 12 months

We regularly review our cookie usage and remove any cookies that are no longer necessary for the platform's operation.`,
    },
    {
        icon: Mail,
        title: 'Contact Us',
        content: `If you have any questions about our use of cookies or this Cookie Policy, please reach out to us:

Email: privacy@elevatex.app
Address: ElevateX Platform, India

We aim to respond to all privacy-related inquiries within 5 business days. This Cookie Policy may be updated periodically to reflect changes in our practices or applicable law. We will notify you of significant changes via email or a prominent notice on the platform.`,
    },
];

const CookiePolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen pt-24 pb-20 px-6" style={{ background: '#050505' }}>
            <SEO
                title="Cookie Policy — ElevateX"
                description="Learn how ElevateX uses cookies and similar technologies to deliver a seamless, secure experience."
            />

            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-2 text-sm font-medium transition-colors group"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <Cookie className="w-5 h-5" style={{ color: '#ef4444' }} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.6)' }}>Legal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Cookie Policy</h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Last updated: {LAST_UPDATED}</p>
                    <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            This Cookie Policy explains how ElevateX ("we", "us", or "our") uses cookies and similar technologies when you visit or use our platform. By continuing to use ElevateX, you consent to our use of cookies as described in this policy.
                        </p>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="w-full h-px mb-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, i) => {
                        const Icon = section.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="rounded-2xl p-6"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                        <Icon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    </div>
                                    <h2 className="text-base font-bold text-white">{section.title}</h2>
                                </div>
                                <div className="space-y-3 pl-11">
                                    {section.content.split('\n\n').map((para, j) => (
                                        <p key={j} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                            {para}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 pt-8 text-center"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        © {new Date().getFullYear()} ElevateX. All rights reserved. · <span
                            className="cursor-pointer hover:text-white transition-colors"
                            onClick={() => navigate('/privacy')}
                            style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy Policy</span> · <span
                                className="cursor-pointer hover:text-white transition-colors"
                                onClick={() => navigate('/terms')}
                                style={{ color: 'rgba(255,255,255,0.6)' }}>Terms of Service</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default CookiePolicy;
