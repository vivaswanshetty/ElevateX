import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'Getting Started',
            questions: [
                {
                    q: 'What is ElevateX?',
                    a: 'ElevateX is a collaborative task marketplace where users can post tasks they need help with and skilled individuals can apply to complete them for virtual coin rewards.'
                },
                {
                    q: 'How do I create an account?',
                    a: 'Click the "Sign Up" button in the navigation bar, fill in your details including name, email, and password, and you\'re ready to start! Make sure to complete your profile for better opportunities.'
                },
                {
                    q: 'Is ElevateX free to use?',
                    a: 'Yes! Creating an account and browsing tasks is completely free. You start with an initial coin balance to get started.'
                }
            ]
        },
        {
            category: 'Tasks & Coins',
            questions: [
                {
                    q: 'How do I earn coins?',
                    a: 'You earn coins by successfully completing tasks posted by other users. Once your work is approved by the task creator, coins are automatically transferred to your wallet.'
                },
                {
                    q: 'What can I do with coins?',
                    a: 'Coins can be used to post your own tasks, participate in Productivity Duels, unlock premium features, and climb the leaderboard rankings.'
                },
                {
                    q: 'How do I create a task?',
                    a: 'Navigate to the "Create Task" page, fill in the task details including title, description, category, skill requirements, deadline, and coin reward. Then submit for others to apply!'
                },
                {
                    q: 'Can I get a refund if I\'m not satisfied with completed work?',
                    a: 'When reviewing submitted work, you have the option to approve or reject it. If you reject, the coins remain in your wallet and the task can be reassigned.'
                }
            ]
        },
        {
            category: 'Profile & Skills',
            questions: [
                {
                    q: 'How do I update my profile?',
                    a: 'Go to your Profile page and click the "Edit Profile" button. You can update your skills, bio, work experience, education, and portfolio to showcase your expertise.'
                },
                {
                    q: 'Why should I add skills to my profile?',
                    a: 'Adding skills helps task creators find you for relevant tasks. It also improves your chances of being selected when you apply for tasks matching your expertise.'
                },
                {
                    q: 'Can I change my username?',
                    a: 'Currently, usernames cannot be changed once set to maintain consistency across the platform. Choose wisely when creating your account!'
                }
            ]
        },
        {
            category: 'Community & Features',
            questions: [
                {
                    q: 'What is the Leaderboard?',
                    a: 'The Leaderboard ranks users based on their total coins earned. Top performers are showcased on the podium, fostering healthy competition and recognition.'
                },
                {
                    q: 'What are Productivity Duels?',
                    a: 'Productivity Duels are competitive challenges where you race against another user to complete similar tasks. The winner receives bonus coins and bragging rights!'
                },
                {
                    q: 'How does the chat feature work?',
                    a: 'The chat feature allows you to communicate with other users about tasks, collaborations, or general networking. Access it from your dashboard.'
                },
                {
                    q: 'Can I follow other users?',
                    a: 'Yes! You can search for users and view their profiles to see their skills, completed tasks, and rankings. Following features are coming soon!'
                }
            ]
        },
        {
            category: 'Safety & Support',
            questions: [
                {
                    q: 'How does ElevateX ensure task quality?',
                    a: 'Task creators review and approve all submissions. We also have a rating system (coming soon) and community guidelines to maintain quality standards.'
                },
                {
                    q: 'What if I encounter inappropriate content?',
                    a: 'Please report any inappropriate content or behavior immediately using our reporting system. We take user safety seriously and will investigate all reports.'
                },
                {
                    q: 'How can I contact support?',
                    a: 'For any issues or questions, you can reach us at support@elevatex.com or visit our Contact page. We typically respond within 24 hours.'
                },
                {
                    q: 'Is my personal information safe?',
                    a: 'Absolutely. We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for more details.'
                }
            ]
        }
    ];

    const toggleFAQ = (categoryIndex, questionIndex) => {
        const index = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/10 dark:to-black py-20 px-6">
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
                <div className="mb-16 text-center">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight pb-2">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                        Everything you need to know about ElevateX
                    </p>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-8">
                    {faqs.map((section, categoryIndex) => (
                        <div key={categoryIndex}>
                            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.questions.map((faq, questionIndex) => {
                                    const index = `${categoryIndex}-${questionIndex}`;
                                    const isOpen = openIndex === index;

                                    return (
                                        <div
                                            key={questionIndex}
                                            className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                                                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                            >
                                                <span className="font-semibold text-black dark:text-white pr-4">
                                                    {faq.q}
                                                </span>
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                                    {isOpen ? (
                                                        <Minus className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div className="p-5 pt-0 text-gray-600 dark:text-gray-400">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions section */}
                <div className="mt-16 text-center bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-lg text-green-100 mb-6">
                        We're here to help! Reach out to our support team.
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="px-8 py-3 bg-white text-teal-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
