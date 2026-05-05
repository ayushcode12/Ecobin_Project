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
                    <span className="section-kicker mb-4">Management Workflow</span>
                    <h1 className="page-title"><ListTodo size={30} className="mr-2 inline-block align-middle" />Admin Report Queue</h1>
                    <p className="page-subtitle">Review submitted waste issues, manage status transitions, and assign pickups for remediation.</p>
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
                                <div className="row wrap space mb-4 border-b border-white/10 pb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-black text-slate-400">
                                            #{reportId}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white leading-none mb-1">Issue Reported</h3>
                                            <p className="help-text flex items-center gap-1.5"><CalendarClock size={12} /> {formatDate(report.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            report.severity === 'HIGH' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                                            report.severity === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        }`}>
                                            {report.severity || 'MEDIUM'} SEVERITY
                                        </div>
                                        <span className={`status-chip ${getStatusClass(currentStatus)} px-4 py-1.5`}>{currentStatus}</span>
                                    </div>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                                    {/* Left Column: Details & Images */}
                                    <div className="stack-md">
                                        <div className="grid-2 gap-5">
                                            <div className="surface-card inset p-4 stack-sm">
                                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">Issue Details</h4>
                                                <p className="text-sm font-medium leading-relaxed text-slate-100">{report?.textDescription || 'No description provided.'}</p>
                                                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="help-text block">Category</span>
                                                        <span className="font-semibold text-slate-200">{report?.category?.name || report?.category?.categoryType || 'Uncategorized'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="help-text block">Quantity</span>
                                                        <span className="font-semibold text-slate-200">{report?.estimatedQuantity || 1} units</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="surface-card inset p-4 stack-sm">
                                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80">Location & Impact</h4>
                                                <div className="stack-sm text-xs">
                                                    <div className="flex items-start gap-2">
                                                        <LocateFixed size={14} className="mt-0.5 shrink-0 text-sky-400/60" />
                                                        <span className="text-slate-200">{report?.address || 'No address provided'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 border-t border-white/5 pt-2 mt-1">
                                                        <div>
                                                            <span className="help-text block">Impact Points</span>
                                                            <span className="font-bold text-emerald-400">+{report?.points ?? 0}</span>
                                                        </div>
                                                        <div>
                                                            <span className="help-text block">Reporter</span>
                                                            <span className="font-semibold text-slate-200">{report?.user?.name || 'Unknown'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image Gallery */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="stack-sm">
                                                <span className="form-label text-xs">User Evidence</span>
                                                {report?.imageUrl ? (
                                                    <div className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                                        <img src={report.imageUrl} alt="User proof" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        <a href={report.imageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">View Original</span>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/5 bg-white/[0.02] text-xs text-slate-500">
                                                        No image evidence
                                                    </div>
                                                )}
                                            </div>

                                            <div className="stack-sm">
                                                <span className="form-label text-xs">Resolution Proof</span>
                                                {report?.resolutionProofUrl ? (
                                                    <div className="group relative aspect-video overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                                        <img src={report.resolutionProofUrl} alt="Resolution" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        <a href={report.resolutionProofUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <span className="rounded-lg bg-emerald-400/20 px-3 py-1.5 text-xs font-bold backdrop-blur-md text-emerald-100">View Proof</span>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/5 bg-white/[0.02] text-xs text-slate-500">
                                                        Pending resolution
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Actions */}
                                    <div className="surface-card inset border-emerald-500/20 bg-emerald-500/[0.03] shadow-inner">
                                        <div className="form-grid p-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Management Console</h4>
                                            </div>
                                            
                                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 stack-md">
                                                <div>
                                                    <label className="form-label text-[10px] text-slate-500 mb-1.5">Transition Status</label>
                                                    <select className="select-control py-3 text-sm bg-slate-900 border-white/10" value={statusDrafts[reportId] || currentStatus} onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))}>
                                                        {selectable.map((status) => <option key={status} value={status}>{status}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="form-label text-[10px] text-slate-500 mb-1.5">Official Admin Notes</label>
                                                    <textarea className="textarea-control min-h-[100px] py-3 text-sm bg-slate-900 border-white/10" value={noteDrafts[reportId] || ''} onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} placeholder="Explain the decision or provide instructions..." />
                                                </div>

                                                <div>
                                                    <label className="form-label text-[10px] text-slate-500 mb-1.5">Resolution Proof (Image URL)</label>
                                                    <div className="input-icon-wrap">
                                                        <SendHorizontal size={14} className="input-icon text-slate-500" />
                                                        <input className="input-control py-3 text-sm bg-slate-900 border-white/10 pl-10" type="url" value={proofDrafts[reportId] || ''} onChange={(e) => setProofDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} placeholder="https://..." />
                                                    </div>
                                                </div>

                                                <button className="btn-primary w-full py-3.5 text-sm font-black shadow-lg shadow-emerald-500/20" onClick={() => handleStatusUpdate(report)} disabled={busy}>
                                                    {busy ? <RefreshCcw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                    {busy ? 'SYNCHRONIZING...' : 'UPDATE STATUS'}
                                                </button>
                                            </div>

                                            <div className="border-t border-white/10 pt-5 mt-2">
                                                <label className="form-label text-[10px] text-slate-500 mb-2">Assign Fleet Schedule</label>
                                                <div className="flex gap-2">
                                                    <input type="datetime-local" className="input-control py-2.5 text-[11px] flex-1 bg-slate-900 border-white/10" value={pickupDrafts[reportId] || ''} onChange={(e) => setPickupDrafts((prev) => ({ ...prev, [reportId]: e.target.value }))} />
                                                    <button className="btn-ghost py-2.5 px-4 text-xs border-white/10 bg-white/5" onClick={() => handlePickupAssign(reportId)} disabled={busy} title="Assign Schedule">
                                                        <CalendarClock size={16} className="text-sky-400" />
                                                    </button>
                                                </div>
                                            </div>
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
