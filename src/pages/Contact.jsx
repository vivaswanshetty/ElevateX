import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, MapPin, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);

        try {
            const response = await api.post('/contact', formData);

            if (response.data.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });

                // Clear success message after 5 seconds
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setSubmitStatus('error');

            // Clear error message after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            content: 'support@elevatex.com',
            link: 'mailto:support@elevatex.com'
        },
        {
            icon: Phone,
            title: 'Phone',
            content: '+91-8073352003',
            link: 'tel:+918073352003'
        },
        {
            icon: MapPin,
            title: 'Office',
            content: '882 Valley View Road, New York, NY 10029',
            link: null
        },
        {
            icon: MessageSquare,
            title: 'Live Chat',
            content: 'Available Mon-Fri, 9AM-6PM IST',
            link: null
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-black pt-24 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight pb-2">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                        Have a question or feedback? We'd love to hear from you!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 rounded-lg">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>Thank you! Your message has been sent successfully. We'll get back to you soon!</p>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 rounded-lg">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>Oops! Something went wrong. Please try again later.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Contact Information</h2>
                            <div className="space-y-6">
                                {contactInfo.map((info, index) => {
                                    const Icon = info.icon;
                                    return (
                                        <div key={index} className="flex items-start gap-4 group">
                                            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg group-hover:scale-110 transition-transform">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-black dark:text-white mb-1">
                                                    {info.title}
                                                </h3>
                                                {info.link ? (
                                                    <a
                                                        href={info.link}
                                                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                    >
                                                        {info.content}
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {info.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl shadow-xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/faq')}
                                    className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
                                >
                                    → Visit our FAQ page
                                </button>
                                <button
                                    onClick={() => navigate('/about')}
                                    className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
                                >
                                    → Learn more about us
                                </button>
                                <button
                                    onClick={() => navigate('/terms')}
                                    className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
                                >
                                    → View Terms of Service
                                </button>
                            </div>
                        </div>

                        {/* Response Time */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Average Response Time
                            </p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                &lt; 24 Hours
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
