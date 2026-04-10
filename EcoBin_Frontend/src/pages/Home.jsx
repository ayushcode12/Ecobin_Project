import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Award,
    Camera,
    ClipboardList,
    Leaf,
    LocateFixed,
    ShieldCheck,
    Sparkles,
    Trophy,
} from 'lucide-react';

const stepCards = [
    {
        title: 'Open Live Camera Scan',
        description: 'Keep the item inside the square frame and let the model classify it in real time.',
        icon: Camera,
    },
    {
        title: 'Review The Suggested Category',
        description: 'Auto-confirmed reads still pass through a user review step before points are saved.',
        icon: Sparkles,
    },
    {
        title: 'Track Action Beyond Scanning',
        description: 'Report public waste spots, monitor status changes, and build leaderboard momentum.',
        icon: LocateFixed,
    },
];

const highlights = [
    { label: 'Live Scan Flow', value: 'Camera + Review' },
    { label: 'Cleanup Workflow', value: 'Report to Admin Queue' },
    { label: 'Engagement Layer', value: 'Points, Streaks, Ranking' },
];

const systemCards = [
    {
        title: 'AI Classification',
        description: 'Show a waste item live, stabilize the prediction, then confirm the correct bin category.',
        icon: Camera,
    },
    {
        title: 'Waste Reporting',
        description: 'Capture roadside waste with location, severity, and notes so the issue becomes actionable.',
        icon: ClipboardList,
    },
    {
        title: 'Admin Oversight',
        description: 'Manage report transitions, assign pickup dates, and close tasks with proof.',
        icon: ShieldCheck,
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
            ? { label: 'Open Dashboard', action: () => navigate('/dashboard') }
            : { label: 'Login To Start', action: () => navigate('/login') };
    }, [isAuthenticated, navigate]);

    return (
        <div className="page-shell space-y-6">
            <motion.section
                className="hero-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <article className="surface-card home-hero-main">
                    <span className="section-kicker mb-4">AI Camera Scan + Waste Reporting Platform</span>
                    <h1 className="hero-title mb-4">
                        Turn waste sorting into
                        <br />
                        <span className="hero-gradient-text">a polished, live campus experience.</span>
                    </h1>

                    <p className="hero-subtitle">
                        EcoBin helps users classify waste with a live camera, report public waste hotspots, and collect points through a system that feels like a real product instead of a rough prototype.
                    </p>

                    <div className="hero-cta">
                        <button className="btn-primary" onClick={primaryAction.action}>
                            {primaryAction.label} <ArrowRight size={16} />
                        </button>
                        <Link to={isAuthenticated ? '/scan' : '/signup'} className="btn-ghost">
                            {isAuthenticated ? 'Open Scan Page' : 'Create Free Account'}
                        </Link>
                    </div>

                    <div className="home-stat-grid">
                        {highlights.map((item) => (
                            <div key={item.label} className="home-stat-tile">
                                <p className="text-sm font-bold text-slate-100">{item.value}</p>
                                <p className="help-text mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <div className="stack-lg">
                    <article className="surface-card inset home-hero-side">
                        <div className="row wrap space mb-4">
                            <h2 className="section-title">
                                <Leaf size={18} className="text-emerald-300" /> Live Scan Journey
                            </h2>
                            <span className="badge accent">Camera to points</span>
                        </div>

                        <div className="stack-sm">
                            {stepCards.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.title} className="metric-chip">
                                        <div className="row mb-2">
                                            <span className="icon-pill"><Icon size={16} className="text-blue-300" /></span>
                                            <strong className="text-sm">{step.title}</strong>
                                        </div>
                                        <p className="help-text">{step.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </article>

                    <article className="surface-card inset">
                        <h2 className="section-title mb-4">
                            <Award size={18} className="text-amber-300" /> Project Value
                        </h2>
                        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">User-friendly flow</p>
                                <p className="help-text mt-1">Real-time feedback, manual review, and clear result confirmation.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">Admin-ready backend</p>
                                <p className="help-text mt-1">Reports, approvals, pickup assignments, and resolution proof are already part of the system.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">Demo-friendly impact</p>
                                <p className="help-text mt-1">Scanning, reporting, and gamification make the project easy to present live.</p>
                            </div>
                        </div>
                    </article>
                </div>
            </motion.section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">How The Platform Works</h2>
                        <p className="section-note">A cleaner structure for demo day: live scan, confirm, and community action in one flow.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {stepCards.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.title}
                                className="surface-card home-step-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.15, duration: 0.5 }}
                            >
                                <div className="icon-pill mb-3">
                                    <Icon size={17} className="text-blue-300" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-100">{step.title}</h3>
                                <p className="section-note">{step.description}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="grid-2 page-section">
                <article className="surface-card">
                    <h3 className="section-title mb-2">
                        <Trophy size={17} className="text-blue-300" /> Built For Daily Participation
                    </h3>
                    <p className="section-note mb-4">
                        Users can keep scanning, improve their streaks, and stay active through leaderboard competition.
                    </p>
                    <Link to="/leaderboard" className="btn-secondary">See Leaderboard</Link>
                </article>

                <article className="surface-card">
                    <h3 className="section-title mb-2">
                        <LocateFixed size={17} className="text-blue-300" /> Built For Ground Response
                    </h3>
                    <p className="section-note mb-4">
                        Roadside waste reports move through a clear workflow so the project shows action beyond classification.
                    </p>
                    <Link to="/report" className="btn-secondary">Report Waste</Link>
                </article>
            </section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">System Modules</h2>
                        <p className="section-note">The UI now reflects the full stack story of the project, not only the scanner.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {systemCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <article key={card.title} className="surface-card">
                                <div className="icon-pill mb-4">
                                    <Icon size={18} className="text-emerald-300" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-100">{card.title}</h3>
                                <p className="section-note">{card.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="page-section">
                <div className="surface-card home-cta-card">
                    <div className="row wrap space">
                        <div>
                            <h2 className="text-2xl font-black text-slate-100">Ready for a strong project demo?</h2>
                            <p className="section-note mt-1">Open the scanner, test the reporting workflow, and show the complete experience with a cleaner interface.</p>
                        </div>
                        <div className="row wrap">
                            <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn-primary">Start Now</Link>
                            <Link to="/scan" className="btn-secondary">Open Live Scan</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
