import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pb-2 leading-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Last updated: November 28, 2025
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-8 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">1. Information We Collect</h2>
                            <p className="mb-4">
                                At ElevateX, we collect information that you provide directly to us when you create an account,
                                complete tasks, or communicate with other users. This includes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Name, email address, and profile information</li>
                                <li>Skills, experience, and portfolio details</li>
                                <li>Task creation and completion data</li>
                                <li>Payment and transaction information</li>
                                <li>Communication and chat data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">2. How We Use Your Information</h2>
                            <p className="mb-4">We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process transactions and send related information</li>
                                <li>Send you technical notices, updates, and support messages</li>
                                <li>Respond to your comments and questions</li>
                                <li>Monitor and analyze trends, usage, and activities</li>
                                <li>Detect, prevent, and address technical issues and fraud</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">3. Information Sharing</h2>
                            <p className="mb-4">
                                We do not sell your personal information. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>With your consent or at your direction</li>
                                <li>With service providers who perform services on our behalf</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect the rights and safety of ElevateX, our users, and the public</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal data
                                against unauthorized or unlawful processing, accidental loss, destruction, or damage. However,
                                no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">5. Your Rights</h2>
                            <p className="mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access and receive a copy of your personal data</li>
                                <li>Rectify inaccurate personal data</li>
                                <li>Request deletion of your personal data</li>
                                <li>Object to or restrict processing of your data</li>
                                <li>Data portability</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">6. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:privacy@elevatex.com" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                    privacy@elevatex.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
