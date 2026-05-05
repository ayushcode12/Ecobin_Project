import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ScanEye, 
    RefreshCcw, 
    Calendar, 
    CheckCircle2, 
    AlertCircle,
    ImageIcon,
    Filter
} from 'lucide-react';
import { getAllScansAdmin } from '@/services/api';

const AdminScans = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchScans = async () => {
        setLoading(true);
        try {
            const response = await getAllScansAdmin();
            setScans(response.data);
        } catch (err) {
            setError('Failed to load system-wide scans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScans();
    }, []);

    const getCategoryBadge = (cat) => {
        if (cat === 'Recyclable') return 'badge info';
        if (cat === 'Biodegradable') return 'badge approved';
        if (cat === 'Non-Biodegradable') return 'badge rejected';
        return 'badge brand';
    };

    if (loading) return <div className="page-shell narrow flex items-center justify-center min-h-[50vh] animate-pulse">Scanning System History...</div>;

    return (
        <div className="page-shell space-y-6">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Model Performance Audit</span>
                    <h1 className="page-title"><ScanEye size={28} className="mr-3 inline-block" />AI Classification Audit</h1>
                    <p className="page-subtitle">Review and verify every AI prediction across the platform to ensure accuracy.</p>
                </div>
                <button className="btn-ghost" onClick={fetchScans}><RefreshCcw size={15} /> Refresh</button>
            </section>

            {error && <div className="alert error">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {scans.length === 0 ? (
                    <div className="col-span-full surface-card p-20 text-center text-slate-500">No scan activity recorded in the system.</div>
                ) : (
                    scans.map((scan) => (
                        <motion.article 
                            key={scan.id} 
                            initial={{ opacity: 0, y: 15 }} 
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="surface-card flex flex-col h-full overflow-hidden group hover:border-emerald-500/30 transition-all duration-500"
                        >
                            <div className="aspect-[16/10] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                                {scan.imageUrl && scan.imageUrl !== 'base64-image-used' ? (
                                    <img 
                                        src={scan.imageUrl} 
                                        alt="Scan context" 
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                ) : (
                                    <div className="stack-xs items-center text-slate-700 group-hover:text-slate-500 transition-colors">
                                        <ImageIcon size={40} className="mb-2" />
                                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">Neural Data Only</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-4 right-4">
                                    <span className={getCategoryBadge(scan.categoryType)}>
                                        {scan.categoryType}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                            <Calendar size={12} className="text-blue-400" /> 
                                            {new Date(scan.createdAt).toLocaleDateString()} • {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <h4 className="text-[15px] font-bold text-slate-100 line-clamp-2 leading-relaxed">
                                            {scan.textDescription ? `"${scan.textDescription}"` : <span className="text-slate-500 font-medium">No description provided</span>}
                                        </h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
                                    <div className="stack-xs">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em]">Neural Key</span>
                                        <span className="text-sm font-black text-emerald-400 truncate">{scan.matchedKeyword || 'None'}</span>
                                    </div>
                                    <div className="stack-xs text-right">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em]">Reward</span>
                                        <span className="text-sm font-black text-amber-400">+{scan.pointsAwarded || 0} <span className="text-[10px] text-slate-600">XP</span></span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Audit Pass</span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 font-bold">
                                        LOG_{scan.id}
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminScans;
