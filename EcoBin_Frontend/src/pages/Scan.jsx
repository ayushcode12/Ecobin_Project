import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, Home, ImagePlus, Loader2, RotateCcw, SendHorizontal, Sparkles, X } from 'lucide-react';
import { previewLiveWaste, scanWaste } from '@/services/api';

const LIVE_SCAN_INTERVAL_MS = 1000;
const LIVE_RETRY_INTERVAL_MS = 3000;
const LIVE_AUTO_CONFIRM_CONFIDENCE = 0.8;
const LIVE_STABLE_CONFIDENCE = 0.65;
const LIVE_CONFIRM_STREAK = 2;
const MAX_CAPTURE_WIDTH = 500;
const DETECTION_BOX_RATIO = 0.62;
const LIVE_IDLE_MESSAGE = 'Align the waste item inside the box to start live AI classification.';

const TONE_BY_BIN = {
    Green: {
        box: 'border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]',
        badge: 'border-emerald-300/80 bg-emerald-500/25 text-emerald-50',
        accentText: 'text-emerald-200',
    },
    Blue: {
        box: 'border-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.25)]',
        badge: 'border-sky-300/80 bg-sky-500/25 text-sky-50',
        accentText: 'text-sky-200',
    },
    Black: {
        box: 'border-slate-200 shadow-[0_0_30px_rgba(148,163,184,0.25)]',
        badge: 'border-slate-200/80 bg-slate-700/55 text-slate-50',
        accentText: 'text-slate-200',
    },
    Grey: {
        box: 'border-white/70 shadow-[0_0_30px_rgba(255,255,255,0.12)]',
        badge: 'border-white/60 bg-white/10 text-white',
        accentText: 'text-white/80',
    },
};

const getLiveTone = (binColor) => TONE_BY_BIN[binColor] || TONE_BY_BIN.Grey;

const formatConfidence = (confidence) => {
    if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
        return '0%';
    }
    return `${Math.round(confidence * 100)}%`;
};

const getApiErrorMessage = (error, fallbackMessage) => {
    let apiMessage = error?.response?.data?.message || error?.response?.data;
    if (typeof apiMessage === 'object' && apiMessage !== null) {
        apiMessage = apiMessage.error || apiMessage.message || JSON.stringify(apiMessage);
    }
    return typeof apiMessage === 'string' ? apiMessage : fallbackMessage;
};

