import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getUserStats, getRecentActivity, logout } from '@/services/api';
import { Award, TrendingUp, Camera, LogOut, History, Leaf, Globe } from 'lucide-react';

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
    const deduped = [];
    const seen = new Set();

    for (const item of (items || [])) {
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
        .slice(0, 8);
};

const cardBase = {
    borderRadius: '1rem',
    padding: '1.25rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(180deg, rgba(30,41,59,0.75), rgba(15,23,42,0.7))',
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const questTarget = 3;

    const safeStats = stats || { totalPoints: 0, currentStreak: 0 };

    const todayTextScanCount = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return (recentActivity || []).filter((item) => {
            if (!item?.createdAt) return false;
            const createdAt = new Date(item.createdAt);
            return !Number.isNaN(createdAt.getTime()) && createdAt >= startOfToday;
        }).length;
    }, [recentActivity]);

    const questProgressPercent = Math.min(100, (todayTextScanCount / questTarget) * 100);
    const level = Math.floor((safeStats.totalPoints || 0) / 100) + 1;
    const toNextLevel = 100 - ((safeStats.totalPoints || 0) % 100);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [statsResult, activityResult] = await Promise.allSettled([
                getUserStats(),
                getRecentActivity(),
            ]);

            if (statsResult.status === 'fulfilled') {
                setStats(statsResult.value?.data || null);
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

        fetchData();
    }, []);

    useEffect(() => {
        const handleLocalScanSaved = () => {
            const localActivity = readLocalScanActivity();
            setRecentActivity((prev) => sortAndLimitActivity([...(prev || []), ...localActivity]));
        };

        window.addEventListener('ecobin-scan-saved', handleLocalScanSaved);
        return () => {
            window.removeEventListener('ecobin-scan-saved', handleLocalScanSaved);
        };
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#10b981', fontSize: '1.2rem' }}>Loading dashboard...</div>
            </div>
        );
    }

    const badgeItems = [
        { name: 'Starter', unlocked: true },
        { name: 'Streak', unlocked: safeStats.currentStreak >= 3 },
        { name: 'Pro', unlocked: safeStats.totalPoints >= 500 },
        { name: 'Master', unlocked: safeStats.totalPoints >= 1000 },
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginBottom: '1.25rem',
                        ...cardBase,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        background: 'linear-gradient(120deg, rgba(16,185,129,0.16), rgba(30,41,59,0.75) 45%, rgba(59,130,246,0.16))'
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Dashboard</h1>
                        <p style={{ color: '#94a3b8' }}>Track text classifications, progress, and impact in one place.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(15,23,42,0.8)',
                            border: '1px solid #334155',
                            color: '#cbd5e1',
                            padding: '0.55rem 0.9rem',
                            borderRadius: '0.6rem'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ ...cardBase }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Points</div>
                            <div style={{ background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.45)', borderRadius: '0.55rem', padding: '0.45rem' }}>
                                <Award size={18} color="#10b981" />
                            </div>
                        </div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981' }}>{safeStats.totalPoints || 0}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.35rem' }}>Points from text classification and reporting</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...cardBase }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Current Streak</div>
                            <div style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.45)', borderRadius: '0.55rem', padding: '0.45rem' }}>
                                <TrendingUp size={18} color="#3b82f6" />
                            </div>
                        </div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#60a5fa' }}>{safeStats.currentStreak || 0}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.35rem' }}>Daily consistency keeps streak alive</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ ...cardBase }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.8rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', padding: '0.45rem' }}><Camera size={18} /></div>
                            <h3 style={{ fontSize: '1.08rem', fontWeight: 700 }}>Quick Actions</h3>
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <Link to="/scan"><button className="btn-primary" style={{ width: '100%' }}>Open Text Classification</button></Link>
                            <Link to="/report"><button style={{ width: '100%', background: 'transparent', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '0.55rem', padding: '0.65rem 0.8rem' }}>Report Road Waste</button></Link>
                            <Link to="/history"><button style={{ width: '100%', background: 'transparent', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '0.55rem', padding: '0.65rem 0.8rem' }}>Open Full History</button></Link>
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...cardBase }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Level Progress</h3>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>Lv {level}</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.55rem' }}>
                            <div style={{ width: `${(safeStats.totalPoints || 0) % 100}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#3b82f6)' }} />
                        </div>
                        <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.82rem' }}>{toNextLevel} points to next level</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ ...cardBase }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem' }}>Achievement Badges</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '0.55rem' }}>
                            {badgeItems.map((badge) => (
                                <div key={badge.name} style={{
                                    textAlign: 'center',
                                    padding: '0.55rem 0.3rem',
                                    borderRadius: '0.6rem',
                                    border: badge.unlocked ? '1px solid rgba(16,185,129,0.45)' : '1px solid rgba(148,163,184,0.2)',
                                    background: badge.unlocked ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.06)',
                                    color: badge.unlocked ? '#10b981' : '#94a3b8',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {badge.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...cardBase, background: 'linear-gradient(110deg, rgba(16,185,129,0.14), rgba(30,41,59,0.7) 55%, rgba(59,130,246,0.08))' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={18} color="#10b981" /> Environmental Impact
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.7rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.04)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{((safeStats.totalPoints || 0) * 0.05).toFixed(1)} kg</div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>CO2 Saved</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.7rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.04)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Math.floor((safeStats.totalPoints || 0) / 500)}</div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Trees Equivalent</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ ...cardBase, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f59e0b' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={18} color="#f59e0b" /> Daily Quest
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.65rem' }}>Submit {questTarget} text classifications today.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ flex: 1, height: '9px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${questProgressPercent}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{todayTextScanCount}/{questTarget}</span>
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ ...cardBase, background: 'linear-gradient(120deg, rgba(16,185,129,0.14), rgba(30,41,59,0.75))' }}>
                        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.55rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Leaf size={18} /> Daily Inspiration
                        </h3>
                        <blockquote style={{ lineHeight: 1.5, color: '#e2e8f0', fontStyle: 'italic' }}>
                            "The greatest threat to our planet is the belief that someone else will save it."
                        </blockquote>
                        <div style={{ marginTop: '0.5rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.82rem' }}>Robert Swan</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ ...cardBase }}>
                        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.55rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Globe size={18} /> Did You Know?
                        </h3>
                        <p style={{ lineHeight: 1.6, color: '#e2e8f0' }}>
                            Recycling one aluminum can saves enough energy to run a TV for about 3 hours.
                        </p>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={19} /> Recent Text Classifications
                    </h2>

                    <div className="glass" style={{ borderRadius: '1rem', padding: '1rem' }}>
                        {recentActivity.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                                {recentActivity.map((item, index) => (
                                    <div key={item.id || index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.75rem',
                                        borderRadius: '0.7rem',
                                        background: 'rgba(15,23,42,0.45)',
                                        border: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                            <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: '0.55rem', background: '#334155', overflow: 'hidden', flexShrink: 0 }}>
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="waste" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Camera size={15} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                    {item.textDescription || item.categoryType || item.aiPrediction || 'Unknown Item'}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                                                    {item.matchedKeyword ? ` | Rule: ${item.matchedKeyword}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ color: '#10b981', fontWeight: 800 }}>+{item.pointsAwarded ?? item.points ?? 0} pts</div>
                                            <div style={{ fontSize: '0.72rem', marginTop: '0.18rem', padding: '0.18rem 0.5rem', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#93c5fd' }}>
                                                {item.categoryType || item.status || 'TEXT_SCAN'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.7rem', color: '#94a3b8' }}>
                                No text classifications yet. Open <Link to="/scan" style={{ color: '#10b981', fontWeight: 700 }}>Scan</Link> and submit your first item.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
