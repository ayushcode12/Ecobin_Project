import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, Home, ImagePlus, Loader2, RotateCcw, SendHorizontal, Sparkles, X, Aperture } from 'lucide-react';
import { scanWaste } from '@/services/api';

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
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const requestImageUrl = useMemo(() => {
        if (imageUrl.trim()) return imageUrl.trim();
        if (preview) return preview;
        return 'https://placehold.co/400';
    }, [imageUrl, preview]);

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

    const onEnterSubmit = (event) => {
        if (event.key === 'Enter' && !loading) {
            event.preventDefault();
            handleSubmit();
        }
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
                        <div className="relative w-full overflow-hidden rounded-[20px] border border-blue-400/30 bg-black/60 shadow-inner">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-[300px] object-cover scale-100" 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 bg-gradient-to-t from-black/80 to-transparent">
                                <button className="btn-primary mb-2 shadow-xl shadow-emerald-500/50 hover:scale-105 transition-all text-lg font-bold py-3 px-8" type="button" onClick={captureFrame}>
                                    <Aperture size={22} className="mr-2" /> Capture Object
                                </button>
                                <button className="text-white/60 hover:text-white transition-colors flex items-center text-sm font-medium" type="button" onClick={stopCamera}>
                                    <X size={15} className="mr-1" /> Close Camera
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Image Preview / Selection / Camera Buttons */}
                    {!useCamera && (
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
                        <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading || (useCamera && !preview)}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                            {loading ? 'AI Analyzing...' : 'Analyze & Submit'}
                        </button>
                        <button className="btn-ghost" type="button" onClick={resetForm} disabled={loading}>
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
