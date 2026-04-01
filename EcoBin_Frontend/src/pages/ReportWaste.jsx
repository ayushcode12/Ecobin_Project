import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createWasteRequest, getCategories } from '@/services/api';
import { LocateFixed, MapPin, Send } from 'lucide-react';

const ReportWaste = () => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        categoryId: '',
        textDescription: '',
        imageUrl: '',
        severity: 'MEDIUM',
        estimatedQuantity: 1,
        address: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await getCategories();
                setCategories(response?.data || []);
            } catch (err) {
                setError('Failed to load categories.');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
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
            () => {
                setError('Unable to fetch location. You can still submit manually.');
            }
        );
    };

    const resetForm = () => {
        setForm({
            categoryId: '',
            textDescription: '',
            imageUrl: '',
            severity: 'MEDIUM',
            estimatedQuantity: 1,
            address: '',
            latitude: '',
            longitude: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.textDescription.trim()) {
            setError('Please add a description of the waste you observed.');
            return;
        }

        const payload = {
            categoryId: form.categoryId ? Number(form.categoryId) : null,
            textDescription: form.textDescription.trim(),
            imageUrl: form.imageUrl.trim() || null,
            severity: form.severity,
            estimatedQuantity: Number(form.estimatedQuantity || 1),
            address: form.address.trim() || null,
            latitude: form.latitude === '' ? null : Number(form.latitude),
            longitude: form.longitude === '' ? null : Number(form.longitude),
        };

        setSubmitting(true);
        try {
            const response = await createWasteRequest(payload);
            setSuccess(`Report submitted successfully. Report ID: #${response?.data?.id}`);
            resetForm();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '920px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{ borderRadius: '1rem', padding: '1.5rem' }}
                >
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Report Road Waste</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '1.25rem' }}>
                        Share road-side waste incidents with details so admins can take action quickly.
                    </p>

                    {error && (
                        <div style={{
                            marginBottom: '1rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#fecaca',
                            borderRadius: '0.6rem',
                            padding: '0.7rem 0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            marginBottom: '1rem',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#bbf7d0',
                            borderRadius: '0.6rem',
                            padding: '0.7rem 0.9rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Category (Optional)</label>
                                <select
                                    value={form.categoryId}
                                    onChange={(e) => updateField('categoryId', e.target.value)}
                                    disabled={loadingCategories}
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                >
                                    <option value="">Auto / Unknown</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name || cat.categoryType}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Severity</label>
                                <select
                                    value={form.severity}
                                    onChange={(e) => updateField('severity', e.target.value)}
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Description</label>
                            <textarea
                                rows={4}
                                value={form.textDescription}
                                onChange={(e) => updateField('textDescription', e.target.value)}
                                placeholder="Describe the waste (e.g., mixed plastic bags near bus stand)..."
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.75rem' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Image URL</label>
                                <input
                                    value={form.imageUrl}
                                    onChange={(e) => updateField('imageUrl', e.target.value)}
                                    placeholder="https://..."
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Estimated Quantity (items)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.estimatedQuantity}
                                    onChange={(e) => updateField('estimatedQuantity', e.target.value)}
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>
                                <MapPin size={15} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.35rem' }} />
                                Address (Optional)
                            </label>
                            <input
                                value={form.address}
                                onChange={(e) => updateField('address', e.target.value)}
                                placeholder="Street / landmark / area"
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Latitude</label>
                                <input
                                    value={form.latitude}
                                    onChange={(e) => updateField('latitude', e.target.value)}
                                    placeholder="Optional"
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8' }}>Longitude</label>
                                <input
                                    value={form.longitude}
                                    onChange={(e) => updateField('longitude', e.target.value)}
                                    placeholder="Optional"
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.65rem' }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={detectLocation}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    height: '42px',
                                    padding: '0 0.8rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #334155',
                                    color: '#e2e8f0',
                                    background: 'transparent'
                                }}
                            >
                                <LocateFixed size={16} />
                                Use GPS
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                            style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem' }}
                        >
                            <Send size={16} />
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ReportWaste;
