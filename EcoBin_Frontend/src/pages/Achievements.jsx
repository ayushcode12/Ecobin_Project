import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Award, 
    Trophy, 
    Zap, 
    Flame, 
    Leaf, 
    ShieldCheck, 
    Sparkles, 
    Camera, 
    Activity,
    Star,
    Crown,
    Lock,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { getUserStats } from '@/services/api';

const ACHIEVEMENT_CATEGORIES = [
    { id: 'all', label: 'All Badges', icon: Star },
    { id: 'streaks', label: 'Consistency', icon: Flame },
    { id: 'impact', label: 'Impact', icon: Leaf },
    { id: 'activity', label: 'Field Ops', icon: Camera },
];

const MILESTONES = [
    { 
        id: 'streak_1', 
        category: 'streaks', 
        title: 'Seed Runner', 
        note: 'Complete your first diagnostic scan cycle.', 
        requirement: '1 Day Streak', 
        icon: Leaf, 
        days: 1,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    },
    { 
        id: 'streak_3', 
        category: 'streaks', 
        title: 'Bronze Flame', 
        note: 'Three consecutive days of environmental auditing.', 
        requirement: '3 Day Streak', 
        icon: Flame, 
        days: 3,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },
    { 
        id: 'streak_7', 
        category: 'streaks', 
        title: 'Silver Pulse', 
        note: 'Maintaining node activity for an entire week.', 
        requirement: '7 Day Streak', 
        icon: Zap, 
        days: 7,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    { 
        id: 'streak_14', 
        category: 'streaks', 
        title: 'Gold Charge', 
        note: 'Two-week commitment to the EcoBin protocol.', 
        requirement: '14 Day Streak', 
        icon: Award, 
        days: 14,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20'
    },
    { 
        id: 'streak_30', 
        category: 'streaks', 
        title: 'Eco Legend', 
        note: 'Mastering the art of sustainable consistency.', 
        requirement: '30 Day Streak', 
        icon: Trophy, 
        days: 30,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
    },
    { 
        id: 'scans_50', 
        category: 'activity', 
        title: 'Neural Sentinel', 
        note: 'Processed over 50 unique waste signatures.', 
        requirement: '50 Total Scans', 
        icon: Camera, 
        scans: 50,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20'
    },
    { 
        id: 'impact_1000', 
        category: 'impact', 
        title: 'Carbon Neutralizer', 
        note: 'Ranked in the top tier of regional impact scores.', 
        requirement: '1,000 XP Earned', 
        icon: ShieldCheck, 
        points: 1000,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    },
    { 
        id: 'tree_5', 
        category: 'impact', 
        title: 'Forest Guardian', 
        note: 'Contributed to the planting of 5 real-world trees.', 
        requirement: '5 Trees Planted', 
        icon: Crown, 
        trees: 5,
        color: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    }
];

const Achievements = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getUserStats();
                setStats(response?.data || null);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const filteredMilestones = useMemo(() => {
        if (activeCategory === 'all') return MILESTONES;
        return MILESTONES.filter(m => m.category === activeCategory);
    }, [activeCategory]);

    const checkUnlocked = (m) => {
        if (!stats) return false;
        if (m.days !== undefined) return (stats.currentStreak || 0) >= m.days;
        if (m.scans !== undefined) return (stats.totalScans || 0) >= m.scans;
        if (m.points !== undefined) return (stats.totalPoints || 0) >= m.points;
        if (m.trees !== undefined) return (stats.treesPlanted || 0) >= m.trees;
        return false;
    };

    const unlockedCount = useMemo(() => {
        return MILESTONES.filter(m => checkUnlocked(m)).length;
    }, [stats]);

    return (
        <div className="page-shell space-y-10">
            {/* Header Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft size={14} /> Back to HUD
                    </button>
                    <span className="section-kicker mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Identity Hall of Fame</span>
                    <h1 className="page-title text-5xl font-black tracking-tight">Achievements</h1>
                    <p className="text-slate-400 text-lg mt-4 max-w-2xl leading-relaxed">
                        Track your evolution from a Citizen Node to an Eco Legend. Every scan contributes to your global environmental legacy.
                    </p>
                </div>

                <div className="surface-card p-6 bg-emerald-500/5 border-emerald-500/10 flex items-center gap-6">
                    <div className="stack-xs">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Unlocks</div>
                        <div className="text-4xl font-black text-emerald-400">{unlockedCount}<span className="text-slate-600">/</span>{MILESTONES.length}</div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/5" />
                    <div className="stack-xs">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Global Rank</div>
                        <div className="text-4xl font-black text-white">#14</div>
                    </div>
                </div>
            </section>

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-3">
                {ACHIEVEMENT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                isActive 
                                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            <Icon size={14} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMilestones.map((milestone, index) => {
                    const Icon = milestone.icon;
                    const isUnlocked = checkUnlocked(milestone);
                    
                    return (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`surface-card p-8 group relative overflow-hidden transition-all duration-500 ${
                                isUnlocked 
                                ? `${milestone.bg} ${milestone.border} border-opacity-50` 
                                : 'bg-slate-900/40 border-white/5 opacity-60 grayscale'
                            }`}
                        >
                            {/* Decorative Background Glow */}
                            {isUnlocked && (
                                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 blur-3xl transition-transform duration-700 group-hover:scale-150 ${milestone.bg}`} />
                            )}

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:rotate-6 ${
                                        isUnlocked 
                                        ? `${milestone.bg} ${milestone.border} ${milestone.color}` 
                                        : 'bg-white/5 border-white/10 text-slate-600'
                                    }`}>
                                        {isUnlocked ? <Icon size={32} /> : <Lock size={28} />}
                                    </div>
                                    {isUnlocked && (
                                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                            <CheckCircle2 size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className={`text-xl font-black tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                        {milestone.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {milestone.note}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Target</div>
                                    <div className={`text-sm font-black ${isUnlocked ? milestone.color : 'text-slate-600'}`}>
                                        {milestone.requirement}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Impact Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                <article className="surface-card p-10 bg-gradient-to-br from-blue-600/10 to-emerald-600/5 border-white/5 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Activity size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Audit Accuracy</h2>
                            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Neural Matching Performance</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Model Confidence</span>
                                <span className="text-blue-400">98.4% Avg.</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                    initial={{ width: 0 }}
                                    animate={{ width: '98.4%' }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Successful Syncs</div>
                                <div className="text-xl font-black text-white">{stats?.totalScans || 0}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Contribution</div>
                                <div className="text-xl font-black text-emerald-400">{stats?.totalPoints || 0} XP</div>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="surface-card p-10 bg-gradient-to-br from-emerald-600/10 to-blue-600/5 border-white/5 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Next Milestone</h2>
                            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Projective Growth</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Trophy size={40} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-white">Eco Master</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                You are {100 - (stats?.treeProgressPercent || 0)}% away from your next environmental impact reward.
                            </p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${stats?.treeProgressPercent || 0}%` }} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/scan')}
                        className="btn-primary w-full py-5 text-lg shadow-xl shadow-emerald-500/20"
                    >
                        Accelerate Progress
                    </button>
                </article>
            </section>
        </div>
    );
};

export default Achievements;
