import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart2, TrendingUp, CheckSquare, Users, Coins, Zap,
    Clock, Target, Award, ArrowUp, ArrowDown, Minus,
    Briefcase, ChevronRight, RefreshCw, Lock
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Tiny inline bar chart (no external lib) ──────────────────────────────────
const InlineBar = ({ value, max, color = '#ef4444' }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
};

// ─── Tiny SVG line chart ──────────────────────────────────────────────────────
const MiniLineChart = ({ data, keyName, color = '#ef4444', height = 64 }) => {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d[keyName] || 0);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals);
    const range = max - min || 1;
    const w = 300;
    const h = height;
    const pad = 8;
    const xStep = (w - pad * 2) / (vals.length - 1);

    const points = vals.map((v, i) => {
        const x = pad + i * xStep;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
            {/* Area fill */}
            <defs>
                <linearGradient id={`grad-${keyName}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`${pad},${h} ${points} ${pad + (vals.length - 1) * xStep},${h}`}
                fill={`url(#grad-${keyName})`}
            />
            {/* Line */}
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            {/* Dots */}
            {vals.map((v, i) => {
                const x = pad + i * xStep;
                const y = h - pad - ((v - min) / range) * (h - pad * 2);
                return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
            })}
        </svg>
    );
};

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────
const DonutChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    const COLORS = ['#ef4444', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'];
    const r = 60;
    const cx = 80;
    const cy = 80;
    const circumference = 2 * Math.PI * r;

    let offset = 0;
    const slices = data.slice(0, 6).map((d, i) => {
        const pct = d.count / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const slice = { ...d, dash, gap, offset, color: COLORS[i % COLORS.length] };
        offset += dash;
        return slice;
    });

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 160 160" className="w-32 h-32 flex-shrink-0 -rotate-90">
                {slices.map((s, i) => (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="18"
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset}
                        strokeLinecap="round"
                    />
                ))}
                <circle cx={cx} cy={cy} r={r - 12} fill="#0d0d0d" />
            </svg>
            <div className="flex flex-col gap-1.5 min-w-0">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.70)' }}>{s.name}</span>
                        <span className="ml-auto text-xs font-black text-white flex-shrink-0">{s.count}</span>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>No data yet</p>
                )}
            </div>
        </div>
    );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent = '#ef4444', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-5 rounded-2xl flex flex-col gap-3"
        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
    >
        <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
            </div>
            {sub !== undefined && (
                <span className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.30)' }}>{sub}</span>
            )}
        </div>
        <div>
            <div className="text-2xl font-black text-white">{value ?? '—'}</div>
            <div className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
        </div>
    </motion.div>
);

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
    const map = {
        Open: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#4ade80' },
        'In Progress': { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa' },
        Completed: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#f87171' },
        Cancelled: { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)', color: '#9ca3af' },
    };
    const s = map[status] || map.Open;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {status}
        </span>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Analytics = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analytics/tasks');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchAnalytics();
        else { setLoading(false); setError('auth'); }
    }, [currentUser]);

    const maxMonthly = data
        ? Math.max(...data.monthlyTimeline.map(m => Math.max(m.posted, m.completed)), 1)
        : 1;

    // Guard: not logged in
    if (!currentUser && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center p-10 rounded-2xl max-w-sm"
                    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(239,68,68,0.6)' }} />
                    <h2 className="text-xl font-black text-white mb-2">Sign in to View Analytics</h2>
                    <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Your task performance dashboard requires authentication.</p>
                    <button onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-full text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                        Go Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: '#050505' }}>

            {/* ── Header ── */}
            <div className="relative pt-32 pb-14 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.12), transparent)' }} />

                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3"
                            style={{ color: 'rgba(239,68,68,0.70)' }}>Performance Overview</p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
                            Analytics
                        </h1>
                        <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Your task creator dashboard — track activity, completion, and earnings.
                        </p>
                    </div>
                    <button
                        onClick={() => { setRefreshing(true); fetchAnalytics(true); }}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                            style={{ color: 'rgba(239,68,68,0.7)' }} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-8">

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex justify-center py-32">
                        <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* ── Error ── */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-6 rounded-2xl text-center"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p className="text-sm font-bold text-red-400">{error}</p>
                    </motion.div>
                )}

                {data && !loading && (
                    <AnimatePresence>

                        {/* ── KPI Grid ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Briefcase} label="Tasks Posted" value={data.posted.total} delay={0} />
                            <StatCard icon={CheckSquare} label="Completed" value={data.posted.completed} accent="#4ade80" delay={0.05} />
                            <StatCard icon={Users} label="Total Applicants" value={data.applicants.total} accent="#60a5fa" delay={0.10} />
                            <StatCard icon={Target} label="Completion Rate" value={`${data.posted.completionRate}%`} accent="#a78bfa" delay={0.15} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Coins} label="Coins Posted (escrow)" value={data.coins.totalPosted?.toLocaleString()} accent="#fbbf24" delay={0.20} />
                            <StatCard icon={TrendingUp} label="Coins Earned" value={data.coins.coinsEarned?.toLocaleString()} accent="#34d399" delay={0.25} />
                            <StatCard icon={Zap} label="Lifetime XP" value={data.xp?.toLocaleString()} accent="#a78bfa" delay={0.30} />
                            <StatCard icon={Award} label="Tasks Fulfilled" value={data.fulfilled.total} accent="#f43f5e" delay={0.35} />
                        </div>

                        {/* ── Task Status Breakdown ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }}
                            className="p-6 rounded-2xl"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">Task Status</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Open', value: data.posted.open, color: '#4ade80' },
                                    { label: 'In Progress', value: data.posted.inProgress, color: '#60a5fa' },
                                    { label: 'Completed', value: data.posted.completed, color: '#ef4444' },
                                    { label: 'Cancelled', value: data.posted.cancelled, color: '#6b7280' },
                                ].map(item => (
                                    <div key={item.label} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.label}</span>
                                            <span className="text-xs font-black text-white">{item.value}</span>
                                        </div>
                                        <InlineBar value={item.value} max={data.posted.total} color={item.color} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── Monthly Timeline + Category Donut ── */}
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                                className="p-6 rounded-2xl"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Monthly Activity</h2>
                                    <div className="ml-auto flex items-center gap-3 text-[10px]">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Posted
                                        </span>
                                        <span className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Done
                                        </span>
                                    </div>
                                </div>

                                {/* Month bars */}
                                <div className="flex items-end gap-1.5" style={{ height: 80 }}>
                                    {data.monthlyTimeline.map((m, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex gap-0.5 items-end" style={{ height: 60 }}>
                                                {/* Posted bar */}
                                                <div className="flex-1 rounded-t"
                                                    style={{
                                                        height: `${maxMonthly > 0 ? (m.posted / maxMonthly) * 60 : 0}px`,
                                                        background: 'linear-gradient(180deg,#ef4444,#dc2626)',
                                                        minHeight: m.posted > 0 ? 4 : 0
                                                    }} />
                                                {/* Completed bar */}
                                                <div className="flex-1 rounded-t"
                                                    style={{
                                                        height: `${maxMonthly > 0 ? (m.completed / maxMonthly) * 60 : 0}px`,
                                                        background: '#4ade80',
                                                        opacity: 0.7,
                                                        minHeight: m.completed > 0 ? 4 : 0
                                                    }} />
                                            </div>
                                            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.30)' }}>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Category donut */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.50 }}
                                className="p-6 rounded-2xl"
                                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">Category Breakdown</h2>
                                {data.categoryBreakdown.length > 0 ? (
                                    <DonutChart data={data.categoryBreakdown} />
                                ) : (
                                    <div className="flex items-center justify-center h-24">
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No tasks posted yet.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* ── Coins Overview ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                            className="p-6 rounded-2xl"
                            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5">Coin Flow</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Income', value: data.coins.income, color: '#4ade80', dir: 'up' },
                                    { label: 'Spending', value: data.coins.spending, color: '#ef4444', dir: 'down' },
                                    { label: 'Current Balance', value: data.coins.balance, color: '#fbbf24', dir: null },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-4 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            {item.dir === 'up' && <ArrowUp className="w-3 h-3" style={{ color: item.color }} />}
                                            {item.dir === 'down' && <ArrowDown className="w-3 h-3" style={{ color: item.color }} />}
                                            {item.dir === null && <Coins className="w-3 h-3" style={{ color: item.color }} />}
                                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="text-xl font-black" style={{ color: item.color }}>
                                            {item.value?.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── Recent Tasks ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.60 }}
                            className="rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <div className="px-6 py-4" style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">Recent Tasks</h2>
                            </div>
                            {data.recentTasks.length === 0 ? (
                                <div className="p-8 text-center" style={{ background: '#0d0d0d' }}>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No tasks posted yet.</p>
                                </div>
                            ) : (
                                data.recentTasks.map((task, idx) => (
                                    <div
                                        key={task._id}
                                        className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all"
                                        style={{
                                            background: '#0d0d0d',
                                            borderBottom: idx < data.recentTasks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                                        }}
                                        onClick={() => navigate(`/explore`)}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#0d0d0d'}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm truncate">{task.title}</div>
                                            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                                {task.applicants} applicant{task.applicants !== 1 ? 's' : ''} · {task.coins} coins
                                            </div>
                                        </div>
                                        <StatusPill status={task.status} />
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                                    </div>
                                ))
                            )}
                        </motion.div>

                    </AnimatePresence>
                )}

            </div>
        </div>
    );
};

export default Analytics;
