import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    exportMyReportsCsv,
    exportMyScansCsv,
    getCategories,
    getMyReports,
    getMyScans,
} from '@/services/api';
import { Download, Filter, History as HistoryIcon, RotateCcw, Database, ShieldCheck, Activity, Search } from 'lucide-react';

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

const toCsvValue = (value) => {
    if (value === null || value === undefined) return '""';
    return `"${String(value).replace(/"/g, '""')}"`;
};

const exportLocalScansCsv = (rows) => {
    const header = 'id,createdAt,categoryType,textDescription,matchedKeyword,rulePriority,pointsAwarded,imageUrl\n';
    const body = rows
        .map((row) => [
            toCsvValue(row.id),
            toCsvValue(row.createdAt),
            toCsvValue(row.categoryType),
            toCsvValue(row.textDescription),
            toCsvValue(row.matchedKeyword),
            toCsvValue(row.rulePriority),
            toCsvValue(row.pointsAwarded),
            toCsvValue(row.imageUrl),
        ].join(','))
        .join('\n');

    return `${header}${body}\n`;
};

const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
};

const History = () => {
    const [activeTab, setActiveTab] = useState('scans');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return records;
        return records.filter(r => 
            (r.textDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (r.categoryType?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (r.category?.categoryType?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [records, searchQuery]);

    const stats = useMemo(() => {
        const totalPoints = records.reduce((acc, curr) => acc + (activeTab === 'reports' ? (curr.points || 0) : (curr.pointsAwarded || 0)), 0);
        const categories = {};
        records.forEach(r => {
            const cat = activeTab === 'reports' ? (r.category?.categoryType || 'Unknown') : (r.categoryType || 'Unknown');
            categories[cat] = (categories[cat] || 0) + 1;
        });
        return { totalPoints, totalCount: records.length, categories };
    }, [records, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const response = activeTab === 'scans'
                ? await getMyScans()
                : await getMyReports();
            setRecords(response?.data || []);
        } catch (err) {
            if (activeTab === 'scans') {
                const localScans = readLocalScanActivity();
                if (localScans.length > 0) {
                    setRecords(localScans);
                    setError('Displaying locally cached history data.');
                } else {
                    setError('Failed to retrieve history from EcoBin server.');
                }
            } else {
                setError('Failed to retrieve history from EcoBin server.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = activeTab === 'scans'
                ? await exportMyScansCsv()
                : await exportMyReportsCsv();

            downloadBlob(response.data, activeTab === 'scans' ? 'my_scans.csv' : 'my_reports.csv');
        } catch (err) {
            if (activeTab === 'scans') {
                const localScans = readLocalScanActivity();
                if (localScans.length > 0) {
                    const csvText = exportLocalScansCsv(localScans);
                    const blob = new Blob([csvText], { type: 'text/csv' });
                    downloadBlob(blob, 'my_scans_local.csv');
                    return;
                }
            }
            setError('Data export failed.');
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const formatDate = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
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

    return (
        <div className="page-shell space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="section-kicker mb-4 border-blue-500/20 bg-blue-500/10 text-blue-300">Activity History</span>
                    <h1 className="page-title text-4xl font-black">My History</h1>
                    <p className="text-slate-500 text-sm mt-2">Comprehensive tracking for environmental scans and field reports.</p>
                </div>
                <div className="min-w-[320px]">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            className="input-control pl-12 py-4 bg-white/5 border-white/10" 
                            placeholder="Identify specific log entry..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.article className="surface-card p-8 bg-emerald-500/[0.03] border-emerald-500/10 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aggregated Impact</span>
                    <div className="text-4xl font-black text-emerald-400">+{stats.totalPoints} <span className="text-xs text-slate-500">XP</span></div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Validated Points</span>
                    </div>
                </motion.article>

                <motion.article className="surface-card p-8 bg-blue-500/[0.03] border-blue-500/10 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Count</span>
                    <div className="text-4xl font-black text-white">{stats.totalCount} <span className="text-xs text-slate-500">ENTRIES</span></div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-blue-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total EcoBin Activity</span>
                    </div>
                </motion.article>

                <motion.article className="surface-card p-8 bg-amber-500/[0.03] border-amber-500/10 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Anomaly Type</span>
                    <div className="text-xl font-black text-slate-100 truncate">
                        {Object.entries(stats.categories).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Database size={14} className="text-amber-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Primary Data Point</span>
                    </div>
                </motion.article>
            </section>

            <section className="surface-card p-1 bg-white/5 border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex p-1 gap-1">
                    <button className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scans' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('scans')}>My Scans</button>
                    <button className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setActiveTab('reports')}>My Reports</button>
                </div>
                <div className="flex items-center gap-2 pr-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 p-3" onClick={fetchData}><RotateCcw size={14} /> Refetch</button>
                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 p-3" onClick={handleExport}><Download size={14} /> Export CSV</button>
                </div>
            </section>

            {error && <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-bold">{error}</div>}

            <section className="surface-card overflow-hidden bg-slate-950/40 border-white/5">
                {loading ? (
                    <div className="p-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">Synchronizing node data...</div>
                ) : records.length === 0 ? (
                    <div className="p-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">No telemetry records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Diagnostic Narrative</th>
                                    {activeTab === 'reports' && <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Cycle Status</th>}
                                    {activeTab === 'scans' && <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Matched Logic</th>}
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">XP Yield</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((row) => {
                                    const points = activeTab === 'reports' ? (row.points || 0) : (row.pointsAwarded || 0);
                                    const category = activeTab === 'reports'
                                        ? (row.category?.categoryType || 'Unknown')
                                        : (row.categoryType || 'Unknown');

                                    return (
                                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6 text-[11px] font-mono text-slate-400">{formatDate(row.createdAt)}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${category === 'Biodegradable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : category === 'Recyclable' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                    {category}
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm text-slate-300 max-w-[240px] truncate">{row.textDescription || '-'}</td>
                                            {activeTab === 'reports' && (
                                                <td className="p-6">
                                                    <span className={`status-chip ${getStatusClass(row.status)}`}>{row.status || 'UNKNOWN'}</span>
                                                </td>
                                            )}
                                            {activeTab === 'scans' && <td className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.matchedKeyword || '-'}</td>}
                                            <td className="p-6 text-right font-black text-emerald-400 text-lg group-hover:scale-110 transition-transform">+{points}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default History;

