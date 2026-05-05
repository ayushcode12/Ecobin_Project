import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    exportMyReportsCsv,
    exportMyScansCsv,
    getCategories,
    getMyReports,
    getMyScans,
} from '@/services/api';
import { Download, Filter, History as HistoryIcon, RotateCcw } from 'lucide-react';

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

const defaultFilters = {
    categoryType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
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
                    setError('Showing local scan history because server scan history is unavailable.');
                } else {
                    setError('Failed to load history.');
                }
            } else {
                setError('Failed to load history.');
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
                    downloadBlob(blob, 'my_scans.csv');
                    setError('Exported local scan history because server export is unavailable.');
                    return;
                }
            }
            setError('Export failed. Please try again.');
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
        <div className="page-shell">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Records, Filters, Export</span>
                    <h1 className="page-title"><HistoryIcon size={30} className="mr-2 inline-block align-middle" />My History</h1>
                    <p className="page-subtitle">Review confirmed scans and waste reports, filter them cleanly, and export your activity for presentation or review.</p>
                </div>
                <div className="min-w-[280px]">
                    <div className="input-icon-wrap">
                        <Filter size={16} className="input-icon" />
                        <input 
                            type="text" 
                            className="input-control" 
                            placeholder="Search description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* History Overview Section */}
            <section className="grid-3 page-section">
                <article className="surface-card p-5 stack-sm">
                    <span className="section-note uppercase tracking-widest text-[10px]">Total Contribution</span>
                    <div className="text-3xl font-black text-emerald-400">+{stats.totalPoints} <span className="text-xs text-slate-500">XP</span></div>
                    <p className="help-text">Accumulated impact points.</p>
                </article>
                <article className="surface-card p-5 stack-sm">
                    <span className="section-note uppercase tracking-widest text-[10px]">Activity Count</span>
                    <div className="text-3xl font-black text-white">{stats.totalCount} <span className="text-xs text-slate-500">{activeTab.toUpperCase()}</span></div>
                    <p className="help-text">Total entries in your log.</p>
                </article>
                <article className="surface-card p-5 stack-sm">
                    <span className="section-note uppercase tracking-widest text-[10px]">Primary Category</span>
                    <div className="text-xl font-black text-slate-100 truncate">
                        {Object.entries(stats.categories).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}
                    </div>
                    <p className="help-text">Most frequent item type.</p>
                </article>
            </section>

            <section className="surface-card page-section">
                <div className="row wrap space mb-4">
                    <div className="pill-tabs">
                        <button className={`pill-tab ${activeTab === 'scans' ? 'active' : ''}`} onClick={() => setActiveTab('scans')}>My Scans</button>
                        <button className={`pill-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>My Reports</button>
                    </div>
                    <div className="row wrap">
                        <button className="btn-ghost" onClick={fetchData}><RotateCcw size={15} /> Refresh List</button>
                        <button className="btn-secondary" onClick={handleExport}><Download size={15} /> Export CSV</button>
                    </div>
                </div>
            </section>

            {error && <div className="alert info page-section">{error}</div>}

            <section className="surface-card page-section">
                {loading ? (
                    <div className="empty-state">Loading records...</div>
                ) : records.length === 0 ? (
                    <div className="empty-state">No records found for the current filters.</div>
                ) : (
                    <div className="table-shell">
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="pl-6">Date</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        {activeTab === 'reports' && <th>Status</th>}
                                        {activeTab === 'scans' && <th>Matched Rule</th>}
                                        <th className="pr-6 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((row) => {
                                        const points = activeTab === 'reports' ? (row.points || 0) : (row.pointsAwarded || 0);
                                        const category = activeTab === 'reports'
                                            ? (row.category?.categoryType || 'Unknown')
                                            : (row.categoryType || 'Unknown');

                                        return (
                                            <tr key={row.id}>
                                                <td className="pl-6">{formatDate(row.createdAt)}</td>
                                                <td><span className={`badge ${category === 'Biodegradable' ? 'brand' : category === 'Recyclable' ? 'accent' : 'soft'}`}>{category}</span></td>
                                                <td className="max-w-[200px] truncate">{row.textDescription || '-'}</td>
                                                {activeTab === 'reports' && <td><span className={`status-chip ${getStatusClass(row.status)}`}>{row.status || 'UNKNOWN'}</span></td>}
                                                {activeTab === 'scans' && <td>{row.matchedKeyword || '-'}</td>}
                                                <td className="pr-6 text-right font-black text-emerald-400">+{points}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default History;
