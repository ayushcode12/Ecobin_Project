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
} from 'lucide-react';

const heroStats = [
    { label: 'Mode', value: 'Live AI Scan' },
    { label: 'Reward', value: 'XP + Streak' },
    { label: 'Goal', value: 'Climb Leaderboard' },
];

const playerLoop = [
    { step: '01', title: 'Scan', note: 'Show the item inside the frame.', icon: ScanEye },
    { step: '02', title: 'Confirm', note: 'Review the category before saving.', icon: Sparkles },
    { step: '03', title: 'Score', note: 'Earn points and keep the streak alive.', icon: Trophy },
];

const gameModes = [
    {
        title: 'Scan Mode',
        note: 'Fast live camera classification with final review.',
        icon: Camera,
        action: '/scan',
        actionLabel: 'Open Scan',
    },
    {
        title: 'Quest Mode',
        note: 'Daily activity, streak pressure, and leaderboard progress.',
        icon: Flame,
        action: '/dashboard',
        actionLabel: 'Open Dashboard',
    },
    {
        title: 'Street Mode',
        note: 'Report public waste and push it into the admin queue.',
        icon: LocateFixed,
        action: '/report',
        actionLabel: 'Report Waste',
    },
];

const systemTiles = [
    { label: 'Streak Engine', value: 'Daily use matters', icon: Zap },
    { label: 'Admin Flow', value: 'Track report action', icon: ShieldCheck },
    { label: 'Rank Chase', value: 'Compete on points', icon: Trophy },
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
            ? { label: 'Play Scan Mode', action: () => navigate('/scan') }
            : { label: 'Start Playing', action: () => navigate('/signup') };
    }, [isAuthenticated, navigate]);

    return (
        <div className="page-shell narrow space-y-6">
            <motion.section
                className="game-hero"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <div className="stack-md">
                    <article className="surface-card game-command">
                        <span className="section-kicker mb-4">Gamified Waste Sorting</span>
                        <h1 className="hero-title mb-4">
                            Scan waste.
                            <br />
                            <span className="hero-gradient-text">Stack streaks. Score higher.</span>
                        </h1>

                        <p className="hero-subtitle">
                            EcoBin turns waste classification into a game loop: scan live, confirm the right bin, earn XP, and keep your streak alive.
                        </p>

                        <div className="hero-cta">
                            <button className="btn-primary" onClick={primaryAction.action}>
                                {primaryAction.label} <ArrowRight size={16} />
                            </button>
                            <Link to={isAuthenticated ? '/leaderboard' : '/login'} className="btn-ghost">
                                {isAuthenticated ? 'See Leaderboard' : 'Login'}
                            </Link>
                        </div>
                    </article>

                    <div className="game-stat-grid">
                        {heroStats.map((item) => (
                            <div key={item.label} className="game-stat-card">
                                <div className="game-stat-label">{item.label}</div>
                                <div className="game-stat-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <article className="surface-card inset game-side-panel">
                    <div className="row space mb-4">
                        <h2 className="section-title">Player Loop</h2>
                        <span className="badge brand">Fast Run</span>
                    </div>

                    <div className="stack-sm mb-5">
                        {playerLoop.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.step} className="game-loop-row">
                                    <div className="game-loop-step">{item.step}</div>
                                    <span className="icon-pill"><Icon size={16} className="text-emerald-300" /></span>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-100">{item.title}</div>
                                        <div className="help-text">{item.note}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="row space mb-4">
                        <h2 className="section-title">Why It Feels Playable</h2>
                        <span className="badge warning">XP Loop</span>
                    </div>

                    <div className="game-tile-grid">
                        {systemTiles.map((tile) => {
                            const Icon = tile.icon;
                            return (
                                <div key={tile.label} className="metric-chip">
                                    <div className="row mb-3">
                                        <span className="icon-pill"><Icon size={15} className="text-blue-300" /></span>
                                        <span className="text-sm font-bold text-slate-100">{tile.label}</span>
                                    </div>
                                    <div className="help-text">{tile.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </article>
            </motion.section>

            <motion.section
                className="surface-card game-highlight-bar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
            >
                <div className="game-highlight-grid">
                    <div className="game-highlight-item">
                        <div className="game-stat-label">Core Loop</div>
                        <div className="game-stat-value">Scan to confirm to score</div>
                    </div>
                    <div className="game-highlight-item">
                        <div className="game-stat-label">Motivation</div>
                        <div className="game-stat-value">XP, streaks, badges</div>
                    </div>
                    <div className="game-highlight-item">
                        <div className="game-stat-label">Field Action</div>
                        <div className="game-stat-value">Report waste to admins</div>
                    </div>
                </div>
            </motion.section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">Choose A Mode</h2>
                        <p className="section-note">Less reading, more action.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {gameModes.map((mode, index) => {
                        const Icon = mode.icon;
                        return (
                            <motion.article
                                key={mode.title}
                                className="surface-card"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ delay: index * 0.08, duration: 0.35 }}
                            >
                                <div className="row space mb-5">
                                    <span className="icon-pill"><Icon size={18} className="text-emerald-300" /></span>
                                    <span className="badge accent">{mode.title}</span>
                                </div>
                                <h3 className="mb-2 text-xl font-black text-slate-100">{mode.title}</h3>
                                <p className="section-note mb-5">{mode.note}</p>
                                <Link to={mode.action} className="btn-secondary w-full justify-between">
                                    {mode.actionLabel}
                                    <ArrowRight size={15} />
                                </Link>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="surface-card game-cta-strip">
                <div className="row wrap space gap-4">
                    <div>
                        <div className="section-title mb-2">Today&apos;s mission: scan, confirm, score.</div>
                        <div className="help-text">Open the camera and start the loop.</div>
                    </div>
                    <div className="row wrap">
                        <button className="btn-primary" onClick={primaryAction.action}>
                            {primaryAction.label}
                        </button>
                        <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn-ghost">
                            {isAuthenticated ? 'View Progress' : 'Create Account'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
