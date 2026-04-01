import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    exportMyReportsCsv,
    exportMyScansCsv,
    getCategories,
    getMyReports,
    getMyScans,
} from '@/services/api';
import { Download, Filter, History as HistoryIcon } from 'lucide-react';

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
    const raw = String(value).replace(/"/g, '""');
    return `"${raw}"`;
};

const exportLocalScansCsv = (rows) => {
    const header = 'id,createdAt,categoryType,textDescription,matchedKeyword,rulePriority,pointsAwarded,imageUrl\n';
    const body = rows.map((row) => [
        toCsvValue(row.id),
        toCsvValue(row.createdAt),
        toCsvValue(row.categoryType),
        toCsvValue(row.textDescription),
        toCsvValue(row.matchedKeyword),
        toCsvValue(row.rulePriority),
        toCsvValue(row.pointsAwarded),
        toCsvValue(row.imageUrl),
    ].join(',')).join('\n');
    return `${header}${body}\n`;
};

const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};

const History = () => {
    const [activeTab, setActiveTab] = useState('scans');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [categories, setCategories] = useState([]);

    const [filters, setFilters] = useState({
        categoryType: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const filterLocalScans = (rows) => {
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        return (rows || []).filter((row) => {
            const categoryOk = !filters.categoryType || row?.categoryType === filters.categoryType;
            const created = row?.createdAt ? new Date(row.createdAt) : null;
            const fromOk = !fromDate || (created && created >= fromDate);
            const toOk = !toDate || (created && created <= toDate);
            return categoryOk && fromOk && toOk;
        }).sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    };

    const setFilter = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const buildFilterParams = () => {
        const params = {};
        if (filters.categoryType) params.categoryType = filters.categoryType;
        if (filters.status) params.status = filters.status;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        return params;
    };

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const params = buildFilterParams();
            const response = activeTab === 'scans'
                ? await getMyScans(params)
                : await getMyReports(params);
            setRecords(response?.data || []);
        } catch (err) {
            if (activeTab === 'scans') {
                const localScans = filterLocalScans(readLocalScanActivity());
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response?.data || []);
            } catch (err) {
                // optional data, do nothing
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleExport = async () => {
        try {
            const params = buildFilterParams();
            const response = activeTab === 'scans'
                ? await exportMyScansCsv(params)
                : await exportMyReportsCsv(params);

            downloadBlob(
                response.data,
                activeTab === 'scans' ? 'my_scans.csv' : 'my_reports.csv'
            );
        } catch (err) {
            if (activeTab === 'scans') {
                const localScans = filterLocalScans(readLocalScanActivity());
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

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1rem' }}
                >
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <HistoryIcon size={28} /> My History
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Filter your scans and reports, then export records as CSV.</p>
                </motion.div>

                <div className="glass" style={{ borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('scans')}
                            style={{
                                borderRadius: '0.5rem',
                                padding: '0.55rem 1rem',
                                border: '1px solid #334155',
                                background: activeTab === 'scans' ? '#1d4ed8' : 'transparent',
                                color: '#fff'
                            }}
                        >
                            My Scans
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            style={{
                                borderRadius: '0.5rem',
                                padding: '0.55rem 1rem',
                                border: '1px solid #334155',
                                background: activeTab === 'reports' ? '#1d4ed8' : 'transparent',
                                color: '#fff'
                            }}
                        >
                            My Reports
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#94a3b8', fontSize: '0.85rem' }}>Category</label>
                            <select
                                value={filters.categoryType}
                                onChange={(e) => setFilter('categoryType', e.target.value)}
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            >
                                <option value="">All</option>
                                <option value="Biodegradable">Biodegradable</option>
                                <option value="Recyclable">Recyclable</option>
                                <option value="Non-Biodegradable">Non-Biodegradable</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.categoryType}>
                                        {cat.categoryType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {activeTab === 'reports' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#94a3b8', fontSize: '0.85rem' }}>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilter('status', e.target.value)}
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                                >
                                    <option value="">All</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="APPROVED">APPROVED</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="REJECTED">REJECTED</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#94a3b8', fontSize: '0.85rem' }}>From</label>
                            <input
                                type="datetime-local"
                                value={filters.dateFrom}
                                onChange={(e) => setFilter('dateFrom', e.target.value)}
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', color: '#94a3b8', fontSize: '0.85rem' }}>To</label>
                            <input
                                type="datetime-local"
                                value={filters.dateTo}
                                onChange={(e) => setFilter('dateTo', e.target.value)}
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.7rem' }}>
                        <button
                            onClick={fetchData}
                            style={{ borderRadius: '0.5rem', padding: '0.55rem 0.9rem', border: '1px solid #334155', background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <Filter size={15} /> Apply Filters
                        </button>
                        <button
                            onClick={handleExport}
                            style={{ borderRadius: '0.5rem', padding: '0.55rem 0.9rem', border: '1px solid #334155', background: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <Download size={15} /> Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca' }}>
                        {error}
                    </div>
                )}

                <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '1.5rem', color: '#10b981', textAlign: 'center' }}>Loading records...</div>
                    ) : records.length === 0 ? (
                        <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>No records found for current filters.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(15,23,42,0.8)', color: '#94a3b8', textAlign: 'left' }}>
                                        <th style={{ padding: '0.8rem' }}>Date</th>
                                        <th style={{ padding: '0.8rem' }}>Category</th>
                                        <th style={{ padding: '0.8rem' }}>Description</th>
                                        {activeTab === 'reports' && <th style={{ padding: '0.8rem' }}>Status</th>}
                                        {activeTab === 'scans' && <th style={{ padding: '0.8rem' }}>Matched Rule</th>}
                                        <th style={{ padding: '0.8rem' }}>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((row) => (
                                        <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.8rem' }}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'}</td>
                                            <td style={{ padding: '0.8rem' }}>
                                                {activeTab === 'reports'
                                                    ? (row.category?.categoryType || 'Unknown')
                                                    : (row.categoryType || 'Unknown')}
                                            </td>
                                            <td style={{ padding: '0.8rem' }}>
                                                {activeTab === 'reports'
                                                    ? (row.textDescription || '-')
                                                    : (row.textDescription || '-')}
                                            </td>
                                            {activeTab === 'reports' && <td style={{ padding: '0.8rem' }}>{row.status || '-'}</td>}
                                            {activeTab === 'scans' && <td style={{ padding: '0.8rem' }}>{row.matchedKeyword || '-'}</td>}
                                            <td style={{ padding: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                                                +{activeTab === 'reports' ? (row.points || 0) : (row.pointsAwarded || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
