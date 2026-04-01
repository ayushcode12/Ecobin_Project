import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    assignWastePickup,
    getAllWasteRequests,
    getCurrentUser,
    updateWasteRequestStatus
} from '@/services/api';
import { CalendarClock, CheckCircle2, ListTodo, RefreshCcw } from 'lucide-react';

const STATUS_TRANSITIONS = {
    PENDING: ['APPROVED'],
    APPROVED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED', 'REJECTED'],
    COMPLETED: [],
    REJECTED: [],
};

const statusStyleMap = {
    PENDING: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    APPROVED: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    IN_PROGRESS: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    COMPLETED: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
};

const getSelectableStatuses = (currentStatus) => {
    const normalized = currentStatus || 'PENDING';
    const allowed = STATUS_TRANSITIONS[normalized] || [];
    return [normalized, ...allowed];
};

const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const d = new Date(value);
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [pickupDrafts, setPickupDrafts] = useState({});
    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});
    const [proofDrafts, setProofDrafts] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [reports]);

    const mergeReport = (updatedReport) => {
        setReports((prev) => prev.map((report) => (
            report.id === updatedReport.id ? updatedReport : report
        )));
    };

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const meResponse = await getCurrentUser();
            const role = meResponse?.data?.role;

            if (role !== 'ROLE_ADMIN') {
                setIsAdmin(false);
                setError('Admin access is required for this page.');
                setLoading(false);
                return;
            }

            setIsAdmin(true);

            const reportResponse = await getAllWasteRequests();
            const reportData = reportResponse?.data || [];
            setReports(reportData);

            const pickupInitialValues = {};
            const statusInitialValues = {};
            const noteInitialValues = {};
            const proofInitialValues = {};

            reportData.forEach((report) => {
                pickupInitialValues[report.id] = toDateTimeLocalValue(report.pickupDate);
                statusInitialValues[report.id] = report.status || 'PENDING';
                noteInitialValues[report.id] = report.adminNote || '';
                proofInitialValues[report.id] = report.resolutionProofUrl || '';
            });

            setPickupDrafts(pickupInitialValues);
            setStatusDrafts(statusInitialValues);
            setNoteDrafts(noteInitialValues);
            setProofDrafts(proofInitialValues);
        } catch (err) {
            if (err?.response?.status === 401) {
                navigate('/login');
                return;
            }

            if (err?.response?.status === 403) {
                setIsAdmin(false);
                setError('Admin access is required for this page.');
            } else {
                setError('Failed to load reports. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusUpdate = async (reportId) => {
        const payload = {
            status: statusDrafts[reportId],
            adminNote: noteDrafts[reportId],
            resolutionProofUrl: proofDrafts[reportId],
        };

        if (!payload.status) return;

        setUpdatingId(reportId);
        setError('');
        try {
            const response = await updateWasteRequestStatus(reportId, payload);
            mergeReport(response.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not update report status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePickupAssign = async (reportId) => {
        const pickupDate = pickupDrafts[reportId];
        if (!pickupDate) {
            setError('Please select a pickup date before assigning.');
            return;
        }

        setUpdatingId(reportId);
        setError('');
        try {
            const response = await assignWastePickup(reportId, pickupDate);
            mergeReport(response.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not assign pickup date.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#10b981', fontSize: '1.2rem' }}>Loading admin report queue...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass" style={{ maxWidth: '520px', padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '0.75rem' }}>Admin Access Required</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.25rem' }}>{error || 'You do not have permission to open this page.'}</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '1240px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
                >
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <ListTodo size={28} /> Admin Report Queue
                        </h1>
                        <p style={{ color: '#94a3b8' }}>Track field reports, enforce workflow, and close incidents with proof.</p>
                    </div>
                    <button
                        onClick={fetchReports}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1rem',
                            borderRadius: '0.6rem',
                            background: 'transparent',
                            color: '#e2e8f0',
                            border: '1px solid #334155'
                        }}
                    >
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </motion.div>

                {error && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.8rem 1rem',
                        borderRadius: '0.6rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#fecaca',
                        border: '1px solid rgba(239, 68, 68, 0.35)'
                    }}>
                        {error}
                    </div>
                )}

                {sortedReports.length === 0 ? (
                    <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        No reports available right now.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {sortedReports.map((report) => {
                            const statusStyles = statusStyleMap[report.status] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
                            return (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass"
                                    style={{ borderRadius: '1rem', padding: '1rem 1.1rem' }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Report #{report.id}</h3>
                                                <span style={{ background: statusStyles.bg, color: statusStyles.color, padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                                                    {report.status || 'PENDING'}
                                                </span>
                                            </div>

                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Reporter:</strong> {report?.user?.name || 'Unknown'} ({report?.user?.email || 'N/A'})
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Description:</strong> {report?.textDescription || 'No description'}
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Category:</strong> {report?.category?.name || report?.category?.categoryType || 'Not provided'}
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Severity:</strong> {report?.severity || 'MEDIUM'}
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Estimated Quantity:</strong> {report?.estimatedQuantity || 1}
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Address:</strong> {report?.address || 'N/A'}
                                            </p>
                                            <p style={{ color: '#e2e8f0', marginBottom: '0.35rem' }}>
                                                <strong>Coordinates:</strong> {report?.latitude ?? 'N/A'}, {report?.longitude ?? 'N/A'}
                                            </p>
                                            <p style={{ color: '#94a3b8', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                                                <strong>Created:</strong> {formatDate(report.createdAt)}
                                            </p>
                                            <p style={{ color: '#94a3b8', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                                                <strong>Pickup:</strong> {formatDate(report.pickupDate)}
                                            </p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                <strong>Points:</strong> {report.points ?? 0}
                                            </p>

                                            {report?.imageUrl && (
                                                <a
                                                    href={report.imageUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#60a5fa', fontSize: '0.9rem', marginTop: '0.55rem', display: 'inline-block' }}
                                                >
                                                    Open uploaded image
                                                </a>
                                            )}
                                            {report?.resolutionProofUrl && (
                                                <a
                                                    href={report.resolutionProofUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '0.35rem', display: 'inline-block', marginLeft: '0.75rem' }}
                                                >
                                                    Open resolution proof
                                                </a>
                                            )}
                                        </div>

                                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                                                Update Status
                                            </label>
                                            <select
                                                value={statusDrafts[report.id] || report.status || 'PENDING'}
                                                onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '0.55rem',
                                                    background: '#0f172a',
                                                    color: '#f8fafc',
                                                    border: '1px solid #334155',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem'
                                                }}
                                            >
                                                {getSelectableStatuses(report.status).map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>

                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                                                Admin Note
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={noteDrafts[report.id] || ''}
                                                onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                                placeholder="Action notes..."
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '0.55rem',
                                                    background: '#0f172a',
                                                    color: '#f8fafc',
                                                    border: '1px solid #334155',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem'
                                                }}
                                            />

                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                                                Resolution Proof URL
                                            </label>
                                            <input
                                                value={proofDrafts[report.id] || ''}
                                                onChange={(e) => setProofDrafts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                                placeholder="https://..."
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '0.55rem',
                                                    background: '#0f172a',
                                                    color: '#f8fafc',
                                                    border: '1px solid #334155',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem'
                                                }}
                                            />

                                            <button
                                                onClick={() => handleStatusUpdate(report.id)}
                                                disabled={updatingId === report.id}
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '1rem',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.55rem',
                                                    background: '#1d4ed8',
                                                    color: '#fff',
                                                    border: 'none'
                                                }}
                                            >
                                                {updatingId === report.id ? 'Updating...' : 'Apply Status'}
                                            </button>

                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                                                Assign Pickup
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={pickupDrafts[report.id] || ''}
                                                onChange={(e) => setPickupDrafts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '0.55rem',
                                                    background: '#0f172a',
                                                    color: '#f8fafc',
                                                    border: '1px solid #334155',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem'
                                                }}
                                            />
                                            <button
                                                onClick={() => handlePickupAssign(report.id)}
                                                disabled={updatingId === report.id}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.55rem',
                                                    background: '#0f766e',
                                                    color: '#fff',
                                                    border: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem'
                                                }}
                                            >
                                                {updatingId === report.id ? 'Saving...' : (
                                                    <>
                                                        <CalendarClock size={15} />
                                                        Assign Pickup
                                                    </>
                                                )}
                                            </button>

                                            {report.status === 'COMPLETED' && (
                                                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#22c55e', fontSize: '0.85rem' }}>
                                                    <CheckCircle2 size={14} /> Marked completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
