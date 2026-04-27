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
    Sparkles,
    Trophy,
    User,
    Zap,
} from 'lucide-react';
import { getCurrentUser, getMyReports, getRecentActivity, getUserStats, updateMyProfileName } from '@/services/api';

const LOCAL_SCAN_ACTIVITY_KEY = 'ecobin_local_scan_activity';

const STREAK_MILESTONES = [
    { days: 1, title: 'Seed Runner', note: 'Started your streak.', icon: Leaf },
    { days: 3, title: 'Bronze Flame', note: 'Three days in a row.', icon: Flame },
    { days: 7, title: 'Silver Pulse', note: 'One full week active.', icon: Zap },
    { days: 14, title: 'Gold Charge', note: 'Two-week consistency.', icon: Award },
    { days: 30, title: 'Eco Legend', note: 'Thirty-day streak unlocked.', icon: Trophy },
];

const DASHBOARD_ACTIONS = [
    { to: '/scan', title: 'Live Scan', note: 'Open the camera and confirm the category live.', icon: Camera, featured: true },
    { to: '/leaderboard', title: 'Chase Rank', note: 'Check your position and catch the leaders.', icon: Trophy },
    { to: '/history', title: 'Review Runs', note: 'Revisit saved scans, scores, and outcomes.', icon: History },
    { to: '/report', title: 'Report Waste', note: 'Push a field report into the admin queue.', icon: ShieldCheck },
];

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
    const [stats, setStats] = useState({
        totalPoints: 0,
        currentStreak: 0,
        treesPlanted: 0,
        pointsToNextTree: 30,
        treeProgressPercent: 0,
        totalScans: 0,
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileName, setProfileName] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');

    const questTarget = 3;

    const fetchDashboard = async () => {
        setLoading(true);
        const [statsResult, activityResult, reportsResult, userResult] = await Promise.allSettled([
            getUserStats(),
            getRecentActivity(),
            getMyReports({ limit: 10 }),
            getCurrentUser(),
        ]);

        if (statsResult.status === 'fulfilled') {
            setStats({
                totalPoints: statsResult.value?.data?.totalPoints || 0,
                currentStreak: statsResult.value?.data?.currentStreak || 0,
                treesPlanted: statsResult.value?.data?.treesPlanted || 0,
                pointsToNextTree: statsResult.value?.data?.pointsToNextTree ?? 30,
                treeProgressPercent: statsResult.value?.data?.treeProgressPercent || 0,
                totalScans: statsResult.value?.data?.totalScans || 0,
            });
        }

        let combinedActivity = [];
        if (activityResult.status === 'fulfilled') {
            combinedActivity = [...combinedActivity, ...(activityResult.value?.data || [])];
        }
        if (reportsResult.status === 'fulfilled') {
            combinedActivity = [...combinedActivity, ...(reportsResult.value?.data || [])];
        }
        
        const localActivity = readLocalScanActivity();
        setRecentActivity(sortAndLimitActivity([...combinedActivity, ...localActivity]));

        if (userResult.status === 'fulfilled') {
            const nextUser = userResult.value?.data || null;
            setCurrentUser(nextUser);
            setProfileName(nextUser?.name || '');
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
    const remainingQuestScans = Math.max(0, questTarget - todayActivityCount);

    const currentBadge = useMemo(() => {
        const unlocked = STREAK_MILESTONES.filter((badge) => (stats.currentStreak || 0) >= badge.days);
        return unlocked[unlocked.length - 1] || { title: 'Warm Up', note: 'Start your first streak.', icon: Sparkles };
    }, [stats.currentStreak]);

    const unlockedBadgeCount = useMemo(
        () => STREAK_MILESTONES.filter((badge) => (stats.currentStreak || 0) >= badge.days).length,
        [stats.currentStreak],
    );

    const nextBadge = useMemo(
        () => STREAK_MILESTONES.find((badge) => (stats.currentStreak || 0) < badge.days) || null,
        [stats.currentStreak],
    );

    const nextBadgeProgress = useMemo(() => {
        if (!nextBadge) return 100;
        return Math.min(100, ((stats.currentStreak || 0) / nextBadge.days) * 100);
    }, [nextBadge, stats.currentStreak]);

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setProfileError('');
        setProfileMessage('');

        const trimmedName = profileName.trim();
        if (!trimmedName) {
            setProfileError('Please enter a display name.');
            return;
        }

        if (trimmedName === (currentUser?.name || '')) {
            setProfileMessage('Your display name is already up to date.');
            return;
        }

        setProfileSaving(true);
        try {
            const response = await updateMyProfileName(trimmedName);
            setCurrentUser(response?.data || null);
            setProfileName(response?.data?.name || trimmedName);
            setProfileMessage('Display name updated for the leaderboard.');
        } catch (error) {
            setProfileError(error?.response?.data?.message || 'Could not update your display name.');
        } finally {
            setProfileSaving(false);
        }
    };

    const getStatusClass = (statusValue) => {
        const status = String(statusValue || '').toUpperCase();
        if (status === 'PENDING') return 'pending';
        if (status === 'APPROVED') return 'approved';
        if (status === 'IN_PROGRESS') return 'progress';
        if (status === 'COMPLETED') return 'completed';
        if (status === 'REJECTED') return 'rejected';
        return '';
    };

    if (loading) {
        return (
            <div className="page-shell narrow">
                <div className="surface-card empty-state">Loading dashboard...</div>
            </div>
        );
    }

    const CurrentBadgeIcon = currentBadge.icon;

    return (
        <div className="page-shell narrow space-y-6">
            <motion.section
                className="surface-card dashboard-hero"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="dashboard-hero-main">
                    <div>
                        <span className="section-kicker mb-4">Player HUD</span>
                        <h1 className="page-title dashboard-hero-title">{currentUser?.name ? `Welcome back, ${currentUser.name}` : 'Dashboard'}</h1>
                        <p className="page-subtitle dashboard-hero-subtitle">Scan smarter, keep the streak alive, and turn every correct sort into visible progress.</p>
                    </div>

                    <div className="row wrap gap-3">
                        <Link to="/scan" className="btn-primary">
                            Start Live Scan
                            <Camera size={16} />
                        </Link>
                        <Link to="/leaderboard" className="btn-ghost">
                            View Leaderboard
                            <Trophy size={16} />
                        </Link>
                        <button className="btn-soft" onClick={fetchDashboard}>
                            <RefreshCcw size={15} /> Refresh
                        </button>
                    </div>

                    <div className="dashboard-hero-strip">
                        <div className="dashboard-hero-strip-item">
                            <span className="section-note">Current Title</span>
                            <strong>{currentBadge.title}</strong>
                        </div>
                        <div className="dashboard-hero-strip-item">
                            <span className="section-note">Daily Quest</span>
                            <strong>{todayActivityCount}/{questTarget} scans</strong>
                        </div>
                        <div className="dashboard-hero-strip-item">
                            <span className="section-note">Next Tree</span>
                            <strong>{stats.pointsToNextTree === 0 ? 'Unlocked' : `${stats.pointsToNextTree} XP left`}</strong>
                        </div>
                    </div>
                </div>

                <aside className="dashboard-focus-panel">
                    <div className="row space mb-4">
                        <h2 className="section-title"><Sparkles size={18} className="text-amber-300" /> Run Focus</h2>
                        <span className="badge brand">Level {level}</span>
                    </div>

                    <div className="dashboard-focus-badge">
                        <span className="icon-pill">
                            <CurrentBadgeIcon size={18} className="text-emerald-300" />
                        </span>
                        <div>
                            <div className="dashboard-focus-label">Current streak badge</div>
                            <div className="dashboard-focus-title">{currentBadge.title}</div>
                            <div className="help-text mt-1">{currentBadge.note}</div>
                        </div>
                    </div>

                    <div className="stack-sm">
                        <div className="dashboard-progress-card">
                            <div className="row space mb-2">
                                <span className="text-sm font-bold text-slate-100">Today&apos;s momentum</span>
                                <span className="badge warning">{todayActivityCount}/{questTarget}</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${questProgress}%` }} />
                            </div>
                            <div className="help-text mt-2">
                                {remainingQuestScans === 0
                                    ? 'Today is locked in. Keep scanning for extra XP.'
                                    : `${remainingQuestScans} more confirmed scan(s) to complete today’s target.`}
                            </div>
                        </div>

                        <div className="dashboard-progress-card">
                            <div className="row space mb-2">
                                <span className="text-sm font-bold text-slate-100">Next streak unlock</span>
                                <span className={`badge ${nextBadge ? 'accent' : 'brand'}`}>
                                    {nextBadge ? `${nextBadge.days}d` : 'Complete'}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${nextBadgeProgress}%` }} />
                            </div>
                            <div className="help-text mt-2">
                                {nextBadge
                                    ? `${Math.max(0, nextBadge.days - (stats.currentStreak || 0))} more day(s) to unlock ${nextBadge.title}.`
                                    : 'Every streak badge is unlocked. Keep the run alive.'}
                            </div>
                        </div>
                    </div>
                </aside>
            </motion.section>

            <section className="surface-card dashboard-stat-rail">
                <div className="dashboard-stat-rail-grid">
                    <article className="dashboard-stat-pill">
                        <div className="row space mb-3">
                            <span className="section-note">XP</span>
                            <span className="icon-pill"><Award size={16} className="text-emerald-300" /></span>
                        </div>
                        <div className="stat-value brand">{stats.totalPoints || 0}</div>
                        <div className="help-text mt-2">Impact points banked.</div>
                    </article>

                    <article className="dashboard-stat-pill">
                        <div className="row space mb-3">
                            <span className="section-note">Streak</span>
                            <span className="icon-pill"><Flame size={16} className="text-amber-300" /></span>
                        </div>
                        <div className="stat-value accent">{stats.currentStreak || 0}</div>
                        <div className="help-text mt-2">Days in a row.</div>
                    </article>

                    <article className="dashboard-stat-pill">
                        <div className="row space mb-3">
                            <span className="section-note">Trees</span>
                            <span className="icon-pill"><Leaf size={16} className="text-emerald-300" /></span>
                        </div>
                        <div className="stat-value brand">{stats.treesPlanted || 0}</div>
                        <div className="help-text mt-2">Reward trees planted.</div>
                    </article>

                    <article className="dashboard-stat-pill">
                        <div className="row space mb-3">
                            <span className="section-note">Runs</span>
                            <span className="icon-pill"><Camera size={16} className="text-blue-300" /></span>
                        </div>
                        <div className="stat-value accent">{stats.totalScans || 0}</div>
                        <div className="help-text mt-2">Confirmed scans saved.</div>
                    </article>
                </div>
            </section>

            <section className="dashboard-main-grid">
                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><Zap size={18} className="text-emerald-300" /> Mission Board</h2>
                        <span className="badge accent">Daily Run</span>
                    </div>

                    <div className="dashboard-quest-grid">
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
                                <span className="text-sm font-bold text-slate-100">Tree Progress</span>
                                <span className="badge brand">{stats.treesPlanted || 0} planted</span>
                            </div>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.treeProgressPercent || 0}%` }} /></div>
                            <div className="help-text mt-2">
                                {stats.pointsToNextTree === 0
                                    ? 'New tree milestone unlocked. Keep stacking points.'
                                    : `${stats.pointsToNextTree} XP to your next tree reward.`}
                            </div>
                        </div>

                        <div className="metric-chip">
                            <div className="row space mb-2">
                                <span className="text-sm font-bold text-slate-100">Streak Engine</span>
                                <span className="badge warning">{stats.currentStreak || 0}d</span>
                            </div>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${nextBadgeProgress}%` }} /></div>
                            <div className="help-text mt-2">
                                {nextBadge
                                    ? `${Math.max(0, nextBadge.days - (stats.currentStreak || 0))} day(s) left to unlock ${nextBadge.title}.`
                                    : 'Top streak title unlocked. Keep defending it.'}
                            </div>
                        </div>
                    </div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><User size={18} className="text-blue-300" /> Player Profile</h2>
                        <span className="badge warning">{currentBadge.title}</span>
                    </div>

                    <div className="metric-chip dashboard-profile-head mb-4">
                        <div className="row gap-4">
                            <div className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-2xl font-black text-slate-100">
                                {(currentUser?.name || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="text-lg font-black text-slate-100">{currentUser?.name || 'Player'}</div>
                                <div className="help-text truncate">{currentUser?.email || 'No email available'}</div>
                                <div className="help-text mt-1">Leaderboard name and profile identity.</div>
                            </div>
                        </div>
                    </div>

                    {profileError ? <div className="alert error mb-4">{profileError}</div> : null}
                    {profileMessage ? <div className="alert success mb-4">{profileMessage}</div> : null}

                    <form className="dashboard-profile-form" onSubmit={handleProfileSave}>
                        <div className="min-w-0">
                            <label className="form-label">Display Name</label>
                            <input
                                type="text"
                                className="input-control"
                                value={profileName}
                                maxLength={30}
                                onChange={(event) => setProfileName(event.target.value)}
                                placeholder="Enter the name shown on the leaderboard"
                            />
                        </div>

                        <button type="submit" className="btn-primary dashboard-profile-save" disabled={profileSaving}>
                            {profileSaving ? 'Saving...' : 'Save Leaderboard Name'}
                        </button>
                    </form>

                    <div className="dashboard-profile-meta mt-4">
                        <div className="metric-chip">
                            <div className="section-note">Unlocked badges</div>
                            <div className="game-stat-value">{unlockedBadgeCount}/{STREAK_MILESTONES.length}</div>
                            <div className="help-text mt-2">Your streak collection keeps expanding.</div>
                        </div>
                        <div className="metric-chip">
                            <div className="section-note">Next title</div>
                            <div className="game-stat-value">{nextBadge ? nextBadge.title : 'All unlocked'}</div>
                            <div className="help-text mt-2">
                                {nextBadge ? `${nextBadge.days} day target` : 'Nothing left to unlock.'}
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            <section className="dashboard-main-grid">
                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><ShieldCheck size={18} className="text-blue-300" /> Quick Launch</h2>
                        <span className="badge brand">Play</span>
                    </div>

                    <div className="launch-grid">
                        {DASHBOARD_ACTIONS.map((action) => {
                            const ActionIcon = action.icon;

                            return (
                                <Link
                                    key={action.title}
                                    to={action.to}
                                    className={`launch-card ${action.featured ? 'featured' : ''}`}
                                >
                                    <span className="icon-pill"><ActionIcon size={17} className="text-emerald-300" /></span>
                                    <div className="min-w-0">
                                        <div className="launch-card-title">{action.title}</div>
                                        <div className="help-text mt-1">{action.note}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><Sparkles size={18} className="text-amber-300" /> Badge Track</h2>
                        <span className="badge accent">{stats.currentStreak || 0} days</span>
                    </div>

                    <div className="badge-track">
                        {STREAK_MILESTONES.map((badge) => {
                            const Icon = badge.icon;
                            const unlocked = (stats.currentStreak || 0) >= badge.days;
                            const isCurrent = currentBadge.title === badge.title;

                            return (
                                <div
                                    key={badge.title}
                                    className={`streak-mini-card ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                                >
                                    <div className="row space">
                                        <span className="icon-pill"><Icon size={16} className="text-emerald-300" /></span>
                                        <span className={`badge ${unlocked ? 'brand' : 'danger'}`}>{badge.days}d</span>
                                    </div>
                                    <div className="launch-card-title mt-4">{badge.title}</div>
                                    <div className="help-text mt-1">
                                        {isCurrent
                                            ? 'Active title.'
                                            : unlocked
                                                ? 'Unlocked.'
                                                : `${Math.max(0, badge.days - (stats.currentStreak || 0))} day(s) left.`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </article>
            </section>

            <section className="dashboard-main-grid">
                 <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><ShieldCheck size={18} className="text-emerald-300" /> Report Tracking</h2>
                        <Link to="/history" className="badge accent">View All</Link>
                    </div>

                    <div className="stack-sm">
                        {recentActivity.filter(item => item.status).length === 0 ? (
                            <div className="help-text p-4 text-center">No active reports found in your recent activity.</div>
                        ) : (
                            recentActivity.filter(item => item.status).slice(0, 3).map((item, idx) => (
                                <div key={item.id || idx} className="activity-row">
                                    <div className="min-w-0">
                                        <h4 className="truncate">{item.textDescription || 'Report'}</h4>
                                        <p className="text-[10px] uppercase font-bold tracking-widest mt-1">ID: #{item.id}</p>
                                    </div>
                                    <span className={`status-chip ${getStatusClass(item.status)}`}>{item.status}</span>
                                </div>
                            ))
                        )}
                        <p className="help-text mt-2 px-2">Your field reports move through the queue as admins approve and resolve them.</p>
                    </div>
                </article>

                <article className="surface-card">
                    <div className="row space mb-4">
                        <h2 className="section-title"><History size={18} className="text-blue-300" /> History Summary</h2>
                        <span className="badge brand">Recent</span>
                    </div>
                    <div className="stack-sm">
                         <p className="help-text">You have completed <b>{stats.totalScans}</b> scans and <b>{stats.treesPlanted}</b> tree milestones so far.</p>
                         <Link to="/history" className="btn-ghost w-full mt-2">Open Full History Logs</Link>
                    </div>
                </article>
            </section>

            <section className="page-section">
                <div className="section-head">
                    <div>
                        <h2 className="section-title"><Trophy size={18} className="text-emerald-300" /> Recent Runs</h2>
                        <p className="section-note">Latest confirmed scan activity for your profile.</p>
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
