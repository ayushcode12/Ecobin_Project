import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ClipboardList, 
    RefreshCcw, 
    User, 
    Activity, 
    Clock, 
    Info 
} from 'lucide-react';
import { getAdminLogs } from '@/services/api';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await getAdminLogs();
            setLogs(response.data);
        } catch (err) {
            setError('Failed to load audit logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'text-red-400 bg-red-400/5 border-red-400/10';
        if (action.includes('UPDATE')) return 'text-blue-400 bg-blue-400/5 border-blue-400/10';
        if (action.includes('RESET')) return 'text-amber-400 bg-amber-400/5 border-amber-400/10';
        return 'text-slate-400 bg-slate-400/5 border-slate-400/10';
    };

    if (loading) {
        return <div className="page-shell narrow flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-purple-400 font-bold">Retrieving System Logs...</div>
        </div>;
    }

    return (
        <div className="page-shell space-y-6">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Audit Trail</span>
                    <h1 className="page-title"><ClipboardList size={28} className="mr-3 inline-block" />Activity Logs</h1>
                    <p className="page-subtitle">Complete history of administrative actions and system modifications.</p>
                </div>
                <button className="btn-ghost" onClick={fetchLogs}><RefreshCcw size={15} /> Refresh</button>
            </section>

            {error && <div className="alert error">{error}</div>}

            <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Admin</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Target</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No logs recorded yet.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                            <div className="row gap-2"><Clock size={12} /> {new Date(log.timestamp).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="row gap-2 text-sm font-medium text-slate-200">
                                                <User size={14} className="text-slate-500" /> {log.adminEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {log.target}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                            <div className="row gap-2"><Info size={14} className="shrink-0" /> {log.details}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;
