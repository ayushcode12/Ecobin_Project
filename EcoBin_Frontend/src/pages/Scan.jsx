import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, Home, ImagePlus, Loader2, RotateCcw, SendHorizontal, Sparkles, X, Aperture } from 'lucide-react';
import { previewLiveWaste, scanWaste } from '@/services/api';

const LIVE_SCAN_INTERVAL_MS = 1000;
const LIVE_AUTO_CONFIRM_CONFIDENCE = 0.8;
const DETECTION_BOX_RATIO = 0.85; // Visual box on screen
const MODEL_CROP_RATIO = 0.50;    // Tight crop sent to AI — background excluded

const SAMPLE_ITEMS = [
    'banana peel',
    'paper cup',
    'plastic bottle',
    'glass bottle',
    'chips packet',
    'fruit waste',
    'metal can',
    'food leftovers',
];

const Scan = () => {
    const navigate = useNavigate();

    const [textDescription, setTextDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    // Camera features
    const [useCamera, setUseCamera] = useState(false);
    const [livePrediction, setLivePrediction] = useState(null);
    const [liveMessage, setLiveMessage] = useState('Align object in frame to start AI scan');
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
        setLiveMessage('Initializing Neural Engine...');
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
            setError('Camera access denied or unavailable. Please upload a photo instead.');
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

            // --- What the AI sees: tight center crop, NO background ---
            const modelSize = Math.min(vw, vh) * MODEL_CROP_RATIO;
            const modelX = (vw - modelSize) / 2;
            const modelY = (vh - modelSize) / 2;

            const modelCanvas = document.createElement('canvas');
            modelCanvas.width = 400;
            modelCanvas.height = 400;
            const modelCtx = modelCanvas.getContext('2d');
            // Draw only the tight center object zone
            modelCtx.drawImage(video, modelX, modelY, modelSize, modelSize, 0, 0, 400, 400);
            // Slight contrast boost so object edges are cleaner for the model
            modelCtx.filter = 'contrast(1.15) saturate(1.2)';
            modelCtx.drawImage(modelCanvas, 0, 0);

            const frame = modelCanvas.toDataURL('image/jpeg', 0.85);

            setLiveProcessing(true);
            try {
                const response = await previewLiveWaste(frame);
                const prediction = response.data;
                setLivePrediction(prediction);
                setLiveMessage(prediction.statusMessage);

                if (prediction.confidence >= LIVE_AUTO_CONFIRM_CONFIDENCE) {
                    // Auto-confirm logic
                    setAutoConfirmedFrame(frame);
                    setImageBase64(frame);
                    setPreview(frame);
                    setTextDescription(''); // Clear manual text if AI is sure
                    stopCamera();
                } else {
                    liveLoopTimeoutRef.current = setTimeout(runLivePreview, LIVE_SCAN_INTERVAL_MS);
                }
            } catch (err) {
                setLiveMessage('Neural Engine reconnecting...');
                liveLoopTimeoutRef.current = setTimeout(runLivePreview, 2000);
            } finally {
                setLiveProcessing(false);
            }
        };

        runLivePreview();

        return () => {
            if (liveLoopTimeoutRef.current) clearTimeout(liveLoopTimeoutRef.current);
        };
    }, [useCamera, result, autoConfirmedFrame]);

    useEffect(() => {
        if (useCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [useCamera]);

    useEffect(() => {
        return () => stopCamera(); // Cleanup on unmount
    }, []);

    const captureFrame = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 500;
            canvas.height = videoRef.current.videoHeight || 500;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const maxW = 500;
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
                const MAX_WIDTH = 500;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                setImageBase64(compressedBase64);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const onEnterSubmit = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const handleSubmit = async () => {
        const text = textDescription.trim();
        if (!text && !imageBase64 && !imageUrl.trim()) {
            setError('Please provide text or capture/upload an image.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const finalImagePayload = imageBase64 || imageUrl.trim() || requestImageUrl;
            const response = await scanWaste(text, finalImagePayload);
            setResult(response?.data || null);
        } catch (err) {
            let apiMessage = err?.response?.data?.message || err?.response?.data;
            if (typeof apiMessage === 'object' && apiMessage !== null) {
                apiMessage = apiMessage.error || apiMessage.message || JSON.stringify(apiMessage);
            }
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('Session expired or access denied. Please login again.');
            } else {
                setError(typeof apiMessage === 'string' ? apiMessage : 'Submission failed. Please try again.');
            }
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
        stopCamera();
    };

    return (
        <div className="page-shell narrow">
            <section className="section-head">
                <div>
                    <h1 className="page-title text-[2rem]">AI Live Camera Scan</h1>
                    <p className="page-subtitle">Instantly classify waste with your device camera or upload an image.</p>
                </div>
                <div className="row wrap">
                    <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="btn-ghost" onClick={() => navigate('/')}><Home size={15} /> Home</button>
                </div>
            </section>

            {!result ? (
                <motion.section className="surface-card stack-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    {/* Live Camera View Box */}
                    {useCamera ? (
                        <div className="relative w-full overflow-hidden rounded-[20px] border border-blue-400/30 bg-black shadow-inner">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-[450px] object-cover scale-100"
                            />
                            
                            {/* Neural Focus Overlays */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Dimmed Background (Vignette) */}
                                <div className="absolute inset-0 bg-black/60" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 15% 100%, 15% 15%, 85% 15%, 85% 85%, 15% 85%, 15% 100%, 100% 100%, 100% 0%)' }} />
                                
                                {/* Scanning Box */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-[320px] h-[320px] border-4 border-dashed rounded-[40px] transition-all duration-500 ${livePrediction?.confidence >= 0.6 ? 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-105' : 'border-white/30'}`}>
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full shadow-2xl">
                                            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{liveMessage}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                <div className="flex flex-col items-center gap-4">
                                    {livePrediction && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                                            <Sparkles size={14} className="text-emerald-400" />
                                            <span className="text-xs font-black text-emerald-200 uppercase tracking-widest">{livePrediction.categoryType} | {(livePrediction.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    )}
                                    <div className="row wrap justify-center">
                                        <button className="btn-primary shadow-xl shadow-emerald-500/30 px-10" type="button" onClick={captureFrame}>
                                            <Camera size={18} className="mr-2" /> Force Capture
                                        </button>
                                        <button className="btn-ghost" type="button" onClick={stopCamera}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {autoConfirmedFrame && (
                        <div className="relative w-full overflow-hidden rounded-[20px] border-2 border-emerald-500/50 bg-emerald-500/5 stack-md p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-2xl overflow-hidden border border-emerald-500/30">
                                    <img src={autoConfirmedFrame} alt="Captured" className="w-full h-full object-cover" />
                                </div>
                                <div className="stack-0">
                                    <span className="badge success mb-1">AI Match Found</span>
                                    <h3 className="text-xl font-black text-white">{livePrediction?.categoryType}</h3>
                                    <p className="help-text">Confidence: <span className="text-emerald-400 font-bold">{(livePrediction?.confidence * 100).toFixed(0)}%</span></p>
                                </div>
                            </div>
                            <div className="row wrap mt-2">
                                <button className="btn-primary flex-1" onClick={handleSubmit}>Confirm & Get Points</button>
                                <button className="btn-ghost" onClick={() => setAutoConfirmedFrame(null)}>Re-scan</button>
                            </div>
                        </div>
                    )}

                    {/* Image Preview / Selection / Camera Buttons */}
                    {!useCamera && !autoConfirmedFrame && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label mb-2">Live Camera</label>
                                <div
                                    onClick={startCamera}
                                    className="h-[130px] border-2 border-dashed border-emerald-400/30 rounded-[15px] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-400/10 hover:border-emerald-400/60 transition-all group"
                                >
                                    <Camera size={28} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-emerald-200">Start Camera</span>
                                </div>
                            </div>

                            <div>
                                <label className="form-label mb-2">Image Upload</label>
                                <div className="image-drop h-[130px] flex-col justify-center m-0 relative">
                                    {preview ? (
                                        <img src={preview} alt="Selected preview" className="object-cover w-full h-full absolute inset-0 z-0 opacity-80" />
                                    ) : (
                                        <div className="image-drop-hint z-10 relative">
                                            <ImagePlus size={24} className="mx-auto mb-1.5" />
                                            Upload photo
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="z-20 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-grid cols-2 mt-2">
                        <div>
                            <label className="form-label">Manual Text / Fallback</label>
                            <input
                                type="text"
                                className="input-control w-full"
                                placeholder="E.g., banana peel, plastic bottle"
                                value={textDescription}
                                onChange={(e) => setTextDescription(e.target.value)}
                                onKeyDown={onEnterSubmit}
                            />
                        </div>
                        <div>
                            <label className="form-label">Web URL Option</label>
                            <input
                                type="url"
                                className="input-control w-full"
                                placeholder="https://..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row wrap mt-4">
                        <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading || (useCamera && !preview) || (autoConfirmedFrame && loading)}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                            {loading ? 'AI Analyzing...' : 'Analyze & Submit'}
                        </button>
                        <button className="btn-ghost" type="button" onClick={() => { resetForm(); setAutoConfirmedFrame(null); }} disabled={loading}>
                            <RotateCcw size={15} /> Clear All
                        </button>
                    </div>

                    {error && <div className="alert error mt-4">{error}</div>}
                </motion.section>
            ) : (
                <motion.section className="surface-card text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/20 shadow-lg shadow-emerald-500/20">
                        {preview ? (
                            <img src={preview} alt="Scanned object" className="w-full h-full object-cover rounded-full opacity-60 mix-blend-screen" />
                        ) : (
                            <CheckCircle2 size={42} className="text-emerald-200" />
                        )}
                        <CheckCircle2 size={30} className="text-emerald-300 absolute" />
                    </div>

                    <h2 className="page-title mb-2 text-[2.2rem] bg-gradient-to-r from-emerald-200 to-sky-200 bg-clip-text text-transparent">{result.categoryType || 'Unknown Category'}</h2>
                    <p className="page-subtitle mx-auto mb-4 font-medium text-emerald-100/70">{result.motivationalMessage || 'Classification completed successfully.'}</p>

                    <div className="grid-3 mb-6 bg-black/20 p-4 rounded-[15px] border border-white/5">
                        <div className="metric-chip bg-transparent border-0"><p className="help-text">Points Earned</p><div className="text-3xl font-black text-emerald-300">+{result.pointsAwarded || 0}</div></div>
                        <div className="metric-chip bg-transparent border-0"><p className="help-text">Updated Total</p><div className="text-3xl font-black text-white">{result.updatedTotalPoints || 0}</div></div>
                        <div className="metric-chip bg-transparent border-0"><p className="help-text">Rule Priority</p><div className="text-3xl font-black text-white">{result.rulePriority ?? 0}</div></div>
                    </div>

                    <p className="help-text mb-6"><Sparkles size={14} className="mr-1 inline-block align-text-bottom text-amber-300" />Prediction Details: <span className="font-semibold text-white">{result.matchedKeyword || 'No keyword matched'}</span></p>

                    <div className="row wrap justify-center gap-3">
                        <button className="btn-primary min-w-[150px]" onClick={resetForm}>Scan New Item</button>
                        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    </div>
                </motion.section>
            )}
        </div>
    );
};

export default Scan;
