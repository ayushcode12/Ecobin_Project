import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Shield, 
    Trophy, 
    Flame, 
    Camera, 
    Edit2, 
    Check, 
    Lock,
    Award,
    Star
} from 'lucide-react';
import { getCurrentUser, getUserStats, updateMyProfileName } from '@/services/api';

const BADGES = [
  { id: 'early_adopter', name: 'First Sort', desc: 'Completed your first AI scan', icon: Award, color: 'text-blue-400', threshold: 1 },
  { id: 'streak_3', name: 'Hot Streak', desc: 'Maintained activity for 3 days', icon: Flame, color: 'text-orange-500', threshold: 3 },
  { id: 'xp_100', name: 'Eco Novice', desc: 'Earned 100 total XP', icon: Star, color: 'text-emerald-400', threshold: 100 },
  { id: 'xp_500', name: 'Green Master', desc: 'Earned 500 total XP', icon: Trophy, color: 'text-amber-400', threshold: 500 },
  { id: 'reports_5', name: 'Street Guardian', desc: 'Reported 5 waste issues', icon: Shield, color: 'text-purple-400', threshold: 5 }
];

const Profile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [uRes, sRes] = await Promise.all([getCurrentUser(), getUserStats()]);
            setUser(uRes.data);
            setStats(sRes.data);
            setNewName(uRes.data.name);
        } catch (err) {
            console.error('Failed to load profile data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.name) {
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        try {
            await updateMyProfileName(newName);
            setUser({ ...user, name: newName });
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update name');
        } finally {
            setUpdating(false);
        }
    };

    const getLevel = (xp) => Math.floor(xp / 100) + 1;
    const getProgress = (xp) => xp % 100;

    if (loading) return (
        <div className="page-shell narrow flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10" />
                <div className="h-4 w-48 rounded bg-white/5" />
            </div>
        </div>
    );

    return (
        <div className="page-shell narrow space-y-8">
            {/* Hero Profile Card */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card p-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User size={200} />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-emerald-500/20">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-amber-400 shadow-lg">
                            <Trophy size={18} />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            className="input-control py-1 px-3 text-xl font-black w-48"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateName} disabled={updating} className="text-emerald-400 hover:text-emerald-300">
                                            <Check size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-black text-white">{user.name}</h1>
                                        <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-medium">
                                <Mail size={14} /> {user.email}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} /> {user.role?.replace('ROLE_', '')}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <Award size={12} /> LEVEL {getLevel(stats?.totalPoints || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total XP', value: stats?.totalPoints || 0, icon: Star, color: 'text-amber-400' },
                    { label: 'Neural Scans', value: stats?.totalClassifications || 0, icon: Camera, color: 'text-blue-400' },
                    { label: 'Current Streak', value: stats?.streakDays || 0, icon: Flame, color: 'text-orange-500' }
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div 
                            key={s.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="surface-card p-6 flex items-center gap-4 border-white/5"
                        >
                            <div className={`h-12 w-12 rounded-2xl bg-white/[0.03] flex items-center justify-center ${s.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{s.label}</div>
                                <div className="text-2xl font-black text-white">{s.value}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Achievement Showroom */}
            <section className="space-y-4">
                <div className="row space">
                    <h2 className="section-title">Achievement Showroom</h2>
                    <span className="badge accent">Trophies & Badges</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BADGES.map((badge, i) => {
                        const isUnlocked = (
                            (badge.id.includes('xp') && (stats?.totalPoints || 0) >= badge.threshold) ||
                            (badge.id.includes('early') && (stats?.totalClassifications || 0) >= badge.threshold) ||
                            (badge.id.includes('streak') && (stats?.streakDays || 0) >= badge.threshold)
                        );
                        const Icon = badge.icon;
                        
                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`surface-card p-5 flex items-center gap-4 transition-all duration-500 ${
                                    isUnlocked ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'opacity-40 grayscale'
                                }`}
                            >
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center relative ${
                                    isUnlocked ? 'bg-white/5 ' + badge.color : 'bg-white/5 text-slate-600'
                                }`}>
                                    <Icon size={28} />
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                                            <Lock size={16} className="text-slate-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-sm font-black uppercase tracking-wide ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                                            {badge.name}
                                        </span>
                                        {isUnlocked && <Check size={14} className="text-emerald-400" />}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{badge.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Profile;
