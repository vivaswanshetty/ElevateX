import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, User, MessageSquare, Briefcase, GraduationCap, Globe, Twitter, Linkedin, Github, Link as LinkIcon } from 'lucide-react';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/25`;
const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' };
const inputFocusStyle = { borderColor: 'rgba(239,68,68,0.45)', boxShadow: '0 0 0 3px rgba(239,68,68,0.07)' };

const DarkInput = ({ as: Tag = 'input', ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <Tag
            {...props}
            onFocus={e => { setFocused(true); props.onFocus?.(e); }}
            onBlur={e => { setFocused(false); props.onBlur?.(e); }}
            className={`${inputCls} ${props.className || ''}`}
            style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...props.style }}
        />
    );
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label, accent = 'rgba(255,255,255,0.30)' }) => (
    <div className="flex items-center gap-2 mb-5">
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{label}</span>
    </div>
);

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', bio: '',
        socials: { twitter: '', linkedin: '', github: '', website: '' },
        work: [], education: []
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

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));
    const handleSocialChange = (platform, value) => setFormData(p => ({ ...p, socials: { ...p.socials, [platform]: value } }));

    const addWork = () => setFormData(p => ({ ...p, work: [...p.work, { id: Date.now(), role: '', company: '', duration: '', desc: '' }] }));
    const updateWork = (id, field, value) => setFormData(p => ({ ...p, work: p.work.map(i => i.id === id ? { ...i, [field]: value } : i) }));
    const removeWork = (id) => setFormData(p => ({ ...p, work: p.work.filter(i => i.id !== id) }));

    const addEducation = () => setFormData(p => ({ ...p, education: [...p.education, { id: Date.now(), degree: '', school: '', year: '' }] }));
    const updateEducation = (id, field, value) => setFormData(p => ({ ...p, education: p.education.map(i => i.id === id ? { ...i, [field]: value } : i) }));
    const removeEducation = (id) => setFormData(p => ({ ...p, education: p.education.filter(i => i.id !== id) }));

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

    const socialIcons = { twitter: Twitter, linkedin: Linkedin, github: Github, website: Globe };
    const socialPlaceholders = {
        twitter: 'https://twitter.com/yourhandle',
        linkedin: 'https://linkedin.com/in/yourprofile',
        github: 'https://github.com/yourusername',
        website: 'https://yourwebsite.com',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[150]"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    />
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="max-w-3xl w-full my-8 rounded-2xl overflow-hidden"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-7 py-5 sticky top-0 z-10"
                                style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                    <h2 className="text-lg font-black text-white">Edit Profile</h2>
                                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Changes are visible to others immediately</p>
                                </div>
                                <button onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                                    style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-7 space-y-8 max-h-[calc(100vh-220px)] overflow-y-auto">

                                {/* ── Basic Info ── */}
                                <section>
                                    <SectionHeader icon={User} label="Basic Information" />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40">Display Name</label>
                                            <DarkInput
                                                type="text" value={formData.name}
                                                onChange={e => handleChange('name', e.target.value)}
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-white/40">Bio</label>
                                                <span className={`text-xs font-medium ${formData.bio.length > maxBioLength ? 'text-red-400' : ''}`}
                                                    style={formData.bio.length <= maxBioLength ? { color: 'rgba(255,255,255,0.25)' } : {}}>
                                                    {formData.bio.length}/{maxBioLength}
                                                </span>
                                            </div>
                                            <DarkInput
                                                as="textarea"
                                                value={formData.bio}
                                                onChange={e => handleChange('bio', e.target.value.slice(0, maxBioLength))}
                                                placeholder="Tell us about yourself..."
                                                rows={3}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ── Social Links ── */}
                                <section>
                                    <SectionHeader icon={LinkIcon} label="Social Links" />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {['twitter', 'linkedin', 'github', 'website'].map(platform => {
                                            const Icon = socialIcons[platform];
                                            return (
                                                <div key={platform} className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 capitalize flex items-center gap-1.5">
                                                        <Icon className="w-3.5 h-3.5" /> {platform}
                                                    </label>
                                                    <DarkInput
                                                        type="url" value={formData.socials[platform]}
                                                        onChange={e => handleSocialChange(platform, e.target.value)}
                                                        placeholder={socialPlaceholders[platform]}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* ── Work Experience ── */}
                                <section>
                                    <div className="flex items-center justify-between mb-5">
                                        <SectionHeader icon={Briefcase} label="Work Experience" />
                                        <button type="button" onClick={addWork}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {formData.work.length === 0 ? (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="text-center py-10 rounded-xl"
                                                    style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                                                    <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No work experience added yet</p>
                                                </motion.div>
                                            ) : formData.work.map((item, index) => (
                                                <motion.div key={item.id}
                                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                                                    className="p-4 rounded-xl space-y-3"
                                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>
                                                            Position {index + 1}
                                                        </span>
                                                        <button type="button" onClick={() => removeWork(item.id)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/10"
                                                            style={{ color: 'rgba(255,255,255,0.30)' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        <DarkInput placeholder="Role / Title" value={item.role} onChange={e => updateWork(item.id, 'role', e.target.value)} />
                                                        <DarkInput placeholder="Company" value={item.company} onChange={e => updateWork(item.id, 'company', e.target.value)} />
                                                    </div>
                                                    <DarkInput placeholder="Duration (e.g. Jan 2020 – Present)" value={item.duration} onChange={e => updateWork(item.id, 'duration', e.target.value)} />
                                                    <DarkInput as="textarea" placeholder="Description of your role..." value={item.desc} onChange={e => updateWork(item.id, 'desc', e.target.value)} rows={2} className="resize-none" />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </section>

                                {/* ── Education ── */}
                                <section>
                                    <div className="flex items-center justify-between mb-5">
                                        <SectionHeader icon={GraduationCap} label="Education" />
                                        <button type="button" onClick={addEducation}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {formData.education.length === 0 ? (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="text-center py-10 rounded-xl"
                                                    style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                                                    <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No education added yet</p>
                                                </motion.div>
                                            ) : formData.education.map((item, index) => (
                                                <motion.div key={item.id}
                                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                                                    className="p-4 rounded-xl space-y-3"
                                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>
                                                            Education {index + 1}
                                                        </span>
                                                        <button type="button" onClick={() => removeEducation(item.id)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/10"
                                                            style={{ color: 'rgba(255,255,255,0.30)' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="grid md:grid-cols-3 gap-3">
                                                        <DarkInput placeholder="Degree" value={item.degree} onChange={e => updateEducation(item.id, 'degree', e.target.value)} />
                                                        <DarkInput placeholder="School / University" value={item.school} onChange={e => updateEducation(item.id, 'school', e.target.value)} />
                                                        <DarkInput placeholder="Year (e.g. 2020)" value={item.year} onChange={e => updateEducation(item.id, 'year', e.target.value)} />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </section>
                            </form>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-7 py-5"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
                                <button type="button" onClick={onClose}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/5"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}>
                                    Cancel
                                </button>
                                <button type="submit" onClick={handleSubmit}
                                    className="px-5 py-2.5 rounded-xl text-sm font-black text-white flex items-center gap-2 transition-all hover:scale-[1.02]"
                                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.20)' }}>
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
