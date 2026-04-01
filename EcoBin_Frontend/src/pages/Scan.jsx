import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, ImagePlus, Loader2, RotateCcw, SendHorizontal, Sparkles } from 'lucide-react';
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
    'styrofoam plate',
    'newspaper',
];

const Scan = () => {
    const navigate = useNavigate();

    const [textDescription, setTextDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const requestImageUrl = useMemo(() => {
        if (imageUrl.trim()) return imageUrl.trim();
        if (preview) return preview;
        return 'https://placehold.co/400';
    }, [imageUrl, preview]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        const text = textDescription.trim();
        if (!text) {
            setError('Please type waste text like "banana peel" or "plastic bottle".');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await scanWaste(text, requestImageUrl);
            setResult(response?.data || null);
        } catch (err) {
            const apiMessage = err?.response?.data?.message || err?.response?.data;
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setError('Session expired or access denied. Please login again.');
            } else {
                setError(apiMessage || 'Submission failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTextDescription('');
        setImageUrl('');
        setPreview(null);
        setResult(null);
        setError('');
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
                    <h1 className="page-title">Text-Based Waste Classification</h1>
                    <p className="page-subtitle">Enter a waste item, test rule-based classification instantly, and earn points.</p>
                </div>
                <div className="row wrap">
                    <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="btn-ghost" onClick={() => navigate('/')}><Home size={15} /> Home</button>
                </div>
            </section>

            {!result ? (
                <motion.section className="surface-card stack-md" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <label className="form-label">Waste Text</label>
                        <input
                            type="text"
                            className="input-control"
                            placeholder="Example: banana peel, plastic bottle, chips packet"
                            value={textDescription}
                            onChange={(e) => setTextDescription(e.target.value)}
                            onKeyDown={onEnterSubmit}
                        />
                        <p className="help-text mt-1.5">Text classification also gives points and appears in dashboard activity.</p>
                    </div>

                    <div>
                        <p className="form-label">Quick Samples</p>
                        <div className="row wrap">
                            {SAMPLE_ITEMS.map((item) => (
                                <button key={item} className="btn-soft" onClick={() => setTextDescription(item)} type="button">{item}</button>
                            ))}
                        </div>
                    </div>

                    <div className="form-grid cols-2">
                        <div>
                            <label className="form-label">Optional Image URL</label>
                            <input
                                type="url"
                                className="input-control"
                                placeholder="https://..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Optional Image Upload</label>
                            <div className="image-drop min-h-[130px]">
                                {preview ? (
                                    <img src={preview} alt="Selected preview" className="object-cover" />
                                ) : (
                                    <div className="image-drop-hint">
                                        <ImagePlus size={22} className="mx-auto mb-1.5" />
                                        Upload photo for context
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>
                    </div>

                    <div className="row wrap">
                        <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                            {loading ? 'Submitting...' : 'Submit Text Classification'}
                        </button>
                        <button className="btn-ghost" type="button" onClick={resetForm}><RotateCcw size={15} /> Clear</button>
                    </div>

                    {error && <div className="alert error">{error}</div>}
                </motion.section>
            ) : (
                <motion.section className="surface-card text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/20">
                        <CheckCircle2 size={42} className="text-emerald-200" />
                    </div>

                    <h2 className="page-title mb-2 text-[1.72rem]">{result.categoryType || 'Unknown Category'}</h2>
                    <p className="page-subtitle mx-auto mb-4">{result.motivationalMessage || 'Classification completed successfully.'}</p>

                    <div className="grid-3 mb-4">
                        <div className="metric-chip"><p className="help-text">Points Earned</p><div className="text-3xl font-black text-emerald-200">+{result.pointsAwarded || 0}</div></div>
                        <div className="metric-chip"><p className="help-text">Updated Total</p><div className="text-3xl font-black">{result.updatedTotalPoints || 0}</div></div>
                        <div className="metric-chip"><p className="help-text">Rule Priority</p><div className="text-3xl font-black">{result.rulePriority ?? 0}</div></div>
                    </div>

                    <p className="help-text mb-4"><Sparkles size={14} className="mr-1 inline-block align-text-bottom" />Matched rule: {result.matchedKeyword || 'No keyword matched'}</p>

                    <div className="row wrap justify-center">
                        <button className="btn-primary" onClick={resetForm}>Classify Another</button>
                        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Back To Dashboard</button>
                        <button className="btn-ghost" onClick={() => navigate('/history')}>View History</button>
                    </div>
                </motion.section>
            )}
        </div>
    );
};

export default Scan;
