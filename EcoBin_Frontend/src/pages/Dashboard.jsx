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
        <div className="page-shell space-y-5">
            <motion.section
                className="surface-card bg-gradient-to-r from-emerald-500/20 via-slate-900/85 to-blue-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="row wrap space">
                    <div>
                        <h1 className="page-title text-[2rem]">Dashboard</h1>
                        <p className="page-subtitle">Everything about your points, streaks, quests, and latest text classifications.</p>
                    </div>
                    <div className="row wrap">
                        <button className="btn-ghost" onClick={fetchDashboard}><RefreshCcw size={15} /> Refresh</button>
                        <button className="btn-danger" onClick={logout}><LogOut size={15} /> Logout</button>
                    </div>
                </div>
            </motion.section>

            <section className="grid-3">
                <article className="surface-card">
                    <div className="row space mb-2">
                        <span className="section-note">Total Points</span>
                        <span className="icon-pill"><Award size={16} className="text-emerald-300" /></span>
                    </div>
                    <div className="stat-value brand">{stats.totalPoints || 0}</div>
                    <p className="help-text">Points from text classification and report actions.</p>
                </article>

                <article className="surface-card">
                    <div className="row space mb-2">
                        <span className="section-note">Current Streak</span>
                        <span className="icon-pill"><TrendingUp size={16} className="text-blue-300" /></span>
                    </div>
                    <div className="stat-value accent">{stats.currentStreak || 0} days</div>
                    <p className="help-text">Stay active daily to keep your streak alive.</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title mb-2"><Camera size={17} /> Quick Actions</h3>
                    <div className="stack-sm">
                        <Link to="/scan" className="btn-primary w-full">Open Text Classification</Link>
                        <Link to="/report" className="btn-ghost w-full">Report Road Waste</Link>
                        <Link to="/history" className="btn-ghost w-full">Open Full History</Link>
                    </div>
                </article>
            </section>

            <section className="grid-2">
                <article className="surface-card">
                    <div className="row space mb-2">
                        <h3 className="section-title">Level Progress</h3>
                        <span className="badge brand">Level {level}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${levelProgress}%` }} /></div>
                    <p className="help-text mt-2 text-right">{nextLevelPoints} points to next level</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title mb-2">Achievement Badges</h3>
                    <div className="grid-4">
                        {badgeItems.map((badge) => (
                            <div
                                key={badge.name}
                                className={`metric-chip text-center ${badge.unlocked ? 'border-emerald-400/45 bg-emerald-400/20 text-emerald-200' : 'border-slate-400/25 bg-slate-400/10 text-slate-400'}`}
                            >
                                {badge.name}
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="grid-2">
                <article className="surface-card bg-gradient-to-r from-emerald-500/20 via-slate-900/85 to-blue-500/15">
                    <h3 className="section-title mb-2"><Globe size={17} className="text-emerald-300" /> Environmental Impact</h3>
                    <div className="grid-2">
                        <div className="metric-chip text-center">
                            <div className="text-3xl font-black">{((stats.totalPoints || 0) * 0.05).toFixed(1)} kg</div>
                            <p className="help-text">CO2 Saved</p>
                        </div>
                        <div className="metric-chip text-center">
                            <div className="text-3xl font-black">{Math.floor((stats.totalPoints || 0) / 500)}</div>
                            <p className="help-text">Trees Equivalent</p>
                        </div>
                    </div>
                </article>

                <article className="surface-card quest-side">
                    <h3 className="section-title mb-2"><Award size={17} className="text-amber-300" /> Daily Quest</h3>
                    <p className="section-note mb-2">Submit {questTarget} text classifications today.</p>
                    <div className="row">
                        <div className="progress-track h-[9px]"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${questProgress}%` }} /></div>
                        <span className="badge warning">{todayTextScanCount}/{questTarget}</span>
                    </div>
                </article>
            </section>

            <section className="grid-2">
                <article className="surface-card bg-gradient-to-r from-emerald-500/20 to-slate-900/80">
                    <h3 className="section-title mb-2 text-emerald-200"><Leaf size={17} /> Daily Inspiration</h3>
                    <blockquote className="italic text-slate-100">"The greatest threat to our planet is the belief that someone else will save it."</blockquote>
                    <p className="help-text mt-2 text-right">Robert Swan</p>
                </article>

                <article className="surface-card">
                    <h3 className="section-title mb-2 text-blue-200"><Globe size={17} /> Did You Know?</h3>
                    <p className="text-slate-100">Recycling one aluminum can saves enough energy to run a TV for around 3 hours.</p>
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
                                        <div className="badge accent mt-1">{item.categoryType || item.status || 'TEXT_SCAN'}</div>
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
