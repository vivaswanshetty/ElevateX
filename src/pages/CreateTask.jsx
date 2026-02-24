import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    Upload, X, AlertCircle, Calendar as CalendarIcon, FileText,
    Coins, CheckCircle, ArrowRight, Lock, Info, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../components/AuthModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
    "Development", "Design", "Marketing", "Writing",
    "Data Science", "Video & Animation", "Music & Audio", "Business", "Lifestyle"
];

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
    { id: 'small', label: 'Starter', coins: 20, xp: 12, desc: 'Quick tasks' },
    { id: 'medium', label: 'Standard', coins: 50, xp: 15, desc: 'Regular work' },
    { id: 'large', label: 'Advanced', coins: 100, xp: 20, desc: 'Complex tasks' },
    { id: 'premium', label: 'Premium', coins: 200, xp: 30, desc: 'Expert level' },
];

const STEPS = ['Basics', 'Reward', 'Details', 'Review'];

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls = `w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3.5
    text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05]
    outline-none transition-all text-sm font-light`;

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, hint, required, children }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold tracking-widest uppercase text-white/30">
                {label}{required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {hint && <span className="text-[10px] text-white/20">{hint}</span>}
        </div>
        {children}
    </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
    <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
            <React.Fragment key={i}>
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                        style={{
                            background: i < step
                                ? 'rgba(239,68,68,0.15)'
                                : i === step
                                    ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                                    : 'rgba(255,255,255,0.04)',
                            color: i < step ? '#ef4444' : i === step ? '#fff' : 'rgba(255,255,255,0.50)',
                            border: i < step ? '1px solid rgba(239,68,68,0.3)' : i === step ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        {i < step ? '✓' : i + 1}
                    </div>
                    <span
                        className="text-[10px] font-semibold tracking-wider uppercase hidden sm:block"
                        style={{ color: i === step ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.40)' }}
                    >
                        {label}
                    </span>
                </div>
                {i < STEPS.length - 1 && (
                    <div
                        className="h-px flex-1 max-w-[24px] transition-all"
                        style={{ background: i < step ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)' }}
                    />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const CreateTask = () => {
    const { currentUser } = useAuth();
    const { postTask } = useData();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        title: '', category: 'Development', sub: 'Web Development',
        rewardId: 'small', desc: '', deadline: ''
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Guest gate ──
    if (!currentUser) {
        return (
            <div className="pt-32 min-h-screen flex items-center justify-center px-6" style={{ background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <Lock className="w-7 h-7 text-white/30" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Sign in required</h2>
                    <p className="text-sm text-white/25 mb-8 font-light">You need to be logged in to post a task.</p>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 0 0 1px rgba(239,68,68,0.3)' }}
                    >
                        Sign In
                    </button>
                </motion.div>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </div>
        );
    }

    // ── Image compression ──
    const compressImage = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1200;
                const scale = MAX / img.width;
                canvas.width = img.width > MAX ? MAX : img.width;
                canvas.height = img.width > MAX ? img.height * scale : img.height;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve({ name: file.name.replace(/\.[^/.]+$/, '') + '.jpg', type: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.7) });
            };
        };
    });

    const handleFileChange = async (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length + files.length > 5) { setError('Max 5 files allowed'); return; }
        const processed = [];
        for (const file of selected) {
            if (file.type.startsWith('image/')) {
                try { processed.push(await compressImage(file)); }
                catch { setError('Failed to process: ' + file.name); }
            } else {
                if (file.size > 2 * 1024 * 1024) { setError(`${file.name} exceeds 2MB limit`); continue; }
                await new Promise(res => {
                    const reader = new FileReader();
                    reader.onload = ev => { processed.push({ name: file.name, type: file.type, data: ev.target.result }); res(); };
                    reader.readAsDataURL(file);
                });
            }
        }
        if (processed.length) setFiles(prev => [...prev, ...processed]);
    };

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
            await postTask({ ...formData, coins: tier.coins, files });
            navigate('/explore');
        } catch (err) {
            setError(err.message || 'Failed to post task');
            setIsSubmitting(false);
        }
    };

    const selectedTier = REWARD_TIERS.find(t => t.id === formData.rewardId);
    const wordCount = formData.title.trim().split(/\s+/).filter(Boolean).length;
    const today = new Date().toISOString().split('T')[0];
    const canProceed = () => {
        if (step === 0) return formData.title.trim().length > 0;
        if (step === 2) return formData.desc.trim().length > 0 && formData.deadline;
        return true;
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
    };

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Page Header ── */}
            <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                {/* Subtle glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 100%)' }}
                />
                {/* Top rule */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
                />

                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        New Task
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                        Post a Task
                    </h1>
                    <p className="text-sm font-light mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Lock coins in escrow and get quality work from skilled freelancers.
                    </p>
                    <StepIndicator step={step} />
                </div>
            </div>

            {/* ── Form Card ── */}
            <div className="container mx-auto px-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={cardStyle}
                >
                    {/* Error banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 px-6 py-3.5 text-sm"
                                style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.8)', borderRadius: '20px 20px 0 0' }}
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">

                            {/* ══ STEP 0: Basics ══ */}
                            {step === 0 && (
                                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                                    <div className="mb-2">
                                        <h2 className="text-lg font-black text-white tracking-tight">Task Basics</h2>
                                        <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Give your task a clear title and category</p>
                                    </div>

                                    <Field label="Task Title" required hint={`${wordCount}/15 words`}>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val.trim().split(/\s+/).filter(Boolean).length <= 15)
                                                    setFormData({ ...formData, title: val });
                                            }}
                                            className={inputCls}
                                            placeholder="e.g., Design a modern landing page for my SaaS"
                                        />
                                    </Field>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Field label="Category" required>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value, sub: SUBCATEGORIES[e.target.value][0] })}
                                                className={inputCls}
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Subcategory" required>
                                            <select
                                                value={formData.sub}
                                                onChange={e => setFormData({ ...formData, sub: e.target.value })}
                                                className={inputCls}
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
                                            >
                                                {SUBCATEGORIES[formData.category]?.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                                            </select>
                                        </Field>
                                    </div>
                                </motion.div>
                            )}

                            {/* ══ STEP 1: Reward ══ */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                                    <div className="mb-2">
                                        <h2 className="text-lg font-black text-white tracking-tight">Set Reward</h2>
                                        <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Choose how much to pay for this task</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {REWARD_TIERS.map(tier => {
                                            const isSelected = formData.rewardId === tier.id;
                                            return (
                                                <motion.button
                                                    key={tier.id}
                                                    type="button"
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                    onClick={() => setFormData({ ...formData, rewardId: tier.id })}
                                                    className="relative p-5 rounded-xl text-left transition-all"
                                                    style={{
                                                        background: isSelected ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)',
                                                        border: isSelected ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: isSelected ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.50)' }}>
                                                        {tier.label}
                                                    </div>
                                                    <div className="text-3xl font-black text-white mb-0.5">{tier.coins}</div>
                                                    <div className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.50)' }}>coins</div>
                                                    <div className="text-[10px] font-semibold" style={{ color: isSelected ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.40)' }}>
                                                        +{tier.xp} XP · {tier.desc}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Escrow notice */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }} />
                                        <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            <span className="text-white/50 font-semibold">{selectedTier?.coins} coins</span> will be locked from your balance when you post this task. Released to the freelancer only after you mark it complete.
                                        </p>
                                    </div>

                                    {/* Balance */}
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            <Coins className="w-3.5 h-3.5" /> Your balance
                                        </div>
                                        <div className={`font-black text-base ${(currentUser?.coins || 0) >= (selectedTier?.coins || 0) ? 'text-white' : 'text-red-400'}`}>
                                            {currentUser?.coins || 0} coins
                                        </div>
                                    </div>
                                    {(currentUser?.coins || 0) < (selectedTier?.coins || 0) && (
                                        <p className="text-xs text-red-400/70 font-light -mt-3">Insufficient balance for this tier</p>
                                    )}
                                </motion.div>
                            )}

                            {/* ══ STEP 2: Details ══ */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-6">
                                    <div className="mb-2">
                                        <h2 className="text-lg font-black text-white tracking-tight">Task Details</h2>
                                        <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Describe what you need and set a deadline</p>
                                    </div>

                                    <Field label="Description" required hint={`${formData.desc.length} chars`}>
                                        <textarea
                                            value={formData.desc}
                                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                            className={inputCls + ' h-44 resize-none leading-relaxed'}
                                            placeholder="Describe the task requirements, deliverables, and acceptance criteria in detail..."
                                        />
                                    </Field>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Field label="Deadline" required>
                                            <input
                                                type="date"
                                                value={formData.deadline}
                                                min={today}
                                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                onClick={e => e.target.showPicker?.()}
                                                className={inputCls + ' cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-20'}
                                            />
                                        </Field>

                                        <Field label="Attachments" hint="Max 5 files">
                                            <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex items-center justify-center gap-2 w-full cursor-pointer transition-all text-sm font-light"
                                                style={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px dashed rgba(255,255,255,0.08)',
                                                    borderRadius: '12px',
                                                    padding: '14px 16px',
                                                    color: 'rgba(255,255,255,0.50)',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
                                            >
                                                <Upload className="w-4 h-4" /> Upload Files
                                            </label>
                                        </Field>
                                    </div>

                                    <AnimatePresence>
                                        {files.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="flex gap-3 flex-wrap p-4 rounded-xl"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                {files.map((f, i) => (
                                                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                                                        {f.type.startsWith('image/') ? (
                                                            <img src={f.data} alt={f.name} className="h-16 w-16 object-cover rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                                                        ) : (
                                                            <div className="h-16 w-16 flex flex-col items-center justify-center rounded-lg text-[9px] p-2 text-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.60)' }}>
                                                                <FileText className="w-4 h-4 mb-1 opacity-50" />
                                                                <span className="line-clamp-2">{f.name}</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* ══ STEP 3: Review ══ */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 space-y-5">
                                    <div className="mb-2">
                                        <h2 className="text-lg font-black text-white tracking-tight">Review & Publish</h2>
                                        <p className="text-xs mt-1 font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Double-check everything before posting</p>
                                    </div>

                                    {/* Summary */}
                                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Task Title</p>
                                            <p className="font-black text-white text-base">{formData.title}</p>
                                        </div>
                                        <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="p-4" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.50)' }}>Category</p>
                                                <p className="font-semibold text-white text-sm">{formData.category}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{formData.sub}</p>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.50)' }}>Deadline</p>
                                                <p className="font-semibold text-white text-sm">
                                                    {formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.50)' }}>Description</p>
                                            <p className="text-sm font-light leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{formData.desc}</p>
                                        </div>
                                    </div>

                                    {/* Reward summary */}
                                    <div className="flex items-center justify-between p-5 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>{selectedTier?.label} Tier</p>
                                            <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                Freelancer earns <span className="text-red-400 font-bold">{selectedTier?.coins} coins</span> + <span className="text-indigo-400 font-bold">+{selectedTier?.xp} XP</span>
                                            </p>
                                        </div>
                                        <div className="text-4xl font-black text-white">{selectedTier?.coins}</div>
                                    </div>

                                    {files.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                            <FileText className="w-3.5 h-3.5" />
                                            {files.length} attachment{files.length > 1 ? 's' : ''} included
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting || (currentUser?.coins || 0) < (selectedTier?.coins || 0)}
                                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        className="w-full py-4 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg,#dc2626,#ef4444)',
                                            boxShadow: '0 0 0 1px rgba(239,68,68,0.3), 0 12px 40px rgba(239,68,68,0.15)',
                                            opacity: isSubmitting || (currentUser?.coins || 0) < (selectedTier?.coins || 0) ? 0.5 : 1,
                                            cursor: isSubmitting || (currentUser?.coins || 0) < (selectedTier?.coins || 0) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                                        ) : (
                                            <>Publish Task <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </motion.button>
                                    <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                        {selectedTier?.coins} coins will be deducted and held in escrow
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Navigation footer ── */}
                        {step < 3 && (
                            <div
                                className="flex items-center justify-between px-8 py-5"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setStep(s => Math.max(0, s - 1))}
                                    disabled={step === 0}
                                    className="text-sm font-medium transition-colors disabled:opacity-20"
                                    style={{ color: 'rgba(255,255,255,0.60)' }}
                                    onMouseEnter={e => { if (step > 0) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
                                >
                                    ← Back
                                </button>

                                {/* Progress dots */}
                                <div className="flex items-center gap-1.5">
                                    {STEPS.map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-full transition-all"
                                            style={{
                                                width: i === step ? '20px' : '6px',
                                                height: '4px',
                                                background: i === step
                                                    ? 'linear-gradient(90deg,#dc2626,#ef4444)'
                                                    : i < step
                                                        ? 'rgba(239,68,68,0.4)'
                                                        : 'rgba(255,255,255,0.08)',
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setError(''); if (canProceed()) setStep(s => s + 1); else setError('Please complete all required fields'); }}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
                                    style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 0 0 1px rgba(239,68,68,0.25)' }}
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateTask;
