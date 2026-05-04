import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Home, Lock, Mail, ScanEye, Sparkles, Trophy, User, Zap, Eye, EyeOff } from 'lucide-react';
import { signup, validateSession, getCurrentUser } from '@/services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkSession = async () => {
            try {
                const response = await getCurrentUser();
                if (response.data && !cancelled) {
                    if (response.data.role === 'ROLE_ADMIN') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } catch (error) {
                // Not logged in or session expired
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
                    <span className="section-kicker mb-6">Join EcoBin</span>
                    <h1 className="auth-title">
                        Create your
                        <br />
                        <span className="hero-gradient-text">player profile.</span>
                    </h1>
                    <p className="auth-subtitle">
                        Join the community of eco-conscious users. Start scanning waste, earning points, and climbing the global leaderboard today.
                    </p>

                    <div className="stack-md">
                        <div className="game-loop-row">
                            <span className="icon-pill"><ScanEye size={18} className="text-blue-300" /></span>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-100">Live Scanning</div>
                                <div className="help-text">Use AI-powered camera to identify waste types instantly</div>
                            </div>
                        </div>
                        <div className="game-loop-row">
                            <span className="icon-pill"><Trophy size={18} className="text-amber-300" /></span>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-100">Gamified Experience</div>
                                <div className="help-text">Earn badges, maintain streaks, and compete with others</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-panel">
                    <div className="row space mb-6">
                        <div>
                            <h2 className="section-title mb-1">Create Account</h2>
                            <p className="section-note">It takes less than a minute to start.</p>
                        </div>
                        <Link to="/" className="icon-pill hover:scale-110 transition-transform" title="Back to Home">
                            <Home size={18} className="text-emerald-400" />
                        </Link>
                    </div>

                    {error && <div className="alert error mb-6">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="stack-sm">
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

                        <div className="stack-sm">
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

                        <div className="stack-sm">
                            <label className="form-label">Password</label>
                            <div className="input-icon-wrap relative">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-control pr-10"
                                    placeholder="Choose a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary mt-4" disabled={submitting}>
                            {submitting ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="help-text mt-8 text-center">
                        Already have an account? <Link to="/login" className="quick-link">Sign in</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
