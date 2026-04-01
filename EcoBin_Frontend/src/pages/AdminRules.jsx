import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    createRule,
    deleteRule,
    getRules,
    previewClassification,
    updateRule,
} from '@/services/api';
import { BrainCircuit, Plus, RefreshCcw, Trash2, Wand2 } from 'lucide-react';

const initialForm = {
    id: null,
    categoryType: 'Biodegradable',
    keyword: '',
    priority: 100,
    points: 8,
    active: true,
};

const AdminRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [form, setForm] = useState(initialForm);

    const [previewText, setPreviewText] = useState('');
    const [previewResult, setPreviewResult] = useState(null);

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm(initialForm);
    };

    const fetchRules = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getRules(filterCategory);
            setRules(response?.data || []);
        } catch (err) {
            setError('Failed to load rule engine data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, [filterCategory]);

    const sortedRules = useMemo(() => {
        return [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    }, [rules]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!form.keyword.trim()) {
            setError('Keyword is required.');
            return;
        }

        const payload = {
            categoryType: form.categoryType,
            keyword: form.keyword.trim(),
            priority: Number(form.priority),
            points: Number(form.points),
            active: Boolean(form.active),
        };

        setSaving(true);
        try {
            if (form.id) {
                await updateRule(form.id, payload);
            } else {
                await createRule(payload);
            }
            resetForm();
            await fetchRules();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save rule.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this rule?')) return;

        try {
            await deleteRule(id);
            await fetchRules();
        } catch (err) {
            setError('Failed to delete rule.');
        }
    };

    const handlePreview = async () => {
        setError('');

        if (!previewText.trim()) {
            setError('Enter text to run classification preview.');
            return;
        }

        try {
            const response = await previewClassification(previewText.trim());
            setPreviewResult(response?.data || null);
        } catch (err) {
            setError('Preview failed. Check rule endpoint and try again.');
        }
    };

    return (
        <div className="page-shell">
            <section className="section-head">
                <div>
                    <h1 className="page-title"><BrainCircuit size={30} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />Rule Engine Admin</h1>
                    <p className="page-subtitle">Manage keyword rules, priorities, and points without touching code.</p>
                </div>
                <button className="btn-ghost" onClick={fetchRules}>
                    <RefreshCcw size={15} /> Refresh
                </button>
            </section>

            {error && <div className="alert error page-section">{error}</div>}

            <section className="grid-2 page-section">
                <motion.article className="surface-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="section-title" style={{ marginBottom: '0.7rem' }}>
                        {form.id ? `Edit Rule #${form.id}` : 'Create Rule'}
                    </h2>

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <div>
                            <label className="form-label">Category</label>
                            <select
                                className="select-control"
                                value={form.categoryType}
                                onChange={(e) => setField('categoryType', e.target.value)}
                            >
                                <option value="Biodegradable">Biodegradable</option>
                                <option value="Recyclable">Recyclable</option>
                                <option value="Non-Biodegradable">Non-Biodegradable</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Keyword</label>
                            <input
                                className="input-control"
                                value={form.keyword}
                                onChange={(e) => setField('keyword', e.target.value)}
                                placeholder="e.g. banana peel"
                            />
                        </div>

                        <div className="form-grid cols-2">
                            <div>
                                <label className="form-label">Priority</label>
                                <input
                                    type="number"
                                    className="input-control"
                                    value={form.priority}
                                    onChange={(e) => setField('priority', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="form-label">Points</label>
                                <input
                                    type="number"
                                    className="input-control"
                                    value={form.points}
                                    onChange={(e) => setField('points', e.target.value)}
                                />
                            </div>
                        </div>

                        <label className="row" style={{ color: '#c8d5e4' }}>
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => setField('active', e.target.checked)}
                            />
                            Active Rule
                        </label>

                        <div className="row wrap">
                            <button className="btn-primary" type="submit" disabled={saving}>
                                <Plus size={15} /> {saving ? 'Saving...' : (form.id ? 'Update Rule' : 'Create Rule')}
                            </button>
                            {form.id && (
                                <button className="btn-ghost" type="button" onClick={resetForm}>Cancel Edit</button>
                            )}
                        </div>
                    </form>
                </motion.article>

                <motion.article className="surface-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="section-title" style={{ marginBottom: '0.7rem' }}>
                        <Wand2 size={16} /> Text Classification Preview
                    </h2>

                    <div className="stack-sm">
                        <input
                            className="input-control"
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value)}
                            placeholder="Type sample text: plastic bottle near market"
                        />
                        <div className="row wrap">
                            <button className="btn-secondary" onClick={handlePreview}>Run Preview</button>
                            <button className="btn-soft" onClick={() => { setPreviewText(''); setPreviewResult(null); }}>Clear</button>
                        </div>
                    </div>

                    {previewResult ? (
                        <div className="surface-card inset" style={{ marginTop: '0.8rem' }}>
                            <div className="stack-sm">
                                <div><strong>Category:</strong> {previewResult.categoryType}</div>
                                <div><strong>Points:</strong> {previewResult.points}</div>
                                <div><strong>Matched Keyword:</strong> {previewResult.matchedKeyword || 'N/A'}</div>
                                <div><strong>Priority:</strong> {previewResult.rulePriority ?? 'N/A'}</div>
                            </div>
                        </div>
                    ) : (
                        <p className="help-text" style={{ marginTop: '0.8rem' }}>
                            Preview results will appear here using your current backend rules.
                        </p>
                    )}
                </motion.article>
            </section>

            <section className="surface-card page-section">
                <div className="row space wrap" style={{ marginBottom: '0.8rem' }}>
                    <h2 className="section-title">Current Rules ({sortedRules.length})</h2>
                    <select
                        className="select-control"
                        style={{ width: '240px' }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Biodegradable">Biodegradable</option>
                        <option value="Recyclable">Recyclable</option>
                        <option value="Non-Biodegradable">Non-Biodegradable</option>
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">Loading rules...</div>
                ) : sortedRules.length === 0 ? (
                    <div className="empty-state">No rules found for this category.</div>
                ) : (
                    <div className="table-shell">
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Category</th>
                                        <th>Keyword</th>
                                        <th>Priority</th>
                                        <th>Points</th>
                                        <th>Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRules.map((rule) => (
                                        <tr key={rule.id}>
                                            <td>{rule.id}</td>
                                            <td>{rule.categoryType}</td>
                                            <td>{rule.keyword}</td>
                                            <td>{rule.priority}</td>
                                            <td>{rule.points}</td>
                                            <td>{rule.active ? <span className="badge success">Yes</span> : <span className="badge danger">No</span>}</td>
                                            <td>
                                                <div className="row wrap">
                                                    <button
                                                        className="btn-ghost"
                                                        onClick={() => {
                                                            setForm({
                                                                id: rule.id,
                                                                categoryType: rule.categoryType,
                                                                keyword: rule.keyword,
                                                                priority: rule.priority,
                                                                points: rule.points,
                                                                active: rule.active,
                                                            });
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button className="btn-danger" onClick={() => handleDelete(rule.id)}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminRules;
