import React, { useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    ClipboardList,
    FileText,
    History,
    Home,
    LayoutDashboard,
    LogOut,
    MapPinned,
    Menu,
    ScanEye,
    Settings,
    ShieldCheck,
    Trophy,
    UserCircle2,
    Users,
    X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(Boolean(token));

        if (!token) {
            setIsAdmin(false);
            return;
        }

        let cancelled = false;

        const fetchRole = async () => {
            try {
                const response = await getCurrentUser();
                if (!cancelled) {
                    setIsAdmin(response?.data?.role === 'ROLE_ADMIN');
                }
            } catch (error) {
                if (!cancelled) {
                    setIsAdmin(false);
                }
            }
        };

        fetchRole();
        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const navItems = useMemo(() => {
        if (!isAuthenticated) {
            return [{ to: '/', label: 'Home', icon: Home }];
        }

        const common = [
            { to: '/', label: 'Home', icon: Home },
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/scan', label: 'Scan', icon: ScanEye },
            { to: '/report', label: 'Report', icon: MapPinned },
            { to: '/history', label: 'History', icon: History },
            { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { to: '/profile', label: 'Profile', icon: UserCircle2 },
        ];

        if (!isAdmin) return common;

        // Clean, focused Admin Navbar
        return [
            { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
            { to: '/admin/users', label: 'Users', icon: Users },
            { to: '/admin/reports', label: 'Reports', icon: ShieldCheck },
            { to: '/admin/scans', label: 'AI Audit', icon: ScanEye },
            { to: '/admin/content', label: 'Content', icon: FileText },
            { to: '/admin/logs', label: 'Activity Logs', icon: ClipboardList },
            { to: '/admin/settings', label: 'Settings', icon: Settings },
        ];
    }, [isAuthenticated, isAdmin]);

    const isPathActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    const renderNavLinks = () => (
        <>
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link key={item.to} to={item.to} className={`nav-link ${isPathActive(item.to) ? 'active' : ''}`}>
                        <Icon size={15} /> {item.label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <header className="top-nav">
            <div className="top-nav-inner">
                <button 
                    className="brand-link" 
                    onClick={() => {
                        if (!isAuthenticated) navigate('/');
                        else if (isAdmin) navigate('/admin/dashboard');
                        else navigate('/dashboard');
                    }}
                >
                    <span className="brand-mark">
                        <img src="/ecobin-mark.svg" alt="EcoBin logo" className="brand-logo-img" />
                    </span>
                    <span className="brand-copy">
                        <span className="brand-name">EcoBin</span>
                        <span className="brand-meta">Scan. Score. Streak.</span>
                    </span>
                </button>

                <nav className="nav-links" aria-label="Primary">
                    {renderNavLinks()}
                </nav>

                {!isAuthenticated ? (
                    <div className="nav-actions hidden xl:inline-flex">
                        <Link to="/login" className={`nav-link ${isPathActive('/login') ? 'active' : ''}`}>Login</Link>
                        <Link to="/signup" className="btn-primary">Create Account</Link>
                    </div>
                ) : (
                    <div className="nav-actions hidden xl:inline-flex">
                        {isAdmin ? <span className="badge warning">Admin</span> : null}
                        <button className="btn-danger" onClick={handleLogout}>
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                )}

                <button
                    className="nav-toggle"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <div className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
                {isAuthenticated && isAdmin ? (
                    <div className="mb-4 row wrap">
                        <span className="badge warning">Admin</span>
                    </div>
                ) : null}

                <div className="stack-sm">{renderNavLinks()}</div>

                {!isAuthenticated ? (
                    <div className="nav-actions mt-2 grid w-full gap-2">
                        <Link to="/login" className={`nav-link ${isPathActive('/login') ? 'active' : ''}`}>Login</Link>
                        <Link to="/signup" className="btn-primary w-full">Create Account</Link>
                    </div>
                ) : (
                    <div className="nav-actions mt-2 w-full">
                        <button className="btn-danger w-full" onClick={handleLogout}>
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
