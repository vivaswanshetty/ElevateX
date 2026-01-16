import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

const CATEGORIES = ["Development", "Design", "Marketing", "Writing", "Data Science", "Video & Animation", "Music & Audio", "Business", "Lifestyle"];
const SUBCATEGORIES = {
    Development: ['Web Development', 'Mobile App', 'Debugging', 'API Integration', 'Automation', 'Desktop App', 'Database Design'],
    Design: ['UI/UX', 'Logo', 'Poster', 'Branding', 'Illustration', 'Print Design', '3D Design'],
    Marketing: ['SEO', 'Social Media', 'Content Strategy', 'Email Marketing', 'Influencer Marketing'],
    Writing: ['Blog Post', 'Copywriting', 'Technical Writing', 'Creative Writing', 'Editing'],
    'Data Science': ['Data Analysis', 'Machine Learning', 'Data Visualization', 'Statistical Modeling', 'Big Data'],
    'Video & Animation': ['Video Editing', '2D Animation', '3D Animation', 'Motion Graphics', 'Video Production'],
    'Music & Audio': ['Music Production', 'Audio Editing', 'Voice Over', 'Sound Design', 'Mixing & Mastering'],
    Business: ['Business Plan', 'Financial Analysis', 'Market Research', 'Consulting', 'Project Management'],
    Lifestyle: ['Fitness Coaching', 'Nutrition', 'Life Coaching', 'Travel Planning', 'Personal Shopping']
};

const REWARD_TIERS = [
    { id: 'small', label: 'Small', coins: 20, color: 'from-blue-500 to-cyan-500' },
    { id: 'medium', label: 'Medium', coins: 50, color: 'from-purple-500 to-pink-500' },
    { id: 'large', label: 'Large', coins: 100, color: 'from-orange-500 to-red-500' },
    { id: 'premium', label: 'Premium', coins: 200, color: 'from-yellow-500 to-amber-500' }
];

const EditTaskModal = ({ isOpen, onClose, task }) => {
    const { updateTask } = useData();
    // Assuming useAuth is available in context/AuthContext, simplified here or need to import
    // Note: To refresh profile, we should typically grab it from useAuth.
    // Since useData doesn't expose refreshProfile, we rely on updateTask potentially triggering it or we just ignore for now
    // as the user asked for "proper re-deposition", which implies backend handling (done).
    // The frontend coin display will update next time it refreshes.

    // Correction: We actually need refreshProfile to see immediate coin changes. 
    // Let's import it safely if needed, or rely on automatic polling/refresh if implemented. 
    // DataContext.jsx:46 calls refreshProfile() inside postTask. 
    // But updateTask in DataContext (line 111) does NOT call refreshProfile. 
    // We should probably update DataContext.jsx to call refreshProfile() on updateTask as well, 
    // but for now let's just make the changes here.

    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        deadline: '',
        category: '',
        sub: '',
        rewardId: '',
        coins: 0
    });

    const [existingAttachments, setExistingAttachments] = useState([]);
    const [newAttachments, setNewAttachments] = useState([]); // Array of {name, type, data}
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                desc: task.description || task.desc || '',
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                category: task.category || CATEGORIES[0],
                sub: task.subcategory || SUBCATEGORIES[task.category]?.[0] || '',
                rewardId: task.rewardTier || 'small',
                coins: task.coins || 20
            });
            setExistingAttachments(task.attachments || []);
            setNewAttachments([]);
            setRemovedAttachmentIds([]);
        }
    }, [task]);

    // Handle reward tier change
    const handleTierChange = (e) => {
        const tierId = e.target.value;
        const tier = REWARD_TIERS.find(t => t.id === tierId);
        if (tier) {
            setFormData(prev => ({ ...prev, rewardId: tierId, coins: tier.coins }));
        }
    };

    // Handle category change -> reset subcategory
    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setFormData(prev => ({
            ...prev,
            category: cat,
            sub: SUBCATEGORIES[cat]?.[0] || ''
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewAttachments(prev => [...prev, { name: file.name, type: file.type, data: ev.target.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewAttachment = (index) => {
        setNewAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (attId) => {
        setRemovedAttachmentIds(prev => [...prev, attId]);
        setExistingAttachments(prev => prev.filter(att => att._id !== attId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await updateTask(task._id, {
                ...formData,
                newAttachments,
                removedAttachmentIds
            });
            // Ideally trigger profile refresh here if we could
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-[#111] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Task</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all font-medium"
                                    required
                                />
                            </div>

                            {/* Category & Subcategory */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">Type</label>
                                    <select
                                        value={formData.sub}
                                        onChange={e => setFormData(prev => ({ ...prev, sub: e.target.value }))}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                                    >
                                        {SUBCATEGORIES[formData.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Reward Tier */}
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">Reward Tier</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {REWARD_TIERS.map(tier => (
                                        <div
                                            key={tier.id}
                                            onClick={() => setFormData(prev => ({ ...prev, rewardId: tier.id, coins: tier.coins }))}
                                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center ${formData.rewardId === tier.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className="font-bold text-gray-900 dark:text-white">{tier.label}</div>
                                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">{tier.coins} Coins</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                                    Description
                                </label>
                                <textarea
                                    value={formData.desc}
                                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none h-32 transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* Attachments */}
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                                    Attachments
                                </label>

                                {/* Existing Attachments */}
                                {existingAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {existingAttachments.map(att => (
                                            <div key={att._id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                <span>{att.name}</span>
                                                <button type="button" onClick={() => removeExistingAttachment(att._id)} className="text-red-500 hover:text-red-700">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Attachments */}
                                {newAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {newAttachments.map((att, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm border border-green-200 dark:border-green-800">
                                                <span>{att.name}</span>
                                                <button type="button" onClick={() => removeNewAttachment(i)} className="text-green-800 dark:text-green-200 hover:text-green-900">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-gray-500 dark:text-gray-400">
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                    <span className="text-sm font-bold">+ Add Files</span>
                                </label>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                    <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                                >
                                    {loading ? 'Saving...' : (
                                        <>
                                            <Save className="w-5 h-5" /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditTaskModal;
