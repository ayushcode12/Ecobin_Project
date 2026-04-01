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
    Sparkles,
    Trophy,
} from 'lucide-react';

const stepCards = [
    {
        title: 'Capture or Type Waste',
        description: 'Use camera scan or type items like banana peel to classify in seconds.',
        icon: Camera,
    },
    {
        title: 'Get Instant Category',
        description: 'Rule engine returns category, matched keyword, and points in real time.',
        icon: Sparkles,
    },
    {
        title: 'Report Street Waste',
        description: 'Send location-aware reports so admins can track cleanup workflow.',
        icon: LocateFixed,
    },
];

const highlights = [
    { label: 'Rule Engine Ready', value: '30+ Keywords' },
    { label: 'Workflow', value: 'Strict Status Flow' },
    { label: 'Gamification', value: 'Points + Streaks' },
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
                className="grid gap-4 xl:grid-cols-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <article className="surface-card home-hero-main xl:col-span-8">
                    <span className="badge brand mb-4">Community Waste Platform</span>
                    <h1 className="hero-title mb-4">
                        Classify waste better.
                        <br />
                        <span className="hero-gradient-text">Keep streets cleaner together.</span>
                    </h1>

                    <p className="hero-subtitle">
                        EcoBin helps people sort waste correctly, report roadside dumps, and build daily green habits with points and streaks.
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

                <article className="surface-card inset home-hero-side xl:col-span-4">
                    <h2 className="section-title mb-4">
                        <Leaf size={18} className="text-emerald-300" /> Why EcoBin Works
                    </h2>

                    <div className="stack-sm">
                        <div className="metric-chip">
                            <div className="row mb-1">
                                <ClipboardList size={16} className="text-blue-300" />
                                <strong className="text-sm">User Classification</strong>
                            </div>
                            <p className="help-text">Text classification live now for testing and points.</p>
                        </div>

                        <div className="metric-chip">
                            <div className="row mb-1">
                                <LocateFixed size={16} className="text-blue-300" />
                                <strong className="text-sm">Admin Action Queue</strong>
                            </div>
                            <p className="help-text">Reports move from PENDING to COMPLETED with proof.</p>
                        </div>

                        <div className="metric-chip">
                            <div className="row mb-1">
                                <Award size={16} className="text-blue-300" />
                                <strong className="text-sm">Engagement Loop</strong>
                            </div>
                            <p className="help-text">Points, streaks, and leaderboard keep users active.</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                        <Link to="/history" className="btn-soft w-full justify-start">View History</Link>
                        <Link to="/report" className="btn-soft w-full justify-start">Report Waste</Link>
                    </div>
                </article>
            </motion.section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">How EcoBin Works</h2>
                        <p className="section-note">Simple 3-step experience ready before model integration.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {stepCards.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.title}
                                className="surface-card home-step-card"
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
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
                        <Trophy size={17} className="text-blue-300" /> Built For Daily Usage
                    </h3>
                    <p className="section-note mb-4">
                        Keep classifying text items, monitor progress, and continue daily quest streak.
                    </p>
                    <Link to="/history" className="btn-secondary">View Activity History</Link>
                </article>

                <article className="surface-card">
                    <h3 className="section-title mb-2">
                        <LocateFixed size={17} className="text-blue-300" /> Built For Field Response
                    </h3>
                    <p className="section-note mb-4">
                        Report road waste with severity and location details so cleanup can be prioritized.
                    </p>
                    <Link to="/report" className="btn-secondary">Report Waste</Link>
                </article>
            </section>

            <section className="page-section">
                <div className="surface-card home-cta-card bg-gradient-to-r from-emerald-500/25 via-slate-900/85 to-blue-500/25">
                    <div className="row wrap space">
                        <div>
                            <h2 className="text-2xl font-black text-slate-100">Ready to continue building?</h2>
                            <p className="section-note mt-1">The platform is ready for live testing. Next step is model integration.</p>
                        </div>
                        <div className="row wrap">
                            <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn-primary">Start Now</Link>
                            <Link to="/leaderboard" className="btn-secondary">See Leaderboard</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
