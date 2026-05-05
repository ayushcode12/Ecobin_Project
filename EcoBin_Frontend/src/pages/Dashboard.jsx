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
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';
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
                        <span className="section-kicker mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">EcoBin Profile: Active</span>
                        <h1 className="page-title dashboard-hero-title text-5xl font-black">{currentUser?.name ? `${currentUser.name}` : 'EcoBin Dashboard'}</h1>
                        <p className="page-subtitle dashboard-hero-subtitle text-slate-400 text-lg mt-4">Monitoring real-time environmental impact and personalized waste management performance.</p>
                    </div>

                    <div className="row wrap gap-4 mt-8">
                        <Link to="/scan" className="btn-primary py-4 px-8 shadow-xl shadow-blue-500/20">
                            Initialize Neural Scan
                            <Camera size={18} />
                        </Link>
                        <Link to="/leaderboard" className="btn-ghost border-white/10 bg-white/5 hover:bg-white/10 py-4 px-8">
                            Node Rankings
                            <Trophy size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 p-6 rounded-3xl bg-black/40 border border-white/5">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Protocol</span>
                            <div className="text-sm font-black text-slate-200">{currentBadge.title}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diagnostic Cycle</span>
                            <div className="text-sm font-black text-slate-200">{todayActivityCount}/{questTarget} Audits</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Milestone</span>
                            <div className="text-sm font-black text-emerald-400">{stats.pointsToNextTree === 0 ? 'READY' : `${stats.pointsToNextTree} XP REQUIRED`}</div>
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

                    <article className="dashboard-stat-pill">
                        <div className="row space mb-3">
                            <span className="section-note">Impact</span>
                            <span className="icon-pill"><Leaf size={16} className="text-emerald-300" /></span>
                        </div>
                        <div className="stat-value brand">{(stats.totalPoints * 0.12).toFixed(1)}kg</div>
                        <div className="help-text mt-2">Estimated CO₂ Offset.</div>
                    </article>
                </div>
            </section>

            {/* Daily Eco-Tip Section */}
            <section className="surface-card eco-tip-card">
                <div className="row gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-amber-200 uppercase tracking-widest">Eco Tip of the Day</h4>
                        <p className="help-text mt-1 text-slate-100">
                            {(() => {
                                const tips = [
                                    "Removing plastic bottle caps helps sorting machines process them faster.",
                                    "Composting food waste reduces methane emissions from landfills.",
                                    "Rinsing food containers prevents contamination in recycling bins.",
                                    "E-waste contains precious metals that can be recovered through proper disposal.",
                                    "Using reusable bags can save up to 500 plastic bags per year!"
                                ];
                                const today = new Date().getDate() % tips.length;
                                return tips[today];
                            })()}
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Community Challenge Section */}
            <motion.section 
                className="surface-card community-goal-card p-8 bg-blue-500/5 border-blue-500/10"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="row space mb-6">
                    <div className="stack-xs">
                        <h2 className="section-title text-blue-300 flex items-center gap-2">
                            <Sparkles size={18} /> EcoBin Community Progress
                        </h2>
                        <p className="help-text">Collective impact tracking for the EcoBin community.</p>
                    </div>
                    <div className="badge warning border-amber-500/30 bg-amber-500/10 text-amber-300">Global Directive</div>
                </div>

                <div className="community-progress-wrap space-y-4">
                    <div className="row space">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly CO₂ Offset Target</span>
                        <span className="text-sm font-black text-emerald-400">74% AGGREGATED</span>
                    </div>
                    <div className="progress-track h-3 bg-white/5">
                        <div className="progress-fill bg-gradient-to-r from-emerald-500 to-blue-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: '74%' }} />
                    </div>
                    <div className="row space pt-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500"><b>3,420kg</b> Offset Processed</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Target: 5,000kg</div>
                    </div>
                </div>
            </motion.section>

            {/* Performance Analytics Section */}
            <section className="dashboard-main-grid">
                <article className="surface-card p-6">
                    <div className="row space mb-6">
                        <div className="stack-xs">
                            <h2 className="section-title text-emerald-400">Weekly XP Momentum</h2>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Last 7 Days Performance</p>
                        </div>
                        <div className="badge brand">Trend</div>
                    </div>
                    
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(() => {
                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                const data = days.map(day => ({ name: day, xp: 0 }));
                                recentActivity.forEach(item => {
                                    const date = new Date(item.createdAt);
                                    if (!isNaN(date)) {
                                        const dayName = days[date.getDay()];
                                        const entry = data.find(d => d.name === dayName);
                                        if (entry) entry.xp += (item.pointsAwarded || item.points || 0);
                                    }
                                });
                                return data;
                            })()}>
                                <defs>
                                    <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 900 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="xp" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorXP)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="surface-card p-6">
                    <div className="row space mb-6">
                        <div className="stack-xs">
                            <h2 className="section-title text-blue-400">Waste Allocation</h2>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Category Distribution</p>
                        </div>
                        <div className="badge accent">Neural Data</div>
                    </div>

                    <div className="h-[240px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={(() => {
                                        const counts = {};
                                        recentActivity.forEach(item => {
                                            const cat = item.categoryType || 'Other';
                                            counts[cat] = (counts[cat] || 0) + 1;
                                        });
                                        const finalData = Object.entries(counts).map(([name, value]) => ({ name, value }));
                                        return finalData.length > 0 ? finalData : [{ name: 'No Data', value: 1 }];
                                    })()}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Biodegradable', color: '#10b981' },
                                        { name: 'Recyclable', color: '#3b82f6' },
                                        { name: 'Non-Biodegradable', color: '#64748b' },
                                        { name: 'Hazardous', color: '#ef4444' },
                                        { name: 'Other', color: '#f59e0b' },
                                        { name: 'No Data', color: '#1e293b' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {[
                            { name: 'Bio', color: 'bg-emerald-500' },
                            { name: 'Recycle', color: 'bg-blue-500' },
                            { name: 'Other', color: 'bg-slate-500' }
                        ].map(c => (
                            <div key={c.name} className="flex items-center gap-1.5">
                                <div className={`h-2 w-2 rounded-full ${c.color}`} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </article>
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
                                    className={`streak-mini-card trophy-card ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                                >
                                    <div className="trophy-glow"></div>
                                    <div className="row space relative z-10">
                                        <div className={`trophy-icon-wrap ${unlocked ? 'active' : ''}`}>
                                            <Icon size={20} className={unlocked ? 'text-emerald-300' : 'text-slate-500'} />
                                        </div>
                                        <span className={`badge ${unlocked ? 'brand' : 'soft'}`}>{badge.days}d</span>
                                    </div>
                                    <div className="launch-card-title mt-4 relative z-10">{badge.title}</div>
                                    <div className="help-text mt-1 relative z-10">
                                        {isCurrent
                                            ? 'Currently Active'
                                            : unlocked
                                                ? 'Milestone Unlocked'
                                                : `${Math.max(0, badge.days - (stats.currentStreak || 0))} days to go`}
                                    </div>
                                    {!unlocked && <div className="trophy-lock-overlay"></div>}
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
