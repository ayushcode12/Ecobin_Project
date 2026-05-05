import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Camera,
    Flame,
    LocateFixed,
    ScanEye,
    ShieldCheck,
    Sparkles,
    Trophy,
    Zap,
    Globe,
    Cpu,
    Leaf,
    LineChart
} from 'lucide-react';

const heroStats = [
    { label: 'EcoBin Active', value: 'Live AI Sorting' },
    { label: 'Economy', value: 'XP + Incentives' },
    { label: 'Scale', value: 'Global Leaderboard' },
];

const processEngine = [
    { step: '01', title: 'AI Scan', note: 'AI-driven object detection and classification.', icon: ScanEye },
    { step: '02', title: 'Validation', note: 'Human-in-the-loop verification of bin categories.', icon: Sparkles },
    { step: '03', title: 'Optimization', note: 'Earn impact points and maintain sorting streaks.', icon: Trophy },
];

const platformModes = [
    {
        title: 'Waste Classification',
        note: 'Real-time AI camera interface for instant waste classification and sorting guidance.',
        icon: Camera,
        action: '/scan',
        actionLabel: 'Start AI Scan',
        color: 'text-emerald-400'
    },
    {
        title: 'User Dashboard',
        note: 'Monitor your environmental footprint, track streaks, and analyze community rankings.',
        icon: LineChart,
        action: '/dashboard',
        actionLabel: 'View Dashboard',
        color: 'text-blue-400'
    },
    {
        title: 'Field Report',
        note: 'Submit waste reports to local authorities and track remediation progress.',
        icon: LocateFixed,
        action: '/report',
        actionLabel: 'Submit Report',
        color: 'text-amber-400'
    },
];

const Home = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(Boolean(token));
    }, []);

    const primaryAction = useMemo(() => {
        return isAuthenticated
            ? { label: 'Launch AI Scan', action: () => navigate('/scan') }
            : { label: 'Get Started', action: () => navigate('/signup') };
    }, [isAuthenticated, navigate]);

    return (
        <div className="page-shell space-y-12">
            <motion.section
                className="game-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="stack-lg">
                    <article className="surface-card p-10 bg-gradient-to-br from-slate-900/50 to-emerald-950/20 border-emerald-500/10">
                        <span className="section-kicker mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Intelligent Waste Management</span>
                        <h1 className="hero-title mb-6">
                            Next-Gen Waste
                            <br />
                            <span className="hero-gradient-text">Management.</span>
                        </h1>

                        <p className="hero-subtitle text-lg text-slate-300 max-w-2xl leading-relaxed">
                            EcoBin leverages edge-AI to transform waste classification into a high-performance environmental loop. Scan, validate, and optimize the planet's resource recovery in real-time.
                        </p>

                        <div className="hero-cta gap-4 mt-10">
                            <button className="btn-primary px-10 py-5 text-lg" onClick={primaryAction.action}>
                                {primaryAction.label} <ArrowRight size={20} />
                            </button>
                            <Link to={isAuthenticated ? '/leaderboard' : '/login'} className="btn-ghost px-10 py-5 text-lg border-white/5 bg-white/5">
                                {isAuthenticated ? 'Global Leaderboard' : 'Login'}
                            </Link>
                        </div>
                    </article>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {heroStats.map((item) => (
                            <div key={item.label} className="surface-card p-6 bg-white/[0.02] border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{item.label}</div>
                                <div className="text-xl font-black text-white tracking-tight">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <article className="surface-card p-8 bg-slate-900/40 border-white/5 stack-lg">
                    <div className="row space border-b border-white/5 pb-6">
                        <div>
                            <h2 className="text-xl font-black text-white">EcoBin Process</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Optimized Workflow</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Cpu size={20} />
                        </div>
                    </div>

                    <div className="stack-md">
                        {processEngine.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.step} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/30 transition-all">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-400 border border-emerald-500/20">
                                        {item.step}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                            {item.title} <Icon size={14} className="text-emerald-500/50" />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.note}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 mt-auto">
                        <div className="row gap-3 mb-2">
                            <Globe size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Global Impact</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Connecting 12,000+ users across 4 major regions for intelligent waste management.</p>
                    </div>
                </article>
            </motion.section>

            {/* Impact Metrics Strip */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5">
                {[
                    { label: 'Items Sorted', value: '842.1k', icon: ScanEye, color: 'text-emerald-400' },
                    { label: 'CO2 Offset', value: '42.8 Tons', icon: Leaf, color: 'text-blue-400' },
                    { label: 'Active Users', value: '12.4k', icon: Globe, color: 'text-amber-400' },
                    { label: 'Success Rate', value: '98.2%', icon: ShieldCheck, color: 'text-purple-400' },
                ].map(m => (
                    <div key={m.label} className="text-center md:text-left">
                        <div className="row gap-2 mb-1 justify-center md:justify-start">
                            <m.icon size={14} className={m.color} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                        </div>
                        <div className="text-2xl font-black text-white">{m.value}</div>
                    </div>
                ))}
            </section>

            <section className="space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-3xl font-black text-white tracking-tight">Platform Modules</h2>
                    <p className="text-slate-500">Access specialized interfaces designed for maximum environmental impact and efficiency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {platformModes.map((mode, index) => {
                        const Icon = mode.icon;
                        return (
                            <motion.article
                                key={mode.title}
                                className="surface-card p-8 group hover:border-white/20"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon size={28} className={mode.color} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{mode.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8">{mode.note}</p>
                                <Link to={mode.action} className="btn-ghost w-full border-white/5 bg-white/5 hover:bg-white/10 group-hover:border-emerald-500/20">
                                    {mode.actionLabel}
                                    <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </Link>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="surface-card p-12 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent border-emerald-500/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Ready to start<br /><span className="text-emerald-400">your EcoBin journey?</span></h2>
                        <p className="text-slate-400 max-w-md">Join EcoBin today and start contributing to the global resource recovery system.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn-primary px-12 py-5 text-lg" onClick={primaryAction.action}>
                            {primaryAction.label}
                        </button>
                        <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn-ghost px-12 py-5 text-lg border-white/5 bg-white/5">
                            {isAuthenticated ? 'Dashboard' : 'Sign Up'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

