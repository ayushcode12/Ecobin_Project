import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Sparkles, User, Zap } from 'lucide-react';
import { signup } from '@/services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await signup({ name, email, password });
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please check your details and retry.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="auth-panel showcase">
                    <span className="badge brand mb-3">Join EcoBin</span>
                    <h1 className="auth-title">Build habits that reduce waste every day.</h1>
                    <p className="auth-subtitle">Your account unlocks scanning, reporting, streak tracking, and leaderboard ranking.</p>

                    <div className="stack-sm">
                        <div className="metric-chip row"><Sparkles size={16} className="text-blue-300" /><span className="help-text">Fast text-based classification for testing now</span></div>
                        <div className="metric-chip row"><Zap size={16} className="text-blue-300" /><span className="help-text">Earn points on scans and stay active with streaks</span></div>
                    </div>
                </div>

                <div className="auth-panel">
                    <h2 className="section-title mb-1">Create Account</h2>
                    <p className="section-note mb-4">It only takes a minute to get started.</p>

                    {error && <div className="alert error mb-4">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div>
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrap">
                                <User size={16} className="input-icon" />
                                <input
                                    type="text"
                                    className="input-control"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Email</label>
                            <div className="input-icon-wrap">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    className="input-control"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="input-icon-wrap">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    className="input-control"
                                    placeholder="Choose a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="help-text mt-4">
                        Already have an account? <Link to="/login" className="quick-link">Sign in</Link>.
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
