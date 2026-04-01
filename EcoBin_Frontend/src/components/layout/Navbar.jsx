import React, { useEffect, useState } from 'react';
import { Leaf, LogOut, LayoutDashboard, ShieldCheck, History, MapPinned, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '@/services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        if (!token) {
            setIsAdmin(false);
            return;
        }

        let cancelled = false;

        const fetchCurrentUser = async () => {
            try {
                const response = await getCurrentUser();
                if (!cancelled) {
                    setIsAdmin(response?.data?.role === 'ROLE_ADMIN');
                }
            } catch (err) {
                if (!cancelled) {
                    setIsAdmin(false);
                }
            }
        };

        fetchCurrentUser();
        return () => {
            cancelled = true;
        };
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    const navLinkStyle = (path) => {
        const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return {
            color: active ? '#e2e8f0' : '#94a3b8',
            fontWeight: active ? 700 : 500,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.5rem',
            borderRadius: '0.45rem',
            background: active ? 'rgba(148,163,184,0.12)' : 'transparent',
            whiteSpace: 'nowrap'
        };
    };

    return (
        <nav className="glass" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 1rem',
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 50,
            borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', paddingLeft: '0.2rem' }} onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
                <Leaf color="#10b981" size={24} />
                <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#fff' }}>EcoBin</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.15rem' }}>
                {!isAuthenticated ? (
                    <>
                        <Link to="/" style={navLinkStyle('/')}>
                            <Home size={16} /> Home
                        </Link>
                        <Link to="/login" style={navLinkStyle('/login')}>Login</Link>
                        <Link to="/signup">
                            <button className="btn-primary" style={{ padding: '0.48rem 0.92rem', fontSize: '0.86rem' }}>Get Started</button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/" style={navLinkStyle('/')}>
                            <Home size={16} /> Home
                        </Link>
                        <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/scan" style={navLinkStyle('/scan')}>Scan</Link>
                        <Link to="/report" style={navLinkStyle('/report')}>
                            <MapPinned size={16} /> Report
                        </Link>
                        <Link to="/history" style={navLinkStyle('/history')}>
                            <History size={16} /> History
                        </Link>
                        <Link to="/leaderboard" style={navLinkStyle('/leaderboard')}>Leaderboard</Link>
                        {isAdmin && (
                            <Link to="/admin/reports" style={navLinkStyle('/admin/reports')}>
                                <ShieldCheck size={16} /> Admin Reports
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin/rules" style={navLinkStyle('/admin/rules')}>
                                <ShieldCheck size={16} /> Admin Rules
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.35)',
                                color: '#f87171',
                                padding: '0.46rem 0.72rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.86rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <LogOut size={15} /> Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
