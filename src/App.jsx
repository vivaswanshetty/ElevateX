import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreTasks from './pages/ExploreTasks';
import CreateTask from './pages/CreateTask';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Wallet from './pages/Wallet';
import Chat from './pages/Chat';
import UserSearch from './pages/UserSearch';
import ProductivityDuel from './pages/ProductivityDuel';
import Feed from './pages/Feed';
import Activity from './pages/Activity';
import SinglePost from './pages/SinglePost';

import SecurePayments from './pages/SecurePayments';
import AIMatching from './pages/AIMatching';
import CommunityEvents from './pages/CommunityEvents';
import MobileApp from './pages/MobileApp';

// Info pages
import Privacy from './pages/Privacy';
import About from './pages/About';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TechStack from './pages/TechStack';

import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';

function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <Router>
                    <ScrollToTop />
                    <CookieConsent />
                    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden flex flex-col transition-colors duration-300">
                        <Navbar />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/explore" element={<ExploreTasks />} />
                                <Route path="/create" element={<CreateTask />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/leaderboard" element={<Leaderboard />} />
                                <Route path="/wallet" element={<Wallet />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/search" element={<UserSearch />} />
                                <Route path="/feed" element={<Feed />} />
                                <Route path="/post/:id" element={<SinglePost />} />
                                <Route path="/activity" element={<Activity />} />
                                <Route path="/duel" element={<ProductivityDuel />} />
                                <Route path="/tech-stack/:category?" element={<TechStack />} />
                                <Route path="/future/payments" element={<SecurePayments />} />
                                <Route path="/future/ai-matching" element={<AIMatching />} />
                                <Route path="/future/community" element={<CommunityEvents />} />
                                <Route path="/future/mobile-app" element={<MobileApp />} />

                                {/* Info pages */}
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/blog" element={<Blog />} />
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/contact" element={<Contact />} />

                                {/* Password Reset */}
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </DataProvider>
        </AuthProvider >
    );
}

export default App;
