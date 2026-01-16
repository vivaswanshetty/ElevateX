import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Upload, X, AlertCircle, Sparkles, Calendar as CalendarIcon, FileText, Tag, Code, Zap, Coffee, Music, Sun, Cloud, Flag, Bookmark, Compass, Rocket, Smile, Cpu, Globe, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthModal from '../components/AuthModal';

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

const CreateTask = () => {
    const { currentUser } = useAuth();
    const { postTask } = useData();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Development',
        sub: 'Web Development',
        rewardId: 'small',
        desc: '',
        deadline: ''
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Please login to post a task</h2>
                <button onClick={() => setShowAuth(true)} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold transition-transform hover:scale-105">
                    Login
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </div>
        );
    }

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200; // Reasonable max width for quality
                    const scaleSize = MAX_WIDTH / img.width;

                    if (img.width > MAX_WIDTH) {
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Compress to 0.7 quality jpeg to significantly reduce size
                    // This typically brings a 5MB png down to <500KB jpeg
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve({
                        name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                        type: 'image/jpeg',
                        data: dataUrl
                    });
                };
            };
        });
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length + files.length > 5) {
            setError("You can only upload a maximum of 5 files.");
            return;
        }

        const processedFiles = [];
        const MAX_SIZE_MB = 2; // 2MB limit for non-images

        for (const file of selectedFiles) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressed = await compressImage(file);
                    processedFiles.push(compressed);
                } catch (err) {
                    console.error("Error compressing image:", err);
                    setError("Failed to process image: " + file.name);
                }
            } else {
                // Check size for non-images
                if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                    setError(`File ${file.name} is too large. Max size is ${MAX_SIZE_MB}MB.`);
                    continue;
                }

                // Read as before
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setFiles(prev => [...prev, { name: file.name, type: file.type, data: ev.target.result }]);
                };
                reader.readAsDataURL(file);
            }
        }

        // Add processed images immediately
        if (processedFiles.length > 0) {
            setFiles(prev => [...prev, ...processedFiles]);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.desc || !formData.deadline) {
            setError('Please fill in all required fields');
            return;
        }

        const tier = REWARD_TIERS.find(t => t.id === formData.rewardId);
        setIsSubmitting(true);

        try {
            await postTask({
                ...formData,
                coins: tier.coins,
                files
            });
            navigate('/explore');
        } catch (err) {
            setError(err.message || "Failed to post task");
            setIsSubmitting(false);
        }
    };

    const selectedTier = REWARD_TIERS.find(t => t.id === formData.rewardId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-20">
            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-red-700 via-rose-600 to-orange-600 pt-32 pb-24 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                    className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
                />

                {/* Doodle Pattern Overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { Icon: Code, top: '10%', left: '10%' },
                        { Icon: Sparkles, top: '20%', left: '80%' },
                        { Icon: Zap, top: '60%', left: '15%' },
                        { Icon: Coffee, top: '80%', left: '70%' },
                        { Icon: Music, top: '15%', left: '40%' },
                        { Icon: Sun, top: '75%', left: '30%' },
                        { Icon: Cloud, top: '30%', left: '60%' },
                        { Icon: Flag, top: '50%', left: '90%' },
                        { Icon: Bookmark, top: '40%', left: '5%' },
                        { Icon: Compass, top: '85%', left: '50%' },
                        { Icon: Rocket, top: '5%', left: '90%' },
                        { Icon: Smile, top: '90%', left: '10%' },
                        { Icon: Cpu, top: '45%', left: '75%' },
                        { Icon: Globe, top: '25%', left: '25%' },
                        { Icon: Layers, top: '55%', left: '40%' },
                    ].map(({ Icon, top, left }, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/40"
                            style={{ top, left }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.4, 0.8, 0.4],
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        >
                            <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
                        </motion.div>
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 shadow-lg mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-bold">Create New Task</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-6"
                    >
                        Post Your Task
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/95 drop-shadow-md text-lg font-medium max-w-2xl mx-auto"
                    >
                        Lock coins in escrow and get quality work delivered
                    </motion.p>
                </div>
            </motion.div>

            <div className="container mx-auto px-6 -mt-12 relative z-10 max-w-4xl">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl"
                >
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400"
                        >
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Task Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Task Title <span className="text-red-500">*</span>
                                </label>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {formData.title.trim().split(/\s+/).filter(Boolean).length}/15 words
                                </span>
                            </div>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    const val = e.target.value;
                                    const words = val.trim().split(/\s+/).filter(Boolean);
                                    if (words.length <= 15) {
                                        setFormData({ ...formData, title: val });
                                    }
                                }}
                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-lg font-medium"
                                placeholder="e.g., Design a modern landing page"
                            />
                        </motion.div>

                        {/* Category Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value, sub: SUBCATEGORIES[e.target.value][0] })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all font-medium"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                                    Subcategory <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.sub}
                                    onChange={e => setFormData({ ...formData, sub: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all font-medium"
                                >
                                    {SUBCATEGORIES[formData.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </motion.div>

                        {/* Reward Tiers */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Reward Tier <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {REWARD_TIERS.map(tier => (
                                    <motion.button
                                        key={tier.id}
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData({ ...formData, rewardId: tier.id })}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.rewardId === tier.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                            : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`text-xs font-bold mb-1 ${formData.rewardId === tier.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {tier.label}
                                        </div>
                                        <div className={`text-2xl font-black ${formData.rewardId === tier.id ? 'bg-gradient-to-r ' + tier.color + ' bg-clip-text text-transparent' : 'text-gray-900 dark:text-white'}`}>
                                            {tier.coins}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">coins</div>
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">💡 Funds are locked in escrow until task completion</p>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.desc}
                                onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none h-40 transition-all resize-none"
                                placeholder="Describe the task requirements, deliverables, and acceptance criteria in detail..."
                            />
                        </motion.div>

                        {/* Deadline & Attachments */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                    <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Deadline <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none cursor-pointer transition-all [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">Attachments</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-xl p-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all group">
                                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Upload Files</span>
                                </label>
                            </div>
                        </motion.div>

                        {/* File preview section remains the same, assuming it was correct in previous context */}
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 flex-wrap p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                            >
                                {files.map((f, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative group"
                                    >
                                        {f.type.startsWith('image/') ? (
                                            <img src={f.data} alt={f.name} className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200 dark:border-white/10" />
                                        ) : (
                                            <div className="h-20 w-20 flex items-center justify-center bg-white dark:bg-white/5 rounded-xl border-2 border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 p-2 text-center overflow-hidden font-medium">{f.name}</div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="pt-4"
                        >
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                className={`w-full py-5 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-6 h-6" />
                                        Publish Task
                                    </>
                                )}
                            </motion.button>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">Coins will be deducted immediately and held in escrow</p>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateTask;
