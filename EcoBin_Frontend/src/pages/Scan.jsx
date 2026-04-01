import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { scanWaste } from '@/services/api';
import { CheckCircle, Home, Loader2, Upload } from 'lucide-react';

const Scan = () => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [textDescription, setTextDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmitTextClassification = async () => {
        const text = textDescription.trim();
        if (!text) {
            setError('Please type text like banana peel or plastic bottle.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const imageUrlForNow = 'https://placehold.co/400';
            const response = await scanWaste(text, imageUrlForNow);
            const resultData = response?.data || null;
            setResult(resultData);
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

    const resetScan = () => {
        setPreview(null);
        setTextDescription('');
        setResult(null);
        setError('');
    };

    const submitOnEnter = (e) => {
        if (e.key === 'Enter' && !loading) {
            e.preventDefault();
            handleSubmitTextClassification();
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ borderRadius: '0.55rem', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '0.55rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <Home size={16} /> Home
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ borderRadius: '0.55rem', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '0.55rem 0.85rem' }}
                    >
                        Dashboard
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2.3rem', fontWeight: 700 }}>Text-Based Classification</h1>
                    <p style={{ color: '#94a3b8' }}>Type waste text and submit to classify and earn points.</p>
                </div>

                {!result ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{
                            margin: '0 auto',
                            padding: '1.25rem',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.45rem', color: '#cbd5e1', fontSize: '0.93rem', fontWeight: 600 }}>
                                Type Waste Text
                            </label>
                            <input
                                type="text"
                                placeholder="Example: banana peel, plastic bottle, chips packet"
                                value={textDescription}
                                onChange={(e) => setTextDescription(e.target.value)}
                                onKeyDown={submitOnEnter}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    borderRadius: '0.75rem',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.98rem'
                                }}
                            />
                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.45rem' }}>
                                This submission uses text classification and adds points to your account.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginBottom: '1rem' }}>
                            <button
                                className="btn-primary"
                                onClick={handleSubmitTextClassification}
                                disabled={loading}
                                style={{ padding: '0.72rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                Submit Text Classification (Earn Points)
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '0.7rem' }}>
                                Optional: Upload image for visual context
                            </div>
                            <div style={{ position: 'relative', borderRadius: '0.8rem', border: '1px dashed #475569', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {preview ? (
                                    <img src={preview} alt="Scan target" style={{ width: '100%', maxHeight: '240px', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <Upload size={28} style={{ marginBottom: '0.45rem' }} />
                                        <div>Click to upload image</div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        {error && <div style={{ color: '#ef4444', marginTop: '0.8rem', textAlign: 'center' }}>{error}</div>}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass"
                        style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: result.binColor === 'Green' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.2rem'
                        }}>
                            <CheckCircle size={40} color={result.binColor === 'Green' ? '#10b981' : '#3b82f6'} />
                        </div>

                        <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>{result.categoryType}</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{result.motivationalMessage}</p>

                        <div style={{ marginBottom: '0.9rem', color: '#cbd5e1', fontSize: '0.92rem' }}>
                            <strong>Matched Rule:</strong> {result.matchedKeyword || 'N/A'} | <strong>Priority:</strong> {result.rulePriority ?? 0}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.3rem' }}>
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Points Earned</div>
                                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#10b981' }}>+{result.pointsAwarded || 0}</div>
                            </div>
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>New Total</div>
                                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>{result.updatedTotalPoints || 0}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.65rem' }}>
                            <button className="btn-primary" onClick={resetScan}>Submit Another Text</button>
                            <button onClick={() => navigate('/dashboard')} style={{ borderRadius: '0.5rem', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '0.65rem 0.9rem' }}>
                                Dashboard
                            </button>
                            <button onClick={() => navigate('/')} style={{ borderRadius: '0.5rem', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '0.65rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Home size={15} /> Home
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Scan;
