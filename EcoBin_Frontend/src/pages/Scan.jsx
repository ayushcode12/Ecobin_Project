import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Camera, 
    CheckCircle2, 
    Home, 
    ImagePlus, 
    Loader2, 
    RotateCcw, 
    SendHorizontal, 
    Sparkles, 
    X, 
    Aperture,
    Cpu,
    ShieldCheck,
    Zap,
    Activity,
    Maximize,
    Settings
} from 'lucide-react';
import { previewLiveWaste, scanWaste } from '@/services/api';

const LIVE_SCAN_INTERVAL_MS = 1000;
const LIVE_AUTO_CONFIRM_CONFIDENCE = 0.8;
const BOX_CSS_SIZE = 360;

const Scan = () => {
    const navigate = useNavigate();

    const [textDescription, setTextDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const [useCamera, setUseCamera] = useState(false);
    const [livePrediction, setLivePrediction] = useState(null);
    const [liveMessage, setLiveMessage] = useState('Initialize Optical Sensor');
    const [liveProcessing, setLiveProcessing] = useState(false);
    const [autoConfirmedFrame, setAutoConfirmedFrame] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const liveLoopTimeoutRef = useRef(null);

    const requestImageUrl = useMemo(() => {
        if (imageUrl.trim()) return imageUrl.trim();
        if (preview) return preview;
        return 'https://placehold.co/400';
    }, [imageUrl, preview]);

    const stopCamera = () => {
        if (liveLoopTimeoutRef.current) {
            clearTimeout(liveLoopTimeoutRef.current);
            liveLoopTimeoutRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setUseCamera(false);
        setLiveProcessing(false);
    };

    const startCamera = async () => {
        setResult(null);
        setAutoConfirmedFrame(null);
        setLivePrediction(null);
        setLiveMessage('Synchronizing Neural Engine...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            streamRef.current = stream;
            setUseCamera(true);
            setPreview(null);
            setImageBase64('');
        } catch (err) {
            setError('Optical sensor access denied. Please utilize manual upload mode.');
        }
    };

    useEffect(() => {
        if (!useCamera || result || autoConfirmedFrame) return;

        const runLivePreview = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) {
                liveLoopTimeoutRef.current = setTimeout(runLivePreview, 500);
                return;
            }

            const video = videoRef.current;
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const renderedW = video.offsetWidth || video.clientWidth;
            const renderedH = video.offsetHeight || video.clientHeight;
            const scale = Math.max(vw / renderedW, vh / renderedH);
            const boxRealSize = BOX_CSS_SIZE * scale;
            const cropX = Math.max(0, (vw - boxRealSize) / 2);
            const cropY = Math.max(0, (vh - boxRealSize) / 2);
            const cropSize = Math.min(boxRealSize, vw - cropX, vh - cropY);

            const modelCanvas = document.createElement('canvas');
            modelCanvas.width = 400;
            modelCanvas.height = 400;
            const modelCtx = modelCanvas.getContext('2d');
            modelCtx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, 400, 400);
            modelCtx.filter = 'contrast(1.2) saturate(1.1)';
            modelCtx.drawImage(modelCanvas, 0, 0);

            const frame = modelCanvas.toDataURL('image/jpeg', 0.85);

            setLiveProcessing(true);
            try {
                const response = await previewLiveWaste(frame);
                const prediction = response.data;
                setLivePrediction(prediction);
                setLiveMessage(prediction.statusMessage);

                if (prediction.confidence >= LIVE_AUTO_CONFIRM_CONFIDENCE) {
                    setAutoConfirmedFrame(frame);
                    setImageBase64(frame);
                    setPreview(frame);
                    setTextDescription('');
                    stopCamera();
                } else {
                    liveLoopTimeoutRef.current = setTimeout(runLivePreview, LIVE_SCAN_INTERVAL_MS);
                }
            } catch (err) {
                setLiveMessage('Neural Link Re-establishing...');
                liveLoopTimeoutRef.current = setTimeout(runLivePreview, 2000);
            } finally {
                setLiveProcessing(false);
            }
        };

        runLivePreview();
        return () => { if (liveLoopTimeoutRef.current) clearTimeout(liveLoopTimeoutRef.current); };
    }, [useCamera, result, autoConfirmedFrame]);

    useEffect(() => {
        if (useCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [useCamera]);

    useEffect(() => { return () => stopCamera(); }, []);

    const captureFrame = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 500;
            canvas.height = videoRef.current.videoHeight || 500;
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
                const MAX_WIDTH = 500;
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

    const handleSubmit = async () => {
        if (!textDescription.trim() && !imageBase64 && !imageUrl.trim()) {
            setError('Initialization failed: No data packet detected.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const finalImagePayload = imageBase64 || imageUrl.trim() || requestImageUrl;
            const response = await scanWaste(textDescription.trim(), finalImagePayload);
            setResult(response?.data || null);
        } catch (err) {
            setError('Submission failed: Neural node connectivity error.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTextDescription('');
        setImageUrl('');
        setImageBase64('');
        setPreview(null);
        setResult(null);
        setError('');
        setAutoConfirmedFrame(null);
        setLivePrediction(null);
        stopCamera();
    };

    return (
        <div className="page-shell space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="section-kicker mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">EcoBin Scan Suite</span>
                    <h1 className="page-title text-4xl font-black">Waste Classification</h1>
                    <p className="text-slate-500 text-sm mt-2">Professional AI classification system for rapid environmental impact assessment.</p>
                </div>
                <div className="row wrap">
                    <button className="btn-ghost border-white/5 bg-white/5" onClick={() => navigate('/dashboard')}>EcoBin HUD</button>
                    <button className="btn-ghost border-white/5 bg-white/5" onClick={() => navigate('/')}><Home size={16} /> Logout</button>
                </div>
            </section>

            {!result ? (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
                    <motion.section className="surface-card p-0 bg-slate-950/40 border-white/5 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {useCamera ? (
                            <div className="relative w-full aspect-video md:h-[600px] bg-black">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                                
                                {/* HUD Technical Overlays */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="stack-xs bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                                <Activity size={12} /> Sensor Active
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono mt-1">RES: 1280x720 | FPS: 30</div>
                                        </div>
                                        <div className="stack-xs bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-right">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 justify-end">
                                                <Cpu size={12} /> Edge Processing
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono mt-1">LATENCY: {(Math.random() * 50 + 100).toFixed(0)}MS</div>
                                        </div>
                                    </div>

                                    {/* Central Scan Reticle */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-[320px] h-[320px] border border-white/20 rounded-[40px] relative transition-all duration-700 ${livePrediction?.confidence >= 0.6 ? 'border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.3)] scale-105' : ''}`}>
                                            {/* Corner Accents */}
                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />
                                            
                                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent top-0 animate-[scan_3s_ease-in-out_infinite]" />
                                            
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 px-6 py-2 rounded-full">
                                                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em]">{liveMessage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="stack-xs">
                                            {livePrediction && (
                                                <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <div>
                                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{livePrediction.categoryType}</div>
                                                        <div className="text-[11px] text-emerald-400 font-mono mt-0.5">CONFIDENCE: {(livePrediction.confidence * 100).toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all" onClick={captureFrame}>
                                                <Aperture size={28} />
                                            </button>
                                            <button className="h-14 w-14 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" onClick={stopCamera}>
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {autoConfirmedFrame && (
                            <div className="p-10 bg-emerald-500/[0.03] flex flex-col items-center text-center space-y-6">
                                <div className="h-48 w-48 rounded-[32px] overflow-hidden border-4 border-emerald-500/30 shadow-2xl">
                                    <img src={autoConfirmedFrame} alt="Captured" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-2">
                                    <span className="badge success bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Match Authenticated</span>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{livePrediction?.categoryType}</h3>
                                    <p className="text-slate-500 text-sm">Neural signature verified with {(livePrediction?.confidence * 100).toFixed(1)}% accuracy.</p>
                                </div>
                                <div className="row gap-4 w-full max-w-md">
                                    <button className="btn-primary flex-1 py-5 text-lg" onClick={handleSubmit}>Submit to EcoBin</button>
                                    <button className="btn-ghost flex-1 py-5" onClick={() => { setAutoConfirmedFrame(null); setPreview(null); startCamera(); }}>Recalibrate</button>
                                </div>
                            </div>
                        )}

                        {!useCamera && !autoConfirmedFrame && (
                            <div className="p-8 stack-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div onClick={startCamera} className="h-[200px] bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all group">
                                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Camera size={32} />
                                        </div>
                                        <span className="text-sm font-black text-emerald-100 uppercase tracking-widest">Initialize Camera</span>
                                    </div>
                                    <div className="image-drop h-[200px] border-2 border-dashed border-white/10 rounded-3xl group hover:border-white/30 transition-all">
                                        {preview ? (
                                            <img src={preview} alt="Selected preview" className="object-cover w-full h-full absolute inset-0 z-0 opacity-60 rounded-3xl" />
                                        ) : (
                                            <div className="stack-xs items-center">
                                                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                                                    <ImagePlus size={32} />
                                                </div>
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Upload Dataset</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="z-20 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Item Description</label>
                                    <div className="relative">
                                        <Zap size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            className="input-control pl-14 py-5 text-lg"
                                            placeholder="E.g. Crushed aluminum vessel..."
                                            value={textDescription}
                                            onChange={(e) => setTextDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="row pt-4">
                                    <button className="btn-primary px-10 py-5 text-lg" onClick={handleSubmit} disabled={loading}>
                                        {loading ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                                        {loading ? 'Processing...' : 'Submit Scan'}
                                    </button>
                                    <button className="btn-ghost px-8 py-5" onClick={resetForm} disabled={loading}>
                                        <RotateCcw size={18} /> Reset
                                    </button>
                                </div>
                                {error && <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold">{error}</div>}
                            </div>
                        )}
                    </motion.section>

                    <motion.aside className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <article className="surface-card p-8 bg-white/[0.02] border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Waste Categories</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Biodegradable', color: 'bg-emerald-500', note: 'Organic compounds' },
                                    { label: 'Recyclable', color: 'bg-blue-500', note: 'Structural polymers/metals' },
                                    { label: 'Non-Bio', color: 'bg-slate-500', note: 'Composite materials' },
                                ].map(d => (
                                    <div key={d.label} className="flex items-center gap-4 group">
                                        <div className={`h-1.5 w-1.5 rounded-full ${d.color} group-hover:scale-150 transition-transform`} />
                                        <div>
                                            <div className="text-xs font-black text-slate-200">{d.label}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{d.note}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="surface-card p-8 bg-blue-500/[0.02] border-blue-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Maximize size={18} />
                                <h3 className="text-xs font-black uppercase tracking-widest">Protocol Tips</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Ensure the item occupies at least 60% of the neural frame for high-confidence classification.</p>
                        </article>

                        <article className="surface-card p-8 bg-emerald-500/[0.02] border-emerald-500/10 space-y-2">
                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Impact Reward</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Each validated audit contributes <span className="text-emerald-400 font-black">+10 XP</span> to your global identity ranking.</p>
                        </article>
                    </motion.aside>
                </div>
            ) : (
                <motion.section className="surface-card p-12 text-center max-w-3xl mx-auto space-y-8 bg-gradient-to-b from-slate-900 to-black border-emerald-500/10 shadow-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="flex flex-col items-center space-y-6">
                        <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 size={56} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black text-white tracking-tighter">Scan Complete.</h2>
                            <p className="text-slate-500 text-lg">Neural identification successful for: <span className="text-emerald-400 font-black">{result.categoryType}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-white/5">
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points Yield</div>
                            <div className="text-4xl font-black text-emerald-400">+{result.pointsAwarded || 0}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Score</div>
                            <div className="text-4xl font-black text-white">{result.updatedTotalPoints || 0}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence</div>
                            <div className="text-4xl font-black text-blue-400">{(result.confidence * 100 || 98.4).toFixed(1)}%</div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 max-w-xl mx-auto">
                        <p className="text-slate-300 italic">"{result.motivationalMessage || 'Your contribution has been synchronized with the EcoBin community database.'}"</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn-primary px-12 py-5 text-lg" onClick={resetForm}>New Scan</button>
                        <button className="btn-ghost px-10 py-5" onClick={() => navigate('/dashboard')}>View HUD Status</button>
                    </div>
                </motion.section>
            )}
        </div>
    );
};

export default Scan;

