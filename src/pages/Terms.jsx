import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black pt-24 pb-20 px-6">
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
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight pb-2">
                        Terms of Service
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Last updated: November 28, 2025
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-8 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using ElevateX, you agree to be bound by these Terms of Service and all
                                applicable laws and regulations. If you do not agree with any of these terms, you are
                                prohibited from using or accessing this platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">2. User Accounts</h2>
                            <p className="mb-4">
                                When you create an account with us, you must provide accurate, complete, and current
                                information. You are responsible for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                                <li>Ensuring your profile information is truthful and up-to-date</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">3. Task Creation and Completion</h2>
                            <p className="mb-4">
                                <strong>Task Creators:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                <li>Must provide clear, accurate task descriptions</li>
                                <li>Must set fair coin rewards for tasks</li>
                                <li>Must review and approve/reject task submissions in a timely manner</li>
                                <li>Cannot discriminate against applicants</li>
                            </ul>
                            <p className="mb-4">
                                <strong>Task Doers:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Must complete tasks as described</li>
                                <li>Must submit work before deadlines</li>
                                <li>Must provide quality work that meets requirements</li>
                                <li>Cannot plagiarize or submit fraudulent work</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">4. Coins and Virtual Currency</h2>
                            <p className="mb-4">
                                ElevateX uses a virtual coin system for rewards:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Coins have no real-world monetary value</li>
                                <li>Coins can be earned by completing tasks</li>
                                <li>Coins can be spent on creating tasks or platform features</li>
                                <li>Coins cannot be transferred to external payment systems</li>
                                <li>We reserve the right to adjust coin balances for fraud prevention</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">5. Prohibited Conduct</h2>
                            <p className="mb-4">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Violate any laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Upload malicious code or viruses</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Create multiple accounts to manipulate the system</li>
                                <li>Engage in fraudulent activities</li>
                                <li>Scrape or collect data without permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">6. Intellectual Property</h2>
                            <p>
                                The platform, including its original content, features, and functionality, is owned by
                                ElevateX and protected by international copyright, trademark, and other intellectual
                                property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">7. Dispute Resolution</h2>
                            <p>
                                In case of disputes between users regarding task completion or quality, ElevateX may
                                intervene to facilitate resolution but is not obligated to do so. Our decision in such
                                matters is final.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">8. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your account at any time for violations of
                                these terms, fraudulent activity, or any other reason we deem necessary to protect the
                                platform and its users.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">9. Limitation of Liability</h2>
                            <p>
                                ElevateX shall not be liable for any indirect, incidental, special, consequential, or
                                punitive damages resulting from your use of or inability to use the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">10. Changes to Terms</h2>
                            <p className="mb-4">
                                We reserve the right to modify these terms at any time. We will notify users of any
                                material changes via email or platform notification. Continued use of the platform
                                after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">11. Contact</h2>
                            <p>
                                For questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@elevatex.com" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    legal@elevatex.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
