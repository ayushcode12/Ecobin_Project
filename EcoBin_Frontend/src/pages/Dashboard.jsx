import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Award,
    Camera,
    Flame,
    History,
    Leaf,
    LogOut,
    RefreshCcw,
    ShieldCheck,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import { getRecentActivity, getUserStats, logout } from '@/services/api';

const LOCAL_SCAN_ACTIVITY_KEY = 'ecobin_local_scan_activity';

const readLocalScanActivity = () => {
    try {
        const raw = localStorage.getItem(LOCAL_SCAN_ACTIVITY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        try {
            localStorage.setItem(LOCAL_SCAN_ACTIVITY_KEY, '[]');
        } catch (_) {
            // ignore storage write errors
        }
        return [];
    }
};

const sortAndLimitActivity = (items) => {
    const seen = new Set();
    const deduped = [];

    for (const item of items || []) {
        const key = item?.id
            ? String(item.id)
            : `${item?.createdAt || ''}|${item?.textDescription || ''}|${item?.pointsAwarded || item?.points || 0}`;

        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(item);
    }

    return deduped
        .sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, 10);
};

const Dashboard = () => {
    const [stats, setStats] = useState({ totalPoints: 0, currentStreak: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const questTarget = 3;

    const fetchDashboard = async () => {
        setLoading(true);
        const [statsResult, activityResult] = await Promise.allSettled([
            getUserStats(),
            getRecentActivity(),
        ]);

        if (statsResult.status === 'fulfilled') {
            setStats(statsResult.value?.data || { totalPoints: 0, currentStreak: 0 });
        } else {
            setStats({ totalPoints: 0, currentStreak: 0 });
        }

        if (activityResult.status === 'fulfilled') {
            const serverActivity = activityResult.value?.data || [];
            const localActivity = readLocalScanActivity();
            setRecentActivity(sortAndLimitActivity([...serverActivity, ...localActivity]));
        } else {
            setRecentActivity(sortAndLimitActivity(readLocalScanActivity()));
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        const handleLocalScanSaved = () => {
            const localActivity = readLocalScanActivity();
            setRecentActivity((prev) => sortAndLimitActivity([...(prev || []), ...localActivity]));
        };

        window.addEventListener('ecobin-scan-saved', handleLocalScanSaved);
        return () => window.removeEventListener('ecobin-scan-saved', handleLocalScanSaved);
    }, []);

    const todayActivityCount = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return (recentActivity || []).filter((item) => {
            if (!item?.createdAt) return false;
            const created = new Date(item.createdAt);
            return !Number.isNaN(created.getTime()) && created >= start;
        }).length;
    }, [recentActivity]);

    const level = Math.floor((stats.totalPoints || 0) / 100) + 1;
    const levelProgress = (stats.totalPoints || 0) % 100;
    const nextLevelPoints = 100 - ((stats.totalPoints || 0) % 100 || 0);
    const questProgress = Math.min(100, (todayActivityCount / questTarget) * 100);

    const badgeItems = [
        { name: 'Starter', unlocked: true },
        { name: 'Streak', unlocked: (stats.currentStreak || 0) >= 3 },
        { name: 'Pro', unlocked: (stats.totalPoints || 0) >= 500 },
        { name: 'Master', unlocked: (stats.totalPoints || 0) >= 1000 },
    ];

    const unlockedBadges = badgeItems.filter((badge) => badge.unlocked).length;

    if (loading) {
        return (
            <div className="page-shell narrow">
                <div className="surface-card empty-state">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="page-shell narrow space-y-6">
            <motion.section
                className="surface-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="row wrap space gap-4">
                    <div>
                        <span className="section-kicker mb-4">Player HUD</span>
                        <h1 className="page-title text-[2rem]">Dashboard</h1>
                        <p className="page-subtitle">Your points, streak, mission progress, and recent runs.</p>
                    </div>

                    <div className="row wrap gap-2">
                        <span className="badge brand">Level {level}</span>
                        <span className="badge warning">{stats.currentStreak || 0}-day streak</span>
                        <Link to="/scan" className="btn-primary">Play Scan Mode</Link>
                        <button className="btn-ghost" onClick={fetchDashboard}><RefreshCcw size={15} /> Refresh</button>
                        <button className="btn-danger" onClick={logout}><LogOut size={15} /> Logout</button>
                    </div>
                </div>
            </motion.section>

            <section className="grid-4">
                <article className="surface-card">
                    <div className="row space mb-3">
                        <span className="section-note">XP</span>
                        <span className="icon-pill"><Award size={16} className="text-emerald-300" /></span>
                    </div>
                    <div className="stat-value brand">{stats.totalPoints || 0}</div>
                    <div className="help-text mt-2">Total points banked.</div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-3">
                        <span className="section-note">Streak</span>
                        <span className="icon-pill"><Flame size={16} className="text-amber-300" /></span>
                    </div>
                    <div className="stat-value accent">{stats.currentStreak || 0}</div>
                    <div className="help-text mt-2">Days in a row.</div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-3">
                        <span className="section-note">Today</span>
                        <span className="icon-pill"><Camera size={16} className="text-blue-300" /></span>
                    </div>
                    <div className="stat-value accent">{todayActivityCount}</div>
                    <div className="help-text mt-2">Actions completed today.</div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-3">
                        <span className="section-note">Badges</span>
                        <span className="icon-pill"><Trophy size={16} className="text-emerald-300" /></span>
                    </div>
                    <div className="stat-value brand">{unlockedBadges}</div>
                    <div className="help-text mt-2">Unlocked right now.</div>
                </article>
            </section>

            <section className="grid-2">
                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><Zap size={18} className="text-emerald-300" /> Mission Board</h2>
                        <span className="badge accent">Daily Run</span>
                    </div>

                    <div className="stack-md">
                        <div className="metric-chip">
                            <div className="row space mb-2">
                                <span className="text-sm font-bold text-slate-100">Level Progress</span>
                                <span className="badge brand">Level {level}</span>
                            </div>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${levelProgress}%` }} /></div>
                            <div className="help-text mt-2">{nextLevelPoints} XP to the next level.</div>
                        </div>

                        <div className="metric-chip">
                            <div className="row space mb-2">
                                <span className="text-sm font-bold text-slate-100">Daily Quest</span>
                                <span className="badge warning">{todayActivityCount}/{questTarget}</span>
                            </div>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${questProgress}%` }} /></div>
                            <div className="help-text mt-2">Hit today&apos;s target to protect your momentum.</div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="metric-chip">
                                <div className="game-stat-label">Next Reward</div>
                                <div className="game-stat-value">{nextLevelPoints} XP</div>
                            </div>
                            <div className="metric-chip">
                                <div className="game-stat-label">Runs Logged</div>
                                <div className="game-stat-value">{recentActivity.length}</div>
                            </div>
                            <div className="metric-chip">
                                <div className="game-stat-label">Status</div>
                                <div className="game-stat-value">{stats.currentStreak >= 3 ? 'Hot Streak' : 'Warm Up'}</div>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><ShieldCheck size={18} className="text-blue-300" /> Quick Launch</h2>
                        <span className="badge brand">Play</span>
                    </div>

                    <div className="stack-sm">
                        <Link to="/scan" className="btn-primary w-full justify-between">
                            Live Scan
                            <Camera size={16} />
                        </Link>
                        <Link to="/report" className="btn-secondary w-full justify-between">
                            Report Waste
                            <Leaf size={16} />
                        </Link>
                        <Link to="/history" className="btn-ghost w-full justify-between">
                            Open History
                            <History size={16} />
                        </Link>
                        <Link to="/leaderboard" className="btn-ghost w-full justify-between">
                            View Leaderboard
                            <Trophy size={16} />
                        </Link>
                    </div>

                    <div className="mt-5">
                        <div className="section-note mb-3">Unlocked Titles</div>
                        <div className="row wrap">
                            {badgeItems.map((badge) => (
                                <span
                                    key={badge.name}
                                    className={`badge ${badge.unlocked ? 'brand' : 'danger'}`}
                                >
                                    {badge.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>
            </section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title"><TrendingUp size={18} className="text-emerald-300" /> Recent Runs</h2>
                        <p className="section-note">Latest confirmed scan and report activity.</p>
                    </div>
                    <Link to="/history" className="btn-ghost">Full History</Link>
                </div>

                <div className="surface-card">
                    {recentActivity.length === 0 ? (
                        <div className="empty-state">
                            No activity yet. Visit <Link to="/scan" className="quick-link">Scan</Link> to start your first run.
                        </div>
                    ) : (
                        <div className="stack-sm">
                            {recentActivity.map((item, index) => (
                                <div key={item.id || index} className="activity-row">
                                    <div className="activity-main">
                                        <div className="activity-thumb">
                                            {item.imageUrl ? <img src={item.imageUrl} alt="waste" /> : <Camera size={14} className="text-slate-300" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4>{item.textDescription || item.categoryType || item.aiPrediction || 'Unknown Item'}</h4>
                                            <p>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                                                {item.matchedKeyword ? ` | Rule: ${item.matchedKeyword}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="font-black text-emerald-200">+{item.pointsAwarded ?? item.points ?? 0} pts</div>
                                        <div className="badge accent mt-1">{item.categoryType || item.status || 'SCAN'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
