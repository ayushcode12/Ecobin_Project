import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { login } from '@/services/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
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
                    <span className="badge accent" style={{ marginBottom: '0.75rem' }}>Welcome Back</span>
                    <h1 className="auth-title">Sign in and continue your clean-city streak.</h1>
                    <p className="auth-subtitle">Classify waste, report local issues, and keep earning points every day.</p>

                    <div className="stack-sm">
                        <div className="metric-chip row">
                            <ShieldCheck size={16} color="#8ab6ff" />
                            <span className="help-text">Secure role-based access for users and admins</span>
                        </div>
                        <div className="metric-chip row">
                            <Trophy size={16} color="#8ab6ff" />
                            <span className="help-text">Points, streaks, and leaderboard progress</span>
                        </div>
                        <div className="metric-chip row">
                            <Sparkles size={16} color="#8ab6ff" />
                            <span className="help-text">Rule-based text classification live for testing</span>
                        </div>
                    </div>
                </div>

                <div className="auth-panel">
                    <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>Account Login</h2>
                    <p className="section-note" style={{ marginBottom: '0.9rem' }}>Use your registered email and password.</p>

                    {error && <div className="alert error" style={{ marginBottom: '0.8rem' }}>{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
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
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="help-text" style={{ marginTop: '0.95rem' }}>
                        New here? <Link to="/signup" className="quick-link">Create an account</Link>.
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
