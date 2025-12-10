import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, User, MessageSquare, Briefcase, GraduationCap, Globe, Twitter, Linkedin, Github, Link as LinkIcon, Sparkles } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        socials: { twitter: '', linkedin: '', github: '', website: '' },
        work: [],
        education: []
    });

    const maxBioLength = 160;

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                socials: {
                    twitter: user.socials?.twitter || '',
                    linkedin: user.socials?.linkedin || '',
                    github: user.socials?.github || '',
                    website: user.socials?.website || ''
                },
                work: user.work || [],
                education: user.education || []
            });
        }
    }, [user, isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [platform]: value }
        }));
    };

    // Work Experience Handlers
    const addWork = () => {
        setFormData(prev => ({
            ...prev,
            work: [...prev.work, { id: Date.now(), role: '', company: '', duration: '', desc: '' }]
        }));
    };

    const updateWork = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            work: prev.work.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const removeWork = (id) => {
        setFormData(prev => ({
            ...prev,
            work: prev.work.filter(item => item.id !== id)
        }));
    };

    // Education Handlers
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now(), degree: '', school: '', year: '' }]
        }));
    };

    const updateEducation = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const removeEducation = (id) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter(item => item.id !== id)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const socialIcons = {
        twitter: Twitter,
        linkedin: Linkedin,
        github: Github,
        website: Globe
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-gray-200 dark:border-white/10"
                        >
                            {/* Header with Gradient */}
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <Sparkles className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
                                            <p className="text-white/80 text-sm mt-1">Make your profile shine ✨</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {/* Basic Info */}
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</label>
                                                <span className={`text-xs font-medium ${formData.bio.length > maxBioLength ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {formData.bio.length}/{maxBioLength}
                                                </span>
                                            </div>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => handleChange('bio', e.target.value.slice(0, maxBioLength))}
                                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                                placeholder="Tell us about yourself..."
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                </motion.section>

                                {/* Social Links */}
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
                                            <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Links</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        {['twitter', 'linkedin', 'github', 'website'].map(platform => {
                                            const Icon = socialIcons[platform];
                                            return (
                                                <div key={platform} className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize flex items-center gap-2">
                                                        <Icon className="w-4 h-4" />
                                                        {platform}
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.socials[platform]}
                                                        onChange={(e) => handleSocialChange(platform, e.target.value)}
                                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                        placeholder={`https://${platform}.com/yourprofile`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.section>

                                {/* Work Experience */}
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addWork}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {formData.work.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10"
                                                >
                                                    <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400">No work experience added yet</p>
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add" to showcase your experience</p>
                                                </motion.div>
                                            ) : (
                                                formData.work.map((item, index) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/5 dark:to-white/[0.02] rounded-2xl border border-gray-200 dark:border-white/10 space-y-4 group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs">
                                                                    {index + 1}
                                                                </div>
                                                                Position {index + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeWork(item.id)}
                                                                className="text-red-500 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            <input
                                                                placeholder="Role / Title"
                                                                value={item.role}
                                                                onChange={(e) => updateWork(item.id, 'role', e.target.value)}
                                                                className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                            />
                                                            <input
                                                                placeholder="Company"
                                                                value={item.company}
                                                                onChange={(e) => updateWork(item.id, 'company', e.target.value)}
                                                                className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <input
                                                            placeholder="Duration (e.g. Jan 2020 - Present)"
                                                            value={item.duration}
                                                            onChange={(e) => updateWork(item.id, 'duration', e.target.value)}
                                                            className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                        />
                                                        <textarea
                                                            placeholder="Description of your role and achievements..."
                                                            value={item.desc}
                                                            onChange={(e) => updateWork(item.id, 'desc', e.target.value)}
                                                            className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                                            rows="2"
                                                        />
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.section>

                                {/* Education */}
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-5"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {formData.education.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10"
                                                >
                                                    <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400">No education added yet</p>
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add" to showcase your education</p>
                                                </motion.div>
                                            ) : (
                                                formData.education.map((item, index) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/5 dark:to-white/[0.02] rounded-2xl border border-gray-200 dark:border-white/10 space-y-4 group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center text-xs">
                                                                    {index + 1}
                                                                </div>
                                                                Education {index + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(item.id)}
                                                                className="text-red-500 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="grid md:grid-cols-3 gap-3">
                                                            <input
                                                                placeholder="Degree"
                                                                value={item.degree}
                                                                onChange={(e) => updateEducation(item.id, 'degree', e.target.value)}
                                                                className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                            />
                                                            <input
                                                                placeholder="School / University"
                                                                value={item.school}
                                                                onChange={(e) => updateEducation(item.id, 'school', e.target.value)}
                                                                className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                            />
                                                            <input
                                                                placeholder="Year (e.g. 2020)"
                                                                value={item.year}
                                                                onChange={(e) => updateEducation(item.id, 'year', e.target.value)}
                                                                className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.section>
                            </form>

                            {/* Footer Actions */}
                            <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Changes will be visible to others immediately
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
                                    >
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
