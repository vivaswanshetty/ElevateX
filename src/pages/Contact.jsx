import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, MapPin, Phone, MessageSquare, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);
        try {
            const response = await api.post('/contact', formData);
            if (response.data.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } catch (error) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { icon: Mail, title: 'Email', content: 'vivaswanprofessional@gmail.com', link: 'mailto:vivaswanprofessional@gmail.com', color: '#ef4444' },
        { icon: Phone, title: 'Phone', content: '+91-8073352003', link: 'tel:+918073352003', color: '#6366f1' },
        { icon: MapPin, title: 'Office', content: '882 Valley View Road, New York, NY 10029', link: null, color: '#f97316' },
        { icon: MessageSquare, title: 'Live Chat', content: 'Available Mon-Fri, 9AM-6PM IST', link: null, color: '#10b981' },
    ];

    const inputStyle = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        outline: 'none',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        transition: 'border-color 0.2s',
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6" style={{ background: '#050505' }}>
            <div className="max-w-6xl mx-auto">
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
                        <Zap className="w-3 h-3" fill="currentColor" /> Get In Touch
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-4">Contact <span style={{ color: '#ef4444' }}>Us</span></h1>
                    <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>Have a question or feedback? We'd love to hear from you!</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-2xl p-8"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <h2 className="text-xl font-bold mb-6 text-white">Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {[
                                { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name' },
                                { label: 'Email', name: 'email', type: 'email', placeholder: 'your.email@example.com' },
                                { label: 'Subject', name: 'subject', type: 'text', placeholder: 'How can we help?' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                        {field.label} <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required
                                        placeholder={field.placeholder}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Message <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Tell us more about your inquiry..."
                                    style={{ ...inputStyle, resize: 'none' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                            </div>

                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    Message sent! We'll get back to you soon.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                    Something went wrong. Please try again.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                                onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : <Send className="w-4 h-4" />}
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                        className="space-y-5"
                    >
                        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-xl font-bold mb-6 text-white">Contact Information</h2>
                            <div className="space-y-5">
                                {contactInfo.map((info, i) => {
                                    const Icon = info.icon;
                                    return (
                                        <div key={i} className="flex items-start gap-4 group">
                                            <div className="p-3 rounded-xl flex-shrink-0 transition-all group-hover:scale-110" style={{ background: `${info.color}15` }}>
                                                <Icon className="w-4 h-4" style={{ color: info.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white mb-0.5">{info.title}</h3>
                                                {info.link ? (
                                                    <a href={info.link} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.65)' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = info.color}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                                                    >{info.content}</a>
                                                ) : (
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{info.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                            <h3 className="text-base font-bold mb-4 text-white">Quick Links</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Visit our FAQ page', path: '/faq' },
                                    { label: 'Learn more about us', path: '/about' },
                                    { label: 'View Terms of Service', path: '/terms' },
                                ].map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(link.path)}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                    >
                                        → {link.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Response time */}
                        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Average Response Time</p>
                            <p className="text-4xl font-black" style={{ color: '#ef4444' }}>&lt; 24 Hours</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
