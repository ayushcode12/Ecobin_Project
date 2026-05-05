import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Aperture, Camera, ImagePlus, Loader2, LocateFixed, MapPin, RotateCcw, SendHorizontal, X } from 'lucide-react';
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
            setError('Camera access denied or unavailable. Please upload a photo instead.');
        }
    };

    const captureFrame = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const maxW = 800;
            const scale = maxW / canvas.width;
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = maxW;
            finalCanvas.height = canvas.height * scale;
            const finalCtx = finalCanvas.getContext('2d');
            finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
            
            const b64 = finalCanvas.toDataURL('image/jpeg', 0.8);
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
                const b64 = canvas.toDataURL('image/jpeg', 0.8);
                setImageBase64(b64);
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

    useEffect(() => {
        return () => stopCamera();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await getCategories();
                setCategories(response?.data || []);
            } catch (err) {
                setError('Failed to load categories. You can still submit without selecting one.');
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
            setError('Geolocation is not supported on this device.');
            return;
        }

        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateField('latitude', position.coords.latitude.toFixed(6));
                updateField('longitude', position.coords.longitude.toFixed(6));
            },
            () => setError('Unable to fetch location. You can enter address manually.'),
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!form.textDescription.trim()) {
            setError('Please add a clear description of the waste issue.');
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
            setSuccess(`Report submitted successfully. Report ID: #${response?.data?.id}`);
            setForm(defaultForm);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-shell narrow">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Community Waste Reporting</span>
                    <h1 className="page-title">Report Road Waste</h1>
                    <p className="page-subtitle">Create a clear, location-aware waste report so admins can prioritize cleanup and move it through the action queue.</p>
                </div>
            </section>

            <motion.section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="surface-card">
                    {error && <div className="alert error mb-4">{error}</div>}
                    {success && <div className="alert success mb-4">{success}</div>}

                    <form className="form-grid" onSubmit={handleSubmit}>
                        {useCamera ? (
                            <div className="relative w-full overflow-hidden rounded-[24px] border-2 border-emerald-400/30 bg-black shadow-2xl">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-[340px] object-cover" />
                                <div className="absolute inset-0 pointer-events-none border-[24px] border-black/40" style={{ maskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)' }}></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-[180px] h-[180px] border-2 border-emerald-500/40 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <button className="btn-primary mb-3 shadow-xl shadow-emerald-500/50 scale-110" type="button" onClick={captureFrame}>
                                        <Aperture size={20} className="mr-2" /> Capture Proof
                                    </button>
                                    <button className="text-white/60 hover:text-white transition-colors flex items-center text-xs font-bold uppercase tracking-widest" type="button" onClick={stopCamera}>
                                        <X size={14} className="mr-2" /> Cancel Camera
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div onClick={startCamera} className="h-[120px] border-2 border-dashed border-emerald-400/20 rounded-[15px] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-400/5 hover:border-emerald-400/40 transition-all group">
                                    <Camera size={24} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-semibold text-emerald-100">Take Photo</span>
                                </div>

                                <div className="image-drop h-[120px] flex-col justify-center m-0 relative">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="object-cover w-full h-full absolute inset-0 z-0 opacity-80 rounded-[15px]" />
                                    ) : (
                                        <div className="image-drop-hint z-10 relative">
                                            <ImagePlus size={20} className="mx-auto mb-1" />
                                            Upload Photo
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="z-20 cursor-pointer" />
                                </div>
                            </div>
                        )}

                        <div className="form-grid cols-2 mt-2">
                            <div>
                                <label className="form-label">Category (Optional)</label>
                                <select
                                    className="select-control"
                                    value={form.categoryId}
                                    onChange={(e) => updateField('categoryId', e.target.value)}
                                    disabled={loadingCategories}
                                >
                                    <option value="">Auto / Unknown</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name || cat.categoryType}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Severity Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => updateField('severity', s)}
                                            className={`rounded-xl py-3 text-[10px] font-black transition-all border ${
                                                form.severity === s 
                                                ? (s === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : s === 'MEDIUM' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]')
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Description & Waste Details</label>
                            <textarea
                                className="textarea-control"
                                rows={3}
                                placeholder="Describe the waste (e.g., a bunch of mixed garbage, plastic pile, etc.)"
                                value={form.textDescription}
                                onChange={(e) => updateField('textDescription', e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label m-0"><MapPin size={14} className="mr-1 inline-block" />Location / Address</label>
                                <button type="button" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center" onClick={detectLocation}>
                                    <LocateFixed size={12} className="mr-1" /> Auto-Detect GPS
                                </button>
                            </div>
                            <input className="input-control" type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street name, landmark, or area" />
                            {(form.latitude || form.longitude) && (
                                <p className="text-[10px] mt-1 text-emerald-400/70 font-medium tracking-wide">
                                    ✓ GPS Coordinates Captured: {form.latitude}, {form.longitude}
                                </p>
                            )}
                        </div>

                        <button type="submit" className="btn-primary mt-2 w-full" disabled={submitting}>
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                            {submitting ? 'Transmitting Data...' : 'Dispatch Waste Report'}
                        </button>
                    </form>
                </div>

                <div className="stack-md">
                    <article className="surface-card inset">
                        <h2 className="section-title mb-3">What makes a strong report?</h2>
                        <div className="stack-sm">
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">Describe the waste clearly</p>
                                <p className="help-text mt-1">Mention whether it is mixed waste, plastic-heavy, food waste, roadside dumping, or overflow.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">Add location clues</p>
                                <p className="help-text mt-1">Street names, landmarks, and GPS improve admin response speed.</p>
                            </div>
                            <div className="metric-chip">
                                <p className="text-sm font-bold text-slate-100">Pick the right severity</p>
                                <p className="help-text mt-1">Use HIGH only when the waste is urgent, dangerous, or spreading quickly.</p>
                            </div>
                        </div>
                    </article>

                    <article className="surface-card inset">
                        <h2 className="section-title mb-3">Workflow Preview</h2>
                        <div className="stack-sm">
                            <div className="row wrap"><span className="status-chip pending">PENDING</span><span className="help-text">User submits a report.</span></div>
                            <div className="row wrap"><span className="status-chip approved">APPROVED</span><span className="help-text">Admin validates the issue.</span></div>
                            <div className="row wrap"><span className="status-chip progress">IN_PROGRESS</span><span className="help-text">Pickup or cleanup is scheduled.</span></div>
                            <div className="row wrap"><span className="status-chip completed">COMPLETED</span><span className="help-text">Issue is resolved with proof.</span></div>
                        </div>
                    </article>
                </div>
            </motion.section>
        </div>
    );
};

export default ReportWaste;
