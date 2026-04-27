import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Zap, 
    Recycle, 
    Leaf, 
    Trash2, 
    TrendingUp,
    RefreshCcw
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
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
            setError('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="page-shell narrow flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-emerald-400 font-bold">Loading Management Data...</div>
            </div>
        );
    }

    const pieData = stats ? [
        { name: 'Recyclable', value: stats.recyclableItems, color: '#60a5fa' },
        { name: 'Biodegradable', value: stats.biodegradableItems, color: '#34d399' },
        { name: 'Non-Biodegradable', value: stats.nonBiodegradableItems, color: '#f87171' },
    ] : [];

    const barData = stats ? [
        { name: 'Total Users', count: stats.totalUsers },
        { name: 'Total Scans', count: stats.totalClassifications },
        { name: 'Recent (30d)', count: stats.recentScans },
    ] : [];

    return (
        <div className="page-shell space-y-8">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">System Overview</span>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Real-time analytics and system health metrics for EcoBin.</p>
                </div>
                <button className="btn-ghost" onClick={fetchData}>
                    <RefreshCcw size={15} /> Refresh Data
                </button>
            </section>

            {error && <div className="alert error">{error}</div>}

            {/* Metric Grid */}
            <div className="grid-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6 stack-sm">
                    <div className="row space">
                        <span className="text-slate-400 text-sm font-medium">Total Users</span>
                        <div className="icon-pill bg-blue-500/10"><Users size={18} className="text-blue-400" /></div>
                    </div>
                    <div className="text-3xl font-black text-slate-100">{stats?.totalUsers || 0}</div>
                    <div className="help-text">Registered eco-warriors</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-6 stack-sm">
                    <div className="row space">
                        <span className="text-slate-400 text-sm font-medium">AI Classifications</span>
                        <div className="icon-pill bg-emerald-500/10"><Zap size={18} className="text-emerald-400" /></div>
                    </div>
                    <div className="text-3xl font-black text-slate-100">{stats?.totalClassifications || 0}</div>
                    <div className="help-text">Items sorted by AI</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card p-6 stack-sm border-emerald-500/20">
                    <div className="row space">
                        <span className="text-slate-400 text-sm font-medium">Growth Index</span>
                        <div className="icon-pill bg-amber-500/10"><TrendingUp size={18} className="text-amber-400" /></div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400">{stats?.recentScans || 0}</div>
                    <div className="help-text">Scans in last 30 days</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-card p-6 stack-sm">
                    <div className="row space">
                        <span className="text-slate-400 text-sm font-medium">Bin Status</span>
                        <div className="badge brand">Active</div>
                    </div>
                    <div className="text-3xl font-black text-slate-100">100%</div>
                    <div className="help-text">AI Model online</div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid-2 gap-6">
                <article className="surface-card p-6 stack-md">
                    <h2 className="section-title">Waste Distribution</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {pieData.map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-slate-400">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="surface-card p-6 stack-md">
                    <h2 className="section-title">Platform Activity</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    <Cell fill="#60a5fa" />
                                    <Cell fill="#34d399" />
                                    <Cell fill="#fbbf24" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>
            </div>

            {/* Quick Summary Cards */}
            <section className="grid-3">
                <div className="surface-card p-5 row gap-4 bg-blue-500/5 border-blue-500/10">
                    <div className="icon-pill bg-blue-500/20"><Recycle className="text-blue-400" /></div>
                    <div>
                        <div className="text-xl font-bold text-slate-100">{stats?.recyclableItems || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Recyclable</div>
                    </div>
                </div>
                <div className="surface-card p-5 row gap-4 bg-emerald-500/5 border-emerald-500/10">
                    <div className="icon-pill bg-emerald-500/20"><Leaf className="text-emerald-400" /></div>
                    <div>
                        <div className="text-xl font-bold text-slate-100">{stats?.biodegradableItems || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Biodegradable</div>
                    </div>
                </div>
                <div className="surface-card p-5 row gap-4 bg-red-500/5 border-red-500/10">
                    <div className="icon-pill bg-red-500/20"><Trash2 className="text-red-400" /></div>
                    <div>
                        <div className="text-xl font-bold text-slate-100">{stats?.nonBiodegradableItems || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Non-Biodegradable</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
