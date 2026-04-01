import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CalendarClock,
    CheckCircle2,
    ListTodo,
    LocateFixed,
    RefreshCcw,
    SendHorizontal,
} from 'lucide-react';
import {
    assignWastePickup,
    getAllWasteRequests,
    getCurrentUser,
    updateWasteRequestStatus,
} from '@/services/api';

const STATUS_TRANSITIONS = {
    PENDING: ['APPROVED'],
    APPROVED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED', 'REJECTED'],
    COMPLETED: [],
    REJECTED: [],
};

const toDateTimeLocalValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const getSelectableStatuses = (currentStatus) => {
    const normalized = currentStatus || 'PENDING';
    const allowed = STATUS_TRANSITIONS[normalized] || [];
    return [normalized, ...allowed];
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

const AdminReports = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});
    const [proofDrafts, setProofDrafts] = useState({});
    const [pickupDrafts, setPickupDrafts] = useState({});

    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [reports]);

    const mergeReport = (updatedReport) => {
        setReports((prev) => prev.map((report) => (
            report.id === updatedReport.id ? updatedReport : report
        )));
    };

    const initializeDrafts = (reportList) => {
        const statusValues = {};
        const noteValues = {};
        const proofValues = {};
        const pickupValues = {};

        reportList.forEach((report) => {
            statusValues[report.id] = report.status || 'PENDING';
            noteValues[report.id] = report.adminNote || '';
            proofValues[report.id] = report.resolutionProofUrl || '';
            pickupValues[report.id] = toDateTimeLocalValue(report.pickupDate);
        });

        setStatusDrafts(statusValues);
        setNoteDrafts(noteValues);
        setProofDrafts(proofValues);
        setPickupDrafts(pickupValues);
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
            const response = await getAllWasteRequests();
            const reportData = response?.data || [];
            setReports(reportData);
            initializeDrafts(reportData);
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

    const handleStatusUpdate = async (report) => {
        const reportId = report.id;
        const nextStatus = statusDrafts[reportId] || report.status || 'PENDING';
        const note = (noteDrafts[reportId] || '').trim();
        const proof = (proofDrafts[reportId] || '').trim();
        const currentStatus = report.status || 'PENDING';

        const allowed = getSelectableStatuses(currentStatus);
        if (!allowed.includes(nextStatus)) {
            setError(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
            return;
        }

        if ((nextStatus === 'COMPLETED' || nextStatus === 'REJECTED') && !note) {
            setError('Admin note is required when marking report as COMPLETED or REJECTED.');
            return;
        }

        if (nextStatus === 'COMPLETED' && !proof) {
            setError('Resolution proof URL is required when marking report as COMPLETED.');
            return;
        }

        setUpdatingId(reportId);
        setError('');

        try {
            const response = await updateWasteRequestStatus(reportId, {
                status: nextStatus,
                adminNote: note || null,
                resolutionProofUrl: proof || null,
            });
            mergeReport(response?.data);
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
            mergeReport(response?.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not assign pickup date.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="page-shell narrow">
                <div className="surface-card empty-state">Loading admin report queue...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="page-shell compact">
                <div className="surface-card text-center">
                    <h2 className="section-title mb-2 justify-center">Admin Access Required</h2>
                    <p className="section-note mb-3">{error || 'You do not have permission to open this page.'}</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go To Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell space-y-5">
            <section className="section-head">
                <div>
                    <h1 className="page-title"><ListTodo size={30} className="mr-2 inline-block align-middle" />Admin Report Queue</h1>
                    <p className="page-subtitle">Enforce status workflow, add notes, assign pickup dates, and close reports with proof.</p>
                </div>
                <button className="btn-ghost" onClick={fetchReports}><RefreshCcw size={15} /> Refresh</button>
            </section>

            {error && <div className="alert error">{error}</div>}

            {sortedReports.length === 0 ? (
                <section className="surface-card"><div className="empty-state">No reports available right now.</div></section>
            ) : (
                <section className="stack-md">
                    {sortedReports.map((report) => {
                        const reportId = report.id;
                        const currentStatus = report.status || 'PENDING';
                        const selectable = getSelectableStatuses(currentStatus);
                        const busy = updatingId === reportId;

                        return (
                            <motion.article key={reportId} className="surface-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="row wrap space mb-3">
                                    <div>
                                        <h3 className="section-title">Report #{reportId}</h3>
                                        <p className="help-text">Created {formatDate(report.createdAt)}</p>
                                    </div>
                                    <span className={`status-chip ${getStatusClass(currentStatus)}`}>{currentStatus}</span>
                                </div>

                                <div className="grid-2 gap-4">
                                    <div className="stack-sm">
                                        <div><strong>Reporter:</strong> {report?.user?.name || 'Unknown'} ({report?.user?.email || 'N/A'})</div>
                                        <div><strong>Description:</strong> {report?.textDescription || 'No description'}</div>
                                        <div><strong>Category:</strong> {report?.category?.name || report?.category?.categoryType || 'Not provided'}</div>
                                        <div><strong>Severity:</strong> {report?.severity || 'MEDIUM'} | <strong>Quantity:</strong> {report?.estimatedQuantity || 1}</div>
                                        <div><strong>Address:</strong> {report?.address || 'N/A'}</div>
                                        <div><strong>Coordinates:</strong> {report?.latitude ?? 'N/A'}, {report?.longitude ?? 'N/A'}</div>
                                        <div><strong>Pickup:</strong> {formatDate(report?.pickupDate)}</div>
                                        <div><strong>Points:</strong> {report?.points ?? 0}</div>

                                        <div className="row wrap">
                                            {report?.imageUrl && (
                                                <a href={report.imageUrl} target="_blank" rel="noreferrer" className="btn-soft"><LocateFixed size={14} /> Open Uploaded Image</a>
                                            )}
                                            {report?.resolutionProofUrl && (
                                                <a href={report.resolutionProofUrl} target="_blank" rel="noreferrer" className="btn-secondary"><CheckCircle2 size={14} /> Resolution Proof</a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="surface-card inset">
                                        <div className="form-grid">
                                            <div>
                                                <label className="form-label">Update Status</label>
                                                <select className="select-control" value={statusDrafts[reportId] || currentStatus} onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))}>
                                                    {selectable.map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="form-label">Admin Note</label>
                                                <textarea className="textarea-control" rows={3} value={noteDrafts[reportId] || ''} onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} placeholder="Add action note (required for COMPLETED/REJECTED)" />
                                            </div>

                                            <div>
                                                <label className="form-label">Resolution Proof URL</label>
                                                <input className="input-control" type="url" value={proofDrafts[reportId] || ''} onChange={(e) => setProofDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} placeholder="https://..." />
                                            </div>

                                            <button className="btn-primary" onClick={() => handleStatusUpdate(report)} disabled={busy}><SendHorizontal size={15} /> {busy ? 'Saving...' : 'Apply Status'}</button>

                                            <div>
                                                <label className="form-label">Assign Pickup Date</label>
                                                <input type="datetime-local" className="input-control" value={pickupDrafts[reportId] || ''} onChange={(e) => setPickupDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} />
                                            </div>

                                            <button className="btn-ghost" onClick={() => handlePickupAssign(reportId)} disabled={busy}><CalendarClock size={15} /> {busy ? 'Saving...' : 'Assign Pickup'}</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </section>
            )}
        </div>
    );
};

export default AdminReports;
