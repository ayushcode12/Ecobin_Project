import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createWasteRequest, getCategories } from '@/services/api';
import { LocateFixed, MapPin, SendHorizontal } from 'lucide-react';

const defaultForm = {
    categoryId: '',
    textDescription: '',
    imageUrl: '',
    severity: 'MEDIUM',
    estimatedQuantity: 1,
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
                    <h1 className="page-title">Report Road Waste</h1>
                    <p className="page-subtitle">Share location-based waste issues with severity and quantity so admins can respond faster.</p>
                </div>
            </section>

            <motion.section className="surface-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {error && <div className="alert error mb-4">{error}</div>}
                {success && <div className="alert success mb-4">{success}</div>}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-grid cols-2">
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
                            <label className="form-label">Severity</label>
                            <select className="select-control" value={form.severity} onChange={(e) => updateField('severity', e.target.value)}>
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            className="textarea-control"
                            rows={4}
                            placeholder="Example: Mixed plastic and food waste piled near bus stand."
                            value={form.textDescription}
                            onChange={(e) => updateField('textDescription', e.target.value)}
                        />
                    </div>

                    <div className="form-grid cols-2">
                        <div>
                            <label className="form-label">Image URL (Optional)</label>
                            <input className="input-control" type="url" value={form.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} placeholder="https://..." />
                        </div>

                        <div>
                            <label className="form-label">Estimated Quantity</label>
                            <input className="input-control" type="number" min="1" value={form.estimatedQuantity} onChange={(e) => updateField('estimatedQuantity', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="form-label"><MapPin size={15} className="mr-1 inline-block align-middle" />Address (Optional)</label>
                        <input className="input-control" type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street, landmark, or area" />
                    </div>

                    <div className="form-grid cols-3 items-end">
                        <div>
                            <label className="form-label">Latitude</label>
                            <input className="input-control" type="text" value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} placeholder="Optional" />
                        </div>
                        <div>
                            <label className="form-label">Longitude</label>
                            <input className="input-control" type="text" value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} placeholder="Optional" />
                        </div>
                        <button type="button" className="btn-ghost" onClick={detectLocation}><LocateFixed size={15} /> Use GPS</button>
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting}><SendHorizontal size={16} />{submitting ? 'Submitting...' : 'Submit Report'}</button>
                </form>
            </motion.section>
        </div>
    );
};

export default ReportWaste;
