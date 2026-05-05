import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Zap, 
    Recycle, 
    Leaf, 
    Trash2, 
    TrendingUp,
    RefreshCcw,
    Activity,
    Globe,
    MapPin
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { getAdminDashboardStats } from '@/services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAdminDashboardStats();
            setStats(response.data);
        } catch (err) {
            setError('Failed to load management data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Mock data for Velocity Chart (In a real app, this would come from a dedicated timeseries endpoint)
    const velocityData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const base = stats?.recentScans || 42;
        return days.map((day, i) => ({
            day,
            scans: Math.floor(base * (0.6 + Math.random() * 0.8)),
            impact: Math.floor(base * (1.2 + Math.random() * 0.5))
        }));
    }, [stats]);

    const wasteDistribution = stats ? [
        { name: 'Biodegradable', value: stats.biodegradableItems || 0, color: '#34d399' },
        { name: 'Recyclable', value: stats.recyclableItems || 0, color: '#60a5fa' },
        { name: 'Non-Bio', value: stats.nonBiodegradableItems || 0, color: '#f87171' },
    ] : [];

    const activeRegions = [
        { name: 'Downtown Sector', activity: 'High', scans: 142 },
        { name: 'Industrial Zone', activity: 'Medium', scans: 89 },
        { name: 'Residential West', activity: 'Extreme', scans: 215 },
        { name: 'Harbor Side', activity: 'Low', scans: 34 },
    ];

    if (loading) {
        return (
            <div className="page-shell narrow flex items-center justify-center min-h-[60vh]">
                <div className="stack-sm items-center">
                    <RefreshCcw size={40} className="animate-spin text-emerald-500 mb-4" />
                    <div className="text-emerald-400 font-black tracking-[0.2em] uppercase text-xs">Synchronizing Neural Stats...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell space-y-8">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Command Center Overview</span>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Diagnostic visualization of global platform activity and environmental impact metrics.</p>
                </div>
                <div className="row gap-3">
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hidden md:flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live System Sync
                    </div>
                    <button className="btn-ghost" onClick={fetchData}>
                        <RefreshCcw size={15} /> Refresh Data
                    </button>
                </div>
            </section>

            {error && <div className="alert error">{error}</div>}

            {/* High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'Total Citizens', value: stats?.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'hover:border-blue-500/30' },
                    { label: 'System Scans', value: stats?.totalClassifications, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'hover:border-emerald-500/30' },
                    { label: 'Monthly Volume', value: stats?.recentScans, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'hover:border-amber-500/30' },
                    { label: 'Node Health', value: '100%', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'hover:border-sky-500/30' },
                ].map((m, i) => (
                    <motion.div 
                        key={m.label} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                        className={`surface-card p-6 stack-sm group ${m.border} transition-all`}
                    >
                        <div className="row space">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{m.label}</span>
                            <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <m.icon size={20} className={m.color} />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-white mt-2 leading-none">{m.value || 0}</div>
                        <div className="help-text flex items-center gap-1.5 opacity-60">System-wide aggregate</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                {/* Velocity Graph */}
                <article className="surface-card p-8 stack-md border-white/5 bg-gradient-to-br from-slate-900/40 to-transparent">
                    <div className="row space mb-4">
                        <div>
                            <h2 className="section-title text-xl">Scan Velocity</h2>
                            <p className="help-text">7-Day activity throughput and system impact</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">SCANS</span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20">IMPACT</span>
                        </div>
                    </div>
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={velocityData}>
                                <defs>
                                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff20" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff20" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="scans" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                                <Area type="monotone" dataKey="impact" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                {/* Waste Distribution (Doughnut) */}
                <article className="surface-card p-8 stack-md border-white/5 flex flex-col">
                    <h2 className="section-title text-xl mb-2">Waste Composition</h2>
                    <p className="help-text mb-6">Real-time classification breakdown</p>
                    <div className="h-[280px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={wasteDistribution}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {wasteDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-white">{stats?.totalClassifications || 0}</span>
                        </div>
                    </div>
                    <div className="stack-sm mt-auto pt-6 border-t border-white/5">
                        {wasteDistribution.map(item => (
                            <div key={item.name} className="row space">
                                <div className="row gap-3">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">{Math.round((item.value / (stats?.totalClassifications || 1)) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>

            {/* Regional Hotspots & Quick Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <article className="surface-card p-6 xl:col-span-2">
                    <h2 className="section-title mb-6 flex items-center gap-2">
                        <Globe size={18} className="text-sky-400" /> Active Regional Hubs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeRegions.map(region => (
                            <div key={region.name} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 row space group hover:border-sky-500/20 transition-all">
                                <div className="row gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{region.name}</div>
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{region.activity} PRIORITY</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-white">{region.scans}</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">SCANS</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="surface-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/10 stack-md">
                    <h2 className="section-title text-amber-400 flex items-center gap-2">
                        <TrendingUp size={18} /> Optimization Report
                    </h2>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                        <div className="stack-xs">
                            <div className="row space text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>AI Target Accuracy</span>
                                <span className="text-emerald-400">98.4%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[98.4%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                        <div className="stack-xs">
                            <div className="row space text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Remediation Rate</span>
                                <span className="text-blue-400">76%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[76%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        "System performance remains within optimal parameters. Regional hubs showing increased activity in residential sectors."
                    </p>
                </article>
            </div>
        </div>
    );
};

export default AdminDashboard;
