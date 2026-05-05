import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Aperture, 
    Camera, 
    ImagePlus, 
    Loader2, 
    LocateFixed, 
    MapPin, 
    RotateCcw, 
    SendHorizontal, 
    X,
    ShieldAlert,
    Info,
    CheckCircle,
    Activity,
    Compass,
    Database,
    Zap
} from 'lucide-react';
import { getCategories, createWasteRequest } from '@/services/api';

const defaultForm = {
    categoryId: '',
    textDescription: '',
    severity: 'MEDIUM',
    address: '',
    latitude: '',
    longitude: '',
};

const ReportWaste = () => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState(defaultForm);
    const [preview, setPreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [useCamera, setUseCamera] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setUseCamera(false);
    };

    const startCamera = async () => {
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            setUseCamera(true);
            setPreview(null);
            setImageBase64('');
        } catch (err) {
            setError('Optical sensor access denied. Please utilize manual upload mode.');
        }
    };

    const captureFrame = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const b64 = canvas.toDataURL('image/jpeg', 0.8);
            setImageBase64(b64);
            setPreview(b64);
            stopCamera();
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setImageBase64(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (useCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [useCamera]);

    useEffect(() => { return () => stopCamera(); }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await getCategories();
                setCategories(response?.data || []);
            } catch (err) {
                setError('Neural category mapping failed.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geospatial sensors unavailable on this device.');
            return;
        }
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateField('latitude', position.coords.latitude.toFixed(6));
                updateField('longitude', position.coords.longitude.toFixed(6));
            },
            () => setError('GPS Triangulation failed. Manual entry required.'),
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!form.textDescription.trim()) {
            setError('Incomplete Data: Narrative description required for audit.');
            return;
        }

        const payload = {
            categoryId: form.categoryId ? Number(form.categoryId) : null,
            textDescription: form.textDescription.trim(),
            imageUrl: imageBase64 || null,
            severity: form.severity,
            address: form.address.trim() || null,
            latitude: form.latitude === '' ? null : Number(form.latitude),
            longitude: form.longitude === '' ? null : Number(form.longitude),
        };

        setSubmitting(true);
        try {
            const response = await createWasteRequest(payload);
            setSuccess(`Audit Dispatched: Geospatial ID #${response?.data?.id}`);
            setForm(defaultForm);
            setPreview(null);
            setImageBase64('');
        } catch (err) {
            setError('Transmission Error: Dispatch node rejected parameters.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-shell space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="section-kicker mb-4 border-blue-500/20 bg-blue-500/10 text-blue-300">Community Reporting</span>
                    <h1 className="page-title text-4xl font-black">Field Report</h1>
                    <p className="text-slate-500 text-sm mt-2">Generate professional reports for unmanaged waste and environmental hazards.</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">EcoBin Active</span>
                </div>
            </section>

            <motion.section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="surface-card p-10 bg-slate-950/40 border-white/5 space-y-8">
                    {error && <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold">{error}</div>}
                    {success && <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold">{success}</div>}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {useCamera ? (
                            <div className="relative w-full aspect-video rounded-3xl border border-blue-500/30 overflow-hidden bg-black shadow-2xl">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <Compass size={100} className="text-blue-500/10 animate-[spin_20s_linear_infinite]" />
                                    <div className="absolute w-40 h-40 border border-white/10 rounded-full" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center">
                                    <button className="btn-primary mb-4 py-4 px-10 shadow-xl shadow-blue-500/20" type="button" onClick={captureFrame}>
                                        <Aperture size={20} className="mr-2" /> Capture Proof
                                    </button>
                                    <button className="text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest" type="button" onClick={stopCamera}>
                                        Discard Feed
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div onClick={startCamera} className="h-40 bg-blue-500/5 border-2 border-dashed border-blue-500/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group">
                                    <Camera size={32} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-black text-blue-200 uppercase tracking-widest">Capture Photo</span>
                                </div>

                                <div className="image-drop h-40 border-2 border-dashed border-white/10 rounded-3xl relative group hover:border-white/30 transition-all">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="object-cover w-full h-full absolute inset-0 z-0 opacity-60 rounded-3xl" />
                                    ) : (
                                        <div className="stack-xs items-center relative z-10">
                                            <ImagePlus size={32} className="text-slate-400 mb-3 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Import Photo</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="z-20 cursor-pointer" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Waste Category</label>
                                <select
                                    className="select-control py-4"
                                    value={form.categoryId}
                                    onChange={(e) => updateField('categoryId', e.target.value)}
                                    disabled={loadingCategories}
                                >
                                    <option value="">Auto-Detect Protocol</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name || cat.categoryType}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Hazard Severity</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['LOW', 'MEDIUM', 'HIGH'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => updateField('severity', s)}
                                            className={`rounded-2xl py-4 text-[10px] font-black transition-all border ${
                                                form.severity === s 
                                                ? (s === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : s === 'MEDIUM' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]')
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Report Details</label>
                            <textarea
                                className="textarea-control p-5 min-h-[120px]"
                                placeholder="Detail environmental anomaly characteristics..."
                                value={form.textDescription}
                                onChange={(e) => updateField('textDescription', e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Location Tracking</label>
                                <button type="button" className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-[0.15em] flex items-center" onClick={detectLocation}>
                                    <LocateFixed size={12} className="mr-2" /> Triangulate GPS
                                </button>
                            </div>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input className="input-control pl-14 py-5" type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Physical location description..." />
                            </div>
                            {(form.latitude || form.longitude) && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="text-[10px] font-mono text-blue-400/80">COORDINATES LOCKED: {form.latitude}, {form.longitude}</span>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn-primary w-full py-6 text-lg shadow-xl shadow-blue-500/10" disabled={submitting}>
                            {submitting ? <Loader2 size={24} className="animate-spin" /> : <SendHorizontal size={24} />}
                            {submitting ? 'Transmitting Report...' : 'Submit Field Report'}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <article className="surface-card p-8 bg-white/[0.02] border-white/5 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <ShieldAlert size={14} className="text-blue-400" /> Reporting Guidelines
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Optical Clarity', desc: 'Ensure assets are documented with high visibility.', icon: Aperture },
                                { title: 'Geospatial Integrity', desc: 'Prioritize GPS triangulation for rapid response.', icon: Compass },
                                { title: 'Severity Accuracy', desc: 'Calibrate hazard levels based on environmental risk.', icon: Zap },
                            ].map(p => (
                                <div key={p.title} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <p.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-200">{p.title}</div>
                                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="surface-card p-8 bg-blue-500/[0.02] border-blue-500/10 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                            <Activity size={14} /> Report Status
                        </h3>
                        <div className="space-y-3">
                            {[
                                { status: 'PENDING', desc: 'Audit initialization', color: 'pending' },
                                { status: 'APPROVED', desc: 'Validation successful', color: 'approved' },
                                { status: 'PROGRESS', desc: 'Resources dispatched', color: 'progress' },
                                { status: 'COMPLETE', desc: 'Anomaly neutralized', color: 'completed' },
                            ].map(s => (
                                <div key={s.status} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-1.5 w-1.5 rounded-full status-dot-${s.color}`} />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s.status}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="surface-card p-8 bg-emerald-500/[0.02] border-emerald-500/10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">EcoBin Database</h3>
                            <p className="text-[11px] text-slate-500 mt-1">Submitted reports are recorded in the EcoBin community database for resolution.</p>
                        </div>
                    </article>
                </div>
            </motion.section>
        </div>
    );
};

export default ReportWaste;

