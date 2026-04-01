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

const steps = [
    {
        title: 'Capture or Type Waste',
        description: 'Use camera scan or type text like "banana peel" to classify quickly.',
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
    { label: 'Rule Engine Ready', value: '30+' },
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
            ? { label: 'Go To Dashboard', action: () => navigate('/dashboard') }
            : { label: 'Login To Start', action: () => navigate('/login') };
    }, [isAuthenticated, navigate]);

    return (
        <div className="page-shell">
            <motion.section
                className="hero-grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
            >
                <article className="surface-card home-hero-main">
                    <span className="badge brand" style={{ marginBottom: '0.9rem' }}>Community Waste Platform</span>
                    <h1 className="hero-title" style={{ marginBottom: '0.85rem' }}>
                        Classify waste better.
                        <br />
                        <span className="hero-gradient-text">Keep streets cleaner together.</span>
                    </h1>

                    <p className="hero-subtitle">
                        EcoBin helps people sort waste correctly, report roadside dumps, and build consistent green habits through points and streaks.
                    </p>

                    <div className="hero-cta" style={{ marginTop: '1.35rem' }}>
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
                                <div style={{ fontSize: '1.14rem', fontWeight: 780, marginBottom: '0.12rem' }}>{item.value}</div>
                                <div className="help-text">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="surface-card inset home-hero-side">
                    <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>
                        <Leaf size={18} color="#22c98d" /> Why EcoBin
                    </h2>
                    <p className="section-note" style={{ marginBottom: '0.95rem' }}>
                        People often confuse recyclable, biodegradable, and non-biodegradable waste. EcoBin gives immediate guidance and action paths.
                    </p>

                    <div className="stack-md">
                        <div className="surface-card inset" style={{ padding: '0.85rem' }}>
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <ClipboardList size={16} color="#8ab6ff" />
                                <strong>User Classification</strong>
                            </div>
                            <p className="help-text">Type waste text and test rule-based categorization now.</p>
                        </div>

                        <div className="surface-card inset" style={{ padding: '0.85rem' }}>
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <LocateFixed size={16} color="#8ab6ff" />
                                <strong>Admin Action Queue</strong>
                            </div>
                            <p className="help-text">Track reports from PENDING to COMPLETED with proof.</p>
                        </div>

                        <div className="surface-card inset" style={{ padding: '0.85rem' }}>
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <Award size={16} color="#8ab6ff" />
                                <strong>Engagement Loop</strong>
                            </div>
                            <p className="help-text">Points, streaks, and leaderboard keep users active daily.</p>
                        </div>
                    </div>
                </article>
            </motion.section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">How EcoBin Works</h2>
                        <p className="section-note">Simple 3-step experience, already live for testing before model integration.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.title}
                                className="surface-card home-step-card"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="icon-pill" style={{ marginBottom: '0.78rem' }}>
                                    <Icon size={17} color="#9cc5ff" />
                                </div>
                                <h3 style={{ fontSize: '1.12rem', marginBottom: '0.45rem' }}>{step.title}</h3>
                                <p className="section-note">{step.description}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="grid-2 page-section">
                <article className="surface-card" style={{ padding: '1.35rem' }}>
                    <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>
                        <Trophy size={17} color="#8ab6ff" /> Built For Daily Usage
                    </h3>
                    <p className="section-note" style={{ marginBottom: '0.75rem' }}>
                        Users can keep scanning text items, monitor history, and continue daily quest progress.
                    </p>
                    <Link to="/history" className="btn-secondary">View Activity History</Link>
                </article>

                <article className="surface-card" style={{ padding: '1.35rem' }}>
                    <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>
                        <LocateFixed size={17} color="#8ab6ff" /> Built For Field Response
                    </h3>
                    <p className="section-note" style={{ marginBottom: '0.75rem' }}>
                        Report road waste with severity and location details so admin cleanup can be prioritized.
                    </p>
                    <Link to="/report" className="btn-secondary">Report Waste</Link>
                </article>
            </section>

            <section className="page-section">
                <div
                    className="surface-card home-cta-card"
                    style={{
                        background: 'linear-gradient(120deg, rgba(34,201,141,0.2), rgba(15,27,52,0.84) 48%, rgba(79,141,255,0.22))',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.9rem',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '1.42rem', fontWeight: 800, marginBottom: '0.18rem' }}>Ready to continue building?</h2>
                        <p className="section-note">The platform is now ready for live testing and the next step is model integration.</p>
                    </div>
                    <div className="row wrap">
                        <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn-primary">Start Now</Link>
                        <Link to="/leaderboard" className="btn-secondary">See Leaderboard</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
