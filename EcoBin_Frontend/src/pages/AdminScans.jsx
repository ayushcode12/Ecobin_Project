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
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="surface-card flex flex-col h-full overflow-hidden group"
                        >
                            <div className="aspect-video w-full bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                                {scan.imageUrl && scan.imageUrl !== 'base64-image-used' ? (
                                    <img 
                                        src={scan.imageUrl} 
                                        alt="Scan context" 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="stack-xs items-center text-slate-600">
                                        <ImageIcon size={32} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Image Data Hidden</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={getCategoryBadge(scan.categoryType)}>
                                        {scan.categoryType}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 stack-md">
                                <div className="stack-xs">
                                    <div className="row gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                        <Calendar size={10} /> {new Date(scan.createdAt).toLocaleString()}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-100 line-clamp-1 italic">
                                        "{scan.textDescription || 'No description provided'}"
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="surface-card p-3 bg-white/[0.02] stack-xs border-white/5">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Keyword</span>
                                        <span className="text-xs font-mono text-emerald-400">{scan.matchedKeyword || 'N/A'}</span>
                                    </div>
                                    <div className="surface-card p-3 bg-white/[0.02] stack-xs border-white/5">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Points</span>
                                        <span className="text-xs font-black text-amber-400">+{scan.pointsAwarded || 0}</span>
                                    </div>
                                </div>

                                <div className="row gap-2 pt-2 mt-auto">
                                    <div className="row gap-1 text-[10px] font-bold text-emerald-500">
                                        <CheckCircle2 size={12} /> Audit Passed
                                    </div>
                                    <div className="ml-auto text-[10px] text-slate-600">
                                        ID: #{scan.id}
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
