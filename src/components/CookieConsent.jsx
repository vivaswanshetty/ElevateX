import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Cookie, ShieldCheck, ChevronRight } from 'lucide-react';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            // Show banner after a short delay for better UX
            setTimeout(() => setShowBanner(true), 1500);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-[60] max-w-md w-full mx-auto md:mx-0"
                >
                    <div className="relative overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6">
                        {/* Decorative background gradients */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                    <Cookie className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    Cookie & Privacy
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    We use cookies to ensure you get the best experience on our website.
                                    <Link to="/privacy" className="text-orange-600 dark:text-orange-400 hover:underline font-medium ml-1">
                                        Read Policy
                                    </Link>
                                </p>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={acceptCookies}
                                        className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        Accept All
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={declineCookies}
                                        className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-transparent hover:border-gray-300 dark:hover:border-white/20"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>

                            {/* Close button (top right) */}
                            <button
                                onClick={declineCookies}
                                className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
