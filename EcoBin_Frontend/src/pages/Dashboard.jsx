import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Award,
    Camera,
    Globe,
    History,
    Leaf,
    LogOut,
    RefreshCcw,
    TrendingUp,
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

    const todayTextScanCount = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return (recentActivity || []).filter((item) => {
            if (!item?.createdAt) return false;
            const created = new Date(item.createdAt);
            return !Number.isNaN(created.getTime()) && created >= start;
        }).length;
    }, [recentActivity]);

    const level = Math.floor((stats.totalPoints || 0) / 100) + 1;
    const nextLevelPoints = 100 - ((stats.totalPoints || 0) % 100 || 0);
    const levelProgress = (stats.totalPoints || 0) % 100;
    const questProgress = Math.min(100, (todayTextScanCount / questTarget) * 100);

    const badgeItems = [
        { name: 'Starter', unlocked: true },
        { name: 'Streak', unlocked: (stats.currentStreak || 0) >= 3 },
        { name: 'Pro', unlocked: (stats.totalPoints || 0) >= 500 },
        { name: 'Master', unlocked: (stats.totalPoints || 0) >= 1000 },
    ];

    if (loading) {
        return (
            <div className="page-shell narrow">
                <div className="surface-card empty-state">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <motion.section
                className="surface-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    marginBottom: '1rem',
                    background: 'linear-gradient(118deg, rgba(34,201,141,0.16), rgba(15,27,52,0.86) 50%, rgba(79,141,255,0.18))',
                }}
            >
                <div className="row space wrap">
                    <div>
                        <h1 className="page-title" style={{ fontSize: '2rem' }}>Dashboard</h1>
                        <p className="page-subtitle">Everything about your points, streaks, quests, and latest text classifications.</p>
                    </div>
                    <div className="row wrap">
                        <button className="btn-ghost" onClick={fetchDashboard}>
                            <RefreshCcw size={15} /> Refresh
                        </button>
                        <button className="btn-danger" onClick={logout}>
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                </div>
            </motion.section>

            <section className="grid-3 page-section">
                <article className="surface-card">
                    <div className="row space" style={{ marginBottom: '0.5rem' }}>
                        <span className="section-note">Total Points</span>
                        <span className="icon-pill"><Award size={16} color="#22c98d" /></span>
                    </div>
                    <div className="stat-value brand">{stats.totalPoints || 0}</div>
                    <p className="help-text">Points from text classification and report actions.</p>
                </article>

                <article className="surface-card">
                    <div className="row space" style={{ marginBottom: '0.5rem' }}>
                        <span className="section-note">Current Streak</span>
                        <span className="icon-pill"><TrendingUp size={16} color="#8ab6ff" /></span>
                    </div>
                    <div className="stat-value accent">{stats.currentStreak || 0} days</div>
                    <p className="help-text">Stay active daily to keep your streak alive.</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title" style={{ marginBottom: '0.6rem' }}>
                        <Camera size={17} /> Quick Actions
                    </h3>
                    <div className="stack-sm">
                        <Link to="/scan" className="btn-primary" style={{ width: '100%' }}>Open Text Classification</Link>
                        <Link to="/report" className="btn-ghost" style={{ width: '100%' }}>Report Road Waste</Link>
                        <Link to="/history" className="btn-ghost" style={{ width: '100%' }}>Open Full History</Link>
                    </div>
                </article>
            </section>

            <section className="grid-2 page-section">
                <article className="surface-card">
                    <div className="row space" style={{ marginBottom: '0.5rem' }}>
                        <h3 className="section-title">Level Progress</h3>
                        <span className="badge brand">Level {level}</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
                    </div>
                    <p className="help-text" style={{ marginTop: '0.45rem', textAlign: 'right' }}>{nextLevelPoints} points to next level</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title" style={{ marginBottom: '0.55rem' }}>Achievement Badges</h3>
                    <div className="grid-4">
                        {badgeItems.map((badge) => (
                            <div
                                key={badge.name}
                                className="metric-chip"
                                style={{
                                    textAlign: 'center',
                                    color: badge.unlocked ? '#7df2c7' : '#8da2ba',
                                    borderColor: badge.unlocked ? 'rgba(34,201,141,0.44)' : 'rgba(148,163,184,0.25)',
                                    background: badge.unlocked ? 'rgba(34,201,141,0.16)' : 'rgba(148,163,184,0.08)',
                                }}
                            >
                                {badge.name}
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="grid-2 page-section">
                <article
                    className="surface-card"
                    style={{ background: 'linear-gradient(115deg, rgba(34,201,141,0.16), rgba(15,27,52,0.85) 52%, rgba(79,141,255,0.14))' }}
                >
                    <h3 className="section-title" style={{ marginBottom: '0.58rem' }}>
                        <Globe size={17} color="#22c98d" /> Environmental Impact
                    </h3>
                    <div className="grid-2">
                        <div className="metric-chip" style={{ textAlign: 'center' }}>
                            <div className="stat-value" style={{ fontSize: '1.55rem' }}>{((stats.totalPoints || 0) * 0.05).toFixed(1)} kg</div>
                            <p className="help-text">CO2 Saved</p>
                        </div>
                        <div className="metric-chip" style={{ textAlign: 'center' }}>
                            <div className="stat-value" style={{ fontSize: '1.55rem' }}>{Math.floor((stats.totalPoints || 0) / 500)}</div>
                            <p className="help-text">Trees Equivalent</p>
                        </div>
                    </div>
                </article>

                <article className="surface-card quest-side">
                    <h3 className="section-title" style={{ marginBottom: '0.45rem' }}>
                        <Award size={17} color="#f59e0b" /> Daily Quest
                    </h3>
                    <p className="section-note" style={{ marginBottom: '0.58rem' }}>Submit {questTarget} text classifications today.</p>
                    <div className="row">
                        <div className="progress-track" style={{ height: '9px' }}>
                            <div className="progress-fill" style={{ width: `${questProgress}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }} />
                        </div>
                        <span className="badge warning">{todayTextScanCount}/{questTarget}</span>
                    </div>
                </article>
            </section>

            <section className="grid-2 page-section">
                <article className="surface-card" style={{ background: 'linear-gradient(120deg, rgba(34,201,141,0.15), rgba(15,27,52,0.8))' }}>
                    <h3 className="section-title" style={{ color: '#7df2c7', marginBottom: '0.45rem' }}>
                        <Leaf size={17} /> Daily Inspiration
                    </h3>
                    <blockquote style={{ fontStyle: 'italic', color: '#e8f1fb' }}>
                        "The greatest threat to our planet is the belief that someone else will save it."
                    </blockquote>
                    <p className="help-text" style={{ marginTop: '0.4rem', textAlign: 'right' }}>Robert Swan</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title" style={{ color: '#9fc4ff', marginBottom: '0.45rem' }}>
                        <Globe size={17} /> Did You Know?
                    </h3>
                    <p style={{ color: '#e8f1fb' }}>
                        Recycling one aluminum can saves enough energy to run a TV for around 3 hours.
                    </p>
                </article>
            </section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title"><History size={18} /> Recent Activity</h2>
                        <p className="section-note">Latest scans are merged from server and local fallback to avoid missing entries.</p>
                    </div>
                    <Link to="/history" className="btn-ghost">Open Full History</Link>
                </div>

                <div className="surface-card">
                    {recentActivity.length === 0 ? (
                        <div className="empty-state">
                            No text classifications yet. Visit <Link to="/scan" className="quick-link">Scan</Link> to submit your first item.
                        </div>
                    ) : (
                        <div className="stack-sm">
                            {recentActivity.map((item, index) => (
                                <div key={item.id || index} className="activity-row">
                                    <div className="activity-main">
                                        <div className="activity-thumb">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="waste" />
                                            ) : (
                                                <Camera size={14} color="#c8d5e4" />
                                            )}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h4>{item.textDescription || item.categoryType || item.aiPrediction || 'Unknown Item'}</h4>
                                            <p>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                                                {item.matchedKeyword ? ` | Rule: ${item.matchedKeyword}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ color: '#7df2c7', fontWeight: 800 }}>+{item.pointsAwarded ?? item.points ?? 0} pts</div>
                                        <div className="badge accent" style={{ marginTop: '0.18rem' }}>{item.categoryType || item.status || 'TEXT_SCAN'}</div>
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
