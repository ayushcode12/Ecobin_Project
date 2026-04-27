import React, { useEffect, useState } from 'react';
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
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        {activeTab === 'reports' && <th>Status</th>}
                                        {activeTab === 'scans' && <th>Matched Rule</th>}
                                        <th>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((row) => {
                                        const points = activeTab === 'reports' ? (row.points || 0) : (row.pointsAwarded || 0);
                                        const category = activeTab === 'reports'
                                            ? (row.category?.categoryType || 'Unknown')
                                            : (row.categoryType || 'Unknown');

                                        return (
                                            <tr key={row.id}>
                                                <td>{formatDate(row.createdAt)}</td>
                                                <td>{category}</td>
                                                <td>{row.textDescription || '-'}</td>
                                                {activeTab === 'reports' && <td><span className={`status-chip ${getStatusClass(row.status)}`}>{row.status || 'UNKNOWN'}</span></td>}
                                                {activeTab === 'scans' && <td>{row.matchedKeyword || '-'}</td>}
                                                <td className="font-bold text-emerald-200">+{points}</td>
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
