import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Camera, ClipboardList, Leaf, LocateFixed, Sparkles } from 'lucide-react';

const steps = [
    {
        title: 'Capture or Type Waste',
        description: 'Users can scan waste or type text like "banana peel" to classify quickly.',
        icon: Camera,
    },
    {
        title: 'Instant Category Result',
        description: 'The platform responds with a category and points using rules before ML integration.',
        icon: Sparkles,
    },
    {
        title: 'Report and Improve Streets',
        description: 'Roadside waste reports reach admins with location and severity to trigger action.',
        icon: LocateFixed,
    },
];

const highlights = [
    { label: 'Text Rules Ready', value: '30+' },
    { label: 'Admin Workflows', value: 'Strict' },
    { label: 'Daily Engagement', value: 'Points + Streaks' },
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
            : { label: 'Start With Login', action: () => navigate('/login') };
    }, [isAuthenticated, navigate]);

    return (
        <div className="page-shell">
            <motion.section
                className="hero-grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="surface-card" style={{ padding: '1.5rem' }}>
                    <span className="badge brand" style={{ marginBottom: '0.8rem' }}>Community Waste Intelligence</span>
                    <h1 className="hero-title">
                        Classify waste better.
                        <br />
                        <span className="hero-gradient-text">Keep streets cleaner together.</span>
                    </h1>
                    <p className="hero-subtitle">
                        EcoBin helps users classify waste, report hotspots, and earn daily points. You already have the full journey built for rule-based classification and admin action.
                    </p>

                    <div className="hero-cta">
                        <button className="btn-primary" onClick={primaryAction.action}>
                            {primaryAction.label} <ArrowRight size={16} />
                        </button>
                        <Link to={isAuthenticated ? '/scan' : '/signup'} className="btn-ghost">
                            {isAuthenticated ? 'Open Scan Page' : 'Create Free Account'}
                        </Link>
                    </div>

                    <div className="kpi-strip" style={{ marginTop: '1.05rem' }}>
                        {highlights.map((item) => (
                            <div key={item.label} className="kpi-item">
                                <div className="value">{item.value}</div>
                                <div className="label">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="surface-card inset" style={{ padding: '1.35rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '0.7rem' }}>
                        <Leaf size={18} color="#22c98d" /> Why This Matters
                    </h2>
                    <p className="section-note" style={{ marginBottom: '0.95rem' }}>
                        Most users are confused between recyclable and biodegradable waste. EcoBin reduces that confusion with immediate guidance and clear next actions.
                    </p>

                    <div className="stack-md">
                        <div className="metric-chip">
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <ClipboardList size={16} color="#8ab6ff" />
                                <strong>Text Classification</strong>
                            </div>
                            <p className="help-text">Rule-based and testable now, ML-ready later.</p>
                        </div>

                        <div className="metric-chip">
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <LocateFixed size={16} color="#8ab6ff" />
                                <strong>Road Waste Reporting</strong>
                            </div>
                            <p className="help-text">Admins track status from pending to completion with proof.</p>
                        </div>

                        <div className="metric-chip">
                            <div className="row" style={{ marginBottom: '0.2rem' }}>
                                <Award size={16} color="#8ab6ff" />
                                <strong>Gamified Participation</strong>
                            </div>
                            <p className="help-text">Points, streaks, and leaderboard keep users active daily.</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title">How EcoBin Works</h2>
                        <p className="section-note">Simple flow that is already testable before model integration.</p>
                    </div>
                </div>

                <div className="grid-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.title}
                                className="surface-card"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12 }}
                            >
                                <div className="icon-pill" style={{ marginBottom: '0.7rem' }}>
                                    <Icon size={17} color="#9cc5ff" />
                                </div>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{step.title}</h3>
                                <p className="section-note">{step.description}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            <section className="page-section">
                <div
                    className="surface-card"
                    style={{
                        background: 'linear-gradient(120deg, rgba(34,201,141,0.18), rgba(15,27,52,0.82) 48%, rgba(79,141,255,0.2))',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.8rem',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>Ready to ship the next level?</h2>
                        <p className="section-note">UI, rule engine, reporting workflow, and history are ready. Model integration can plug in next.</p>
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
