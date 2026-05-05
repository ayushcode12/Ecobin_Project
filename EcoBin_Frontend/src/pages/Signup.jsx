import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Home, 
    Lock, 
    Mail, 
    ScanEye, 
    Cpu, 
    Trophy, 
    User, 
    Eye, 
    EyeOff,
    Activity
} from 'lucide-react';
import { signup, getCurrentUser } from '@/services/api';

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
                // Not logged in
            }
        };

        checkSession();
        return () => { cancelled = true; };
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await signup({ name, email, password });
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please check your details.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <motion.div
                className="auth-card max-w-[1000px] border-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-panel showcase bg-gradient-to-br from-slate-900 to-emerald-950/40">
                    <span className="section-kicker mb-8 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">EcoBin Registration</span>
                    <h1 className="text-4xl font-black text-white leading-tight mb-6">
                        Join the
                        <br />
                        <span className="hero-gradient-text text-5xl">Sustainable Network.</span>
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[320px]">
                        Register your identity to begin neural waste classification and contribute to the global resource orchestration ledger.
                    </p>

                    <div className="stack-md">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <ScanEye size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-100">Neural Scan</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">AI-Powered Classification</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Activity size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-100">Process Optimization</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Resource Flow Analytics</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-panel p-10 md:p-14">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Join EcoBin</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Create Your Account</p>
                        </div>
                        <Link to="/" className="h-10 w-10 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-emerald-400 hover:bg-white/10 transition-colors">
                            <Home size={18} />
                        </Link>
                    </div>

                    {error && <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold mb-8">{error}</div>}

                    <form className="stack-lg" onSubmit={handleSubmit}>
                        <div className="stack-sm">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Full Identity Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    className="input-control pl-12"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="stack-sm">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Identifier (Email)</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    className="input-control pl-12"
                                    placeholder="node@network.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="stack-sm">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Key (Password)</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-control pl-12 pr-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary py-5 text-lg" disabled={submitting}>
                            {submitting ? 'Initializing Node...' : 'Initialize Identity'} <Cpu size={20} className="ml-2" />
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <span className="text-xs text-slate-500">Already a network node? </span>
                        <Link to="/login" className="text-xs font-bold text-emerald-400 hover:underline ml-1">Authenticate Access</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;

