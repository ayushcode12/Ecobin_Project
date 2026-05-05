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
    Activity,
    Cpu,
    Database
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '@/services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [nodeId, setNodeId] = useState('NODE_001');

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
                    // Simulate a Node ID based on the user ID for flair
                    if (response?.data?.id) {
                        setNodeId(`NODE_${String(response.data.id).padStart(3, '0')}`);
                    }
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
            return [{ to: '/', label: 'System Home', icon: Home }];
        }

        const common = [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/scan', label: 'Neural HUD', icon: ScanEye },
            { to: '/report', label: 'Field Intel', icon: MapPinned },
            { to: '/history', label: 'Audit Logs', icon: Database },
            { to: '/leaderboard', label: 'Tier List', icon: Trophy },
            { to: '/profile', label: 'Identity', icon: UserCircle2 },
        ];

        if (!isAdmin) return common;

        return [
            { to: '/admin/dashboard', label: 'Command Center', icon: BarChart3 },
            { to: '/admin/users', label: 'Node Operators', icon: Users },
            { to: '/admin/reports', label: 'Field Audits', icon: ShieldCheck },
            { to: '/admin/scans', label: 'Neural Validation', icon: ScanEye },
            { to: '/admin/content', label: 'Directives', icon: FileText },
            { to: '/admin/logs', label: 'System Logs', icon: ClipboardList },
            { to: '/admin/settings', label: 'Core Config', icon: Settings },
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
                        <Icon size={14} /> {item.label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <header className="top-nav border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
            <div className="top-nav-inner px-6 max-w-[1600px]">
                <div className="flex items-center gap-6">
                    <button 
                        className="brand-link group" 
                        onClick={() => {
                            if (!isAuthenticated) navigate('/');
                            else if (isAdmin) navigate('/admin/dashboard');
                            else navigate('/dashboard');
                        }}
                    >
                        <span className="brand-mark bg-white/5 p-1 rounded-xl group-hover:scale-110 transition-transform">
                            <img src="/ecobin-mark.svg" alt="EcoBin logo" className="h-10 w-10" />
                        </span>
                        <span className="brand-copy">
                            <span className="brand-name text-xl font-black tracking-tighter text-white">EcoBin</span>
                            <span className="brand-meta text-[10px] font-bold text-slate-400">Scan. Score. Streak.</span>
                        </span>
                    </button>

                    {isAuthenticated && (
                        <div className="hidden md:flex items-center gap-3 px-4 border-l border-white/10 ml-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{nodeId}</span>
                        </div>
                    )}
                </div>

                <nav className="nav-links hidden lg:flex items-center gap-1" aria-label="Primary">
                    {renderNavLinks()}
                </nav>

                {!isAuthenticated ? (
                    <div className="nav-actions hidden md:inline-flex items-center gap-4">
                        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login Portal</Link>
                        <Link to="/signup" className="btn-primary py-3 px-6 text-[10px] shadow-lg shadow-blue-500/20">Node Initialization</Link>
                    </div>
                ) : (
                    <div className="nav-actions hidden md:inline-flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <Activity size={12} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live</span>
                        </div>
                        {isAdmin ? <span className="badge warning bg-amber-500/10 border-amber-500/20 text-amber-500 text-[9px]">Admin Node</span> : null}
                        <button className="btn-danger p-2.5 rounded-xl bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" onClick={handleLogout} title="Terminate Session">
                            <LogOut size={16} />
                        </button>
                    </div>
                )}

                <button
                    className="nav-toggle lg:hidden p-3 rounded-xl bg-white/5"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <div className={`nav-mobile ${mobileOpen ? 'open' : ''} bg-slate-950/95 backdrop-blur-2xl border-t border-white/5`}>
                {isAuthenticated && isAdmin ? (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <span className="badge warning w-full text-center py-2">Admin Control Node</span>
                    </div>
                ) : null}

                <div className="stack-sm">{renderNavLinks()}</div>

                {!isAuthenticated ? (
                    <div className="nav-actions mt-8 grid w-full gap-3">
                        <Link to="/login" className="btn-ghost py-4 text-center">Login Portal</Link>
                        <Link to="/signup" className="btn-primary py-4 text-center">Node Initialization</Link>
                    </div>
                ) : (
                    <div className="nav-actions mt-8 w-full">
                        <button className="btn-danger w-full py-4 flex items-center justify-center gap-2" onClick={handleLogout}>
                            <LogOut size={16} /> Terminate Session
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;

