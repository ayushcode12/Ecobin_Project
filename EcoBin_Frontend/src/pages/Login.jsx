import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Home, Lock, Mail, Sparkles, Zap } from 'lucide-react';
import { login, validateSession } from '@/services/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkSession = async () => {
            const valid = await validateSession();
            if (valid && !cancelled) {
                navigate('/dashboard');
            }
        };

        checkSession();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
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
                    <span className="section-kicker mb-4">Welcome Back</span>
                    <h1 className="auth-title">Continue your sustainability journey with EcoBin.</h1>
                    <p className="auth-subtitle">Sign in to access your dashboard, track your points, and manage your waste reports.</p>

                    <div className="stack-sm">
                        <div className="metric-chip row">
                            <Sparkles size={16} className="text-blue-300" />
                            <span className="help-text">View your scanned history and impact</span>
                        </div>
                        <div className="metric-chip row">
                            <Zap size={16} className="text-blue-300" />
                            <span className="help-text">Redeem points for local rewards</span>
                        </div>
                    </div>
                </div>

                <div className="auth-panel">
                    <h2 className="section-title mb-1">Sign In</h2>
                    <p className="section-note mb-4">Enter your credentials to access your account.</p>

                    <div className="mb-4">
                        <Link to="/" className="btn-ghost">
                            <Home size={15} /> Back To Home
                        </Link>
                    </div>

                    {error && <div className="alert error mb-4">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div>
                            <label className="form-label">Email Address</label>
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="help-text mt-4">
                        Don't have an account? <Link to="/signup" className="quick-link">Create one here</Link>.
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
