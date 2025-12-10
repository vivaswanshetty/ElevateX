import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', or null

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await api.post('/password-reset/request', { email });

            if (response.data.success) {
                setStatus('success');
                setEmail('');
            }
        } catch (error) {
            console.error('Password reset request error:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-black flex items-center justify-center px-6 py-20">
            <div className="max-w-md w-full">
                {/* Back to Login */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                {/* Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {status === 'success' && (
                        <div className="mb-6 flex items-start gap-3 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 rounded-lg">
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Check your email!</p>
                                <p className="text-sm">
                                    If an account exists with that email, we've sent password reset instructions.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 rounded-lg">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p>Something went wrong. Please try again later.</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Remember your password?{' '}
                            <Link to="/" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        Need help? <Link to="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