const captureCenteredFrame = (videoElement) => {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
        return null;
    }

    const sourceWidth = videoElement.videoWidth;
    const sourceHeight = videoElement.videoHeight;
    const squareSize = Math.max(1, Math.floor(Math.min(sourceWidth, sourceHeight) * DETECTION_BOX_RATIO));
    const cropX = Math.floor((sourceWidth - squareSize) / 2);
    const cropY = Math.floor((sourceHeight - squareSize) / 2);
    const cropWidth = squareSize;
    const cropHeight = squareSize;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropContext = cropCanvas.getContext('2d');
    cropContext.drawImage(
        videoElement,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    const scale = Math.min(1, MAX_CAPTURE_WIDTH / cropWidth);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = Math.max(1, Math.round(cropWidth * scale));
    outputCanvas.height = Math.max(1, Math.round(cropHeight * scale));

    const outputContext = outputCanvas.getContext('2d');
    outputContext.drawImage(cropCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    return outputCanvas.toDataURL('image/jpeg', 0.8);
};

const Scan = () => {
    const navigate = useNavigate();

    const [textDescription, setTextDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [imagePreparing, setImagePreparing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const [useCamera, setUseCamera] = useState(false);
    const [livePrediction, setLivePrediction] = useState(null);
    const [stablePrediction, setStablePrediction] = useState(null);
    const [pendingReview, setPendingReview] = useState(null);
    const [liveMessage, setLiveMessage] = useState(LIVE_IDLE_MESSAGE);
    const [liveProcessing, setLiveProcessing] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const previewRef = useRef(null);
    const liveLoopTimeoutRef = useRef(null);
    const predictionStreakRef = useRef({ categoryType: '', count: 0 });
    const stableFrameRef = useRef('');
    const autoConfirmTriggeredRef = useRef(false);

    const replacePreview = (nextPreview) => {
        setPreview((currentPreview) => {
            if (currentPreview && currentPreview.startsWith('blob:') && currentPreview !== nextPreview) {
                URL.revokeObjectURL(currentPreview);
            }
            previewRef.current = nextPreview;
            return nextPreview;
        });
    };

    const clearLiveLoop = () => {
        if (liveLoopTimeoutRef.current) {
            window.clearTimeout(liveLoopTimeoutRef.current);
            liveLoopTimeoutRef.current = null;
        }
    };

    const resetLiveState = () => {
        clearLiveLoop();
        predictionStreakRef.current = { categoryType: '', count: 0 };
        stableFrameRef.current = '';
        autoConfirmTriggeredRef.current = false;
        setLivePrediction(null);
        setStablePrediction(null);
        setPendingReview(null);
        setLiveProcessing(false);
        setLiveMessage(LIVE_IDLE_MESSAGE);
    };

    const stopCamera = () => {
        clearLiveLoop();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setUseCamera(false);
        setLiveProcessing(false);
    };

    const startCamera = async () => {
        setError('');
        setResult(null);
        setImageBase64('');
        setImagePreparing(false);
        replacePreview(null);
        resetLiveState();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            streamRef.current = stream;
            setUseCamera(true);
        } catch (err) {
            setError('Camera access denied or unavailable. Please upload a photo instead.');
        }
    };

    const openReviewFromLive = (confirmedFrame, prediction, autoConfirmed = false) => {
        autoConfirmTriggeredRef.current = true;
        stableFrameRef.current = confirmedFrame;
        setStablePrediction(prediction);
        setLivePrediction(prediction);
        setPendingReview({
            frame: confirmedFrame,
            prediction,
            autoConfirmed,
        });
        replacePreview(confirmedFrame);
        setImageBase64(confirmedFrame);
        setError('');
        setLiveMessage(
            autoConfirmed
                ? `Auto-confirmed ${prediction.categoryType} at ${formatConfidence(prediction.confidence)}. Review before saving points.`
                : `Review ${prediction.categoryType} before saving points.`
        );
        stopCamera();
    };

    useEffect(() => {
        if (useCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [useCamera]);

    useEffect(() => {
        if (!useCamera || result) {
            return undefined;
        }

        let cancelled = false;

        const scheduleNext = (delay = LIVE_SCAN_INTERVAL_MS) => {
            if (cancelled) {
                return;
            }

            liveLoopTimeoutRef.current = window.setTimeout(runLivePreview, delay);
        };

        const runLivePreview = async () => {
            if (cancelled) {
                return;
            }

            const frame = captureCenteredFrame(videoRef.current);
            if (!frame) {
                setLiveMessage('Camera is still starting. Hold steady for a moment.');
                scheduleNext();
                return;
            }

            setLiveProcessing(true);

            try {
                const response = await previewLiveWaste(frame);
                if (cancelled) {
                    return;
                }

                const nextPrediction = response?.data || null;
                setError('');
                setLivePrediction(nextPrediction);

                if (!nextPrediction?.categoryType || (nextPrediction.confidence ?? 0) < LIVE_STABLE_CONFIDENCE) {
                    predictionStreakRef.current = { categoryType: nextPrediction?.categoryType || '', count: 0 };
                    stableFrameRef.current = '';
                    setStablePrediction(null);
                    setLiveMessage(nextPrediction?.statusMessage || 'Detection is still uncertain. Keep the object inside the box.');
                } else {
                    const previous = predictionStreakRef.current;
                    const nextCount = previous.categoryType === nextPrediction.categoryType ? previous.count + 1 : 1;
                    predictionStreakRef.current = { categoryType: nextPrediction.categoryType, count: nextCount };

                    if ((nextPrediction.confidence ?? 0) >= LIVE_AUTO_CONFIRM_CONFIDENCE) {
                        stableFrameRef.current = frame;
                        setStablePrediction(nextPrediction);
                        setLiveMessage(`Auto-confirming ${nextPrediction.categoryType} at ${formatConfidence(nextPrediction.confidence)}.`);
                        if (!autoConfirmTriggeredRef.current) {
                            openReviewFromLive(frame, nextPrediction, true);
                            return;
                        }
                    } else if (nextCount >= LIVE_CONFIRM_STREAK) {
                        stableFrameRef.current = frame;
                        setStablePrediction(nextPrediction);
                        setLiveMessage(`Stable ${nextPrediction.categoryType} detection ready. Auto-confirm starts at 80%+.`);
                    } else {
                        setStablePrediction(null);
                        setLiveMessage(`${nextPrediction.statusMessage} Hold steady for ${LIVE_CONFIRM_STREAK - nextCount} more read${LIVE_CONFIRM_STREAK - nextCount === 1 ? '' : 's'}.`);
                    }
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setLiveProcessing(false);
                setLivePrediction(null);
                setStablePrediction(null);
                stableFrameRef.current = '';
                predictionStreakRef.current = { categoryType: '', count: 0 };
                setLiveMessage('Live preview is reconnecting. Keep the object inside the box.');
                setError(getApiErrorMessage(err, 'Live preview failed. Retrying automatically.'));
                scheduleNext(LIVE_RETRY_INTERVAL_MS);
                return;
            }

            if (!cancelled) {
                setLiveProcessing(false);
                scheduleNext();
            }
        };

        runLivePreview();

        return () => {
            cancelled = true;
            clearLiveLoop();
        };
    }, [useCamera, result]);

    useEffect(() => {
        return () => {
            stopCamera();
            if (previewRef.current && previewRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(previewRef.current);
            }
        };
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        stopCamera();
        resetLiveState();
        setError('');
        setResult(null);
        setImageBase64('');
        setImagePreparing(true);
        replacePreview(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scaleSize = Math.min(1, MAX_CAPTURE_WIDTH / Math.max(img.width, img.height));
                canvas.width = Math.max(1, Math.round(img.width * scaleSize));
                canvas.height = Math.max(1, Math.round(img.height * scaleSize));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                setImageBase64(compressedBase64);
                setImagePreparing(false);
            };
            img.onerror = () => {
                replacePreview(null);
                setImageBase64('');
                setImagePreparing(false);
                setError('Could not process that image. Please try a different file.');
            };
            img.src = reader.result;
        };
        reader.onerror = () => {
            replacePreview(null);
            setImageBase64('');
            setImagePreparing(false);
            setError('Could not read that image. Please try a different file.');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        const text = textDescription.trim();
        if (!text && !imageBase64 && !imageUrl.trim()) {
            setError('Please provide text or upload an image.');
            return;
        }

        if (preview && !imageBase64 && !imageUrl.trim()) {
            setError('Image is still processing. Please wait a moment and try again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const finalImagePayload = imageBase64 || (imageUrl.trim().startsWith('http') ? imageUrl.trim() : null);
            const response = await scanWaste(text, finalImagePayload);
            setResult(response?.data || null);
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('Session expired or access denied. Please login again.');
            } else {
                setError(getApiErrorMessage(err, 'Submission failed. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    const submitConfirmedFrame = async (confirmedFrame, autoConfirmed = false) => {
        replacePreview(confirmedFrame);
        setImageBase64(confirmedFrame);
        stopCamera();

        setLoading(true);
        setError('');
        setLiveMessage(autoConfirmed ? 'Auto-confirmed. Saving points now...' : 'Confirming live scan and awarding points...');

        try {
            const response = await scanWaste('', confirmedFrame);
            setPendingReview(null);
            setResult(response?.data || null);
        } catch (err) {
            autoConfirmTriggeredRef.current = false;
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('Session expired or access denied. Please login again.');
            } else {
                setError(getApiErrorMessage(err, autoConfirmed ? 'Auto-confirm failed. Please try again.' : 'Could not confirm the live scan. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmLiveScan = async () => {
        if (!stablePrediction || !stableFrameRef.current) {
            setError('Wait for a stable live prediction before confirming.');
            return;
        }

        openReviewFromLive(stableFrameRef.current, stablePrediction, false);
    };

    const handleSaveReviewedScan = async () => {
        if (!pendingReview?.frame) {
            setError('No reviewed scan is ready to save yet.');
            return;
        }

        await submitConfirmedFrame(pendingReview.frame, pendingReview.autoConfirmed);
    };

    const handleReevaluate = async () => {
        setPendingReview(null);
        setStablePrediction(null);
        setLivePrediction(null);
        setError('');
        await startCamera();
    };

    const resetForm = () => {
        setTextDescription('');
        setImageUrl('');
        setImageBase64('');
        setImagePreparing(false);
        setResult(null);
        setError('');
        replacePreview(null);
        resetLiveState();
        stopCamera();
    };

    const onEnterSubmit = (event) => {
        if (event.key === 'Enter' && !loading) {
            event.preventDefault();
            handleSubmit();
        }
    };

    const overlayPrediction = stablePrediction || livePrediction;
    const overlayTone = getLiveTone(overlayPrediction?.binColor);
    const overlayTitle = overlayPrediction?.categoryType || 'Scanning...';

    return (
        <div className={useCamera ? 'page-shell' : 'page-shell narrow'}>
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Live AI Classification</span>
                    <h1 className="page-title text-[2rem]">AI Live Camera Scan</h1>
                    <p className="page-subtitle">Use the live camera, wait for a stable category, review it once, and then save the final result with points.</p>
                </div>
                <div className="row wrap">
                    <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="btn-ghost" onClick={() => navigate('/')}><Home size={15} /> Home</button>
                </div>
            </section>

            {!result ? (
                <motion.section className="surface-card stack-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    {pendingReview ? (
                        <div className="stack-md">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                                <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
                                    {preview ? (
                                        <img src={preview} alt="Reviewed live scan" className="h-[360px] w-full object-cover sm:h-[480px]" />
                                    ) : (
                                        <div className="flex h-[360px] items-center justify-center text-white/60 sm:h-[480px]">
                                            Preview unavailable
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                                    <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                                        Final Review
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur ${getLiveTone(pendingReview.prediction?.binColor).badge}`}>
                                            {pendingReview.prediction?.categoryType || 'Unknown'}
                                            {pendingReview.prediction?.confidence != null ? ` | ${formatConfidence(pendingReview.prediction.confidence)}` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between rounded-[22px] border border-white/8 bg-black/20 p-5">
                                    <div className="stack-md">
                                        <div>
                                            <p className="help-text">Review Status</p>
                                            <h2 className="mt-2 text-[2rem] font-black text-white">
                                                {pendingReview.autoConfirmed ? 'Auto-confirmed' : 'Manual review ready'}
                                            </h2>
                                            <p className="mt-2 text-sm text-white/75">
                                                {pendingReview.autoConfirmed
                                                    ? 'The model crossed 80% confidence, so the scan was auto-confirmed. Check it once before saving points.'
                                                    : 'The scan looks stable enough to review. Save it only if the category is correct.'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                            <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                                <p className="help-text">Category</p>
                                                <div className="mt-2 text-xl font-black text-white">{pendingReview.prediction?.categoryType || '--'}</div>
                                            </div>
                                            <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                                <p className="help-text">Confidence</p>
                                                <div className="mt-2 text-xl font-black text-white">
                                                    {pendingReview.prediction?.confidence != null ? formatConfidence(pendingReview.prediction.confidence) : '--'}
                                                </div>
                                            </div>
                                            <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                                <p className="help-text">Points</p>
                                                <div className="mt-2 text-lg font-bold text-emerald-200">Saved only after approval</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row wrap gap-3 pt-4">
                                        <button className="btn-primary min-w-[190px]" type="button" onClick={handleSaveReviewedScan} disabled={loading}>
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                                            {loading ? 'Saving Result...' : 'Looks Correct, Save Points'}
                                        </button>
                                        <button className="btn-ghost" type="button" onClick={handleReevaluate} disabled={loading}>
                                            <RotateCcw size={15} /> Re-evaluate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : useCamera ? (
                        <div className="stack-md">
                            <div className="relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-black/70 shadow-inner">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="h-[430px] w-full object-cover sm:h-[560px]"
                                />

                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className={`relative flex aspect-square w-[68%] max-w-[380px] items-center justify-center rounded-[30px] border-2 border-dashed ${overlayTone.box}`}>
                                        <div className={`absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur ${overlayTone.badge}`}>
                                            {overlayTitle}
                                            {overlayPrediction?.confidence != null ? ` | ${formatConfidence(overlayPrediction.confidence)}` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 pb-5 pt-16">
                                    <div className="row wrap items-center justify-between gap-3">
                                        <div>
                                            <p className={`text-sm font-semibold ${overlayTone.accentText}`}>
                                                {loading ? 'Saving confirmed scan...' : stablePrediction ? 'Stable detection ready' : liveProcessing ? 'Reading live frame...' : 'Live AI preview'}
                                            </p>
                                            <p className="mt-1 text-sm text-white/75">{liveMessage}</p>
                                        </div>

                                        <div className="row wrap gap-3">
                                            <button
                                                className="btn-primary min-w-[190px]"
                                                type="button"
                                                onClick={handleConfirmLiveScan}
                                                disabled={loading || !stablePrediction}
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                {stablePrediction ? `Review ${stablePrediction.categoryType}` : 'Waiting for stable read'}
                                            </button>
                                            <button className="btn-ghost" type="button" onClick={stopCamera} disabled={loading}>
                                                <X size={15} /> Close Camera
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                    <p className="help-text">Current Category</p>
                                    <div className="mt-2 text-2xl font-black text-white">{overlayTitle}</div>
                                </div>
                                <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                    <p className="help-text">Live Confidence</p>
                                    <div className="mt-2 text-2xl font-black text-white">
                                        {overlayPrediction?.confidence != null ? formatConfidence(overlayPrediction.confidence) : '--'}
                                    </div>
                                </div>
                                <div className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                                    <p className="help-text">Points Awarding</p>
                                    <div className="mt-2 text-lg font-bold text-emerald-200">Saved after final review</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-3">
                                <div className="metric-chip border-0 bg-transparent">
                                    <p className="help-text">Best for</p>
                                    <div className="mt-2 text-lg font-bold text-slate-100">Live object scanning</div>
                                </div>
                                <div className="metric-chip border-0 bg-transparent">
                                    <p className="help-text">Review flow</p>
                                    <div className="mt-2 text-lg font-bold text-slate-100">Auto-confirm at 80%+</div>
                                </div>
                                <div className="metric-chip border-0 bg-transparent">
                                    <p className="help-text">Point safety</p>
                                    <div className="mt-2 text-lg font-bold text-slate-100">Saved after final approval</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label mb-2">Live Camera</label>
                                    <div
                                        onClick={startCamera}
                                        className="h-[130px] cursor-pointer rounded-[15px] border-2 border-dashed border-emerald-400/30 flex flex-col items-center justify-center transition-all hover:border-emerald-400/60 hover:bg-emerald-400/10 group"
                                    >
                                        <Camera size={28} className="mb-2 text-emerald-400 transition-transform group-hover:scale-110" />
                                        <span className="text-sm font-semibold text-emerald-200">Start Live Scan</span>
                                        <span className="mt-1 text-xs text-white/50">Shows category over the center box</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label mb-2">Image Upload</label>
                                    <div className="image-drop relative m-0 h-[130px] flex-col justify-center">
                                        {preview ? (
                                            <img src={preview} alt="Selected preview" className="absolute inset-0 z-0 h-full w-full object-cover opacity-80" />
                                        ) : (
                                            <div className="image-drop-hint relative z-10">
                                                <ImagePlus size={24} className="mx-auto mb-1.5" />
                                                Upload photo
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="z-20 cursor-pointer" />
                                        {imagePreparing ? (
                                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                                                Preparing image...
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid cols-2 mt-2">
                                <div>
                                    <label className="form-label">Manual Text / Fallback</label>
                                    <input
                                        type="text"
                                        className="input-control w-full"
                                        placeholder="E.g., banana peel, plastic bottle"
                                        value={textDescription}
                                        onChange={(event) => setTextDescription(event.target.value)}
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
                                        onChange={(event) => setImageUrl(event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="row wrap mt-4">
                                <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading || imagePreparing}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                                    {loading ? 'AI Analyzing...' : 'Analyze & Submit'}
                                </button>
                                <button className="btn-ghost" type="button" onClick={resetForm} disabled={loading}>
                                    <RotateCcw size={15} /> Clear All
                                </button>
                            </div>
                        </>
                    )}

                    {error ? <div className="alert error mt-2">{error}</div> : null}
                </motion.section>
            ) : (
                <motion.section className="surface-card text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <span className="section-kicker mb-4">Classification Complete</span>
                    <div className="mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/20 shadow-lg shadow-emerald-500/20">
                        {preview ? (
                            <img src={preview} alt="Scanned object" className="h-full w-full rounded-full object-cover opacity-60 mix-blend-screen" />
                        ) : (
                            <CheckCircle2 size={42} className="text-emerald-200" />
                        )}
                        <CheckCircle2 size={30} className="absolute text-emerald-300" />
                    </div>

                    <h2 className="page-title mb-2 bg-gradient-to-r from-emerald-200 to-sky-200 bg-clip-text text-[2.2rem] text-transparent">{result.categoryType || 'Unknown Category'}</h2>
                    <p className="page-subtitle mx-auto mb-4 font-medium text-emerald-100/70">{result.motivationalMessage || 'Classification completed successfully.'}</p>

                    <div className="grid-3 mb-6 rounded-[15px] border border-white/5 bg-black/20 p-4">
                        <div className="metric-chip border-0 bg-transparent"><p className="help-text">Points Earned</p><div className="text-3xl font-black text-emerald-300">+{result.pointsAwarded || 0}</div></div>
                        <div className="metric-chip border-0 bg-transparent"><p className="help-text">Updated Total</p><div className="text-3xl font-black text-white">{result.updatedTotalPoints || 0}</div></div>
                        <div className="metric-chip border-0 bg-transparent"><p className="help-text">Rule Priority</p><div className="text-3xl font-black text-white">{result.rulePriority ?? 0}</div></div>
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
