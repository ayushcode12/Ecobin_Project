import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    createRule,
    deleteRule,
    getRules,
    previewClassification,
    updateRule,
} from '@/services/api';
import { BrainCircuit, Plus, Trash2, Wand2 } from 'lucide-react';

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
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [form, setForm] = useState(initialForm);

    const [previewText, setPreviewText] = useState('');
    const [previewResult, setPreviewResult] = useState(null);

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

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            active: !!form.active,
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
        try {
            const response = await previewClassification(previewText);
            setPreviewResult(response?.data || null);
        } catch (err) {
            setError('Preview failed. Enter some text to classify.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1rem' }}
                >
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <BrainCircuit size={28} /> Rule Engine Admin
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Manage keyword rules, priorities, and points without code changes.</p>
                </motion.div>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="glass" style={{ borderRadius: '1rem', padding: '1rem' }}>
                        <h3 style={{ marginBottom: '0.8rem' }}>{form.id ? `Edit Rule #${form.id}` : 'Create Rule'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.7rem' }}>
                            <select
                                value={form.categoryType}
                                onChange={(e) => setField('categoryType', e.target.value)}
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            >
                                <option value="Biodegradable">Biodegradable</option>
                                <option value="Recyclable">Recyclable</option>
                                <option value="Non-Biodegradable">Non-Biodegradable</option>
                            </select>

                            <input
                                value={form.keyword}
                                onChange={(e) => setField('keyword', e.target.value)}
                                placeholder="Keyword (e.g., banana peel)"
                                style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                                <input
                                    type="number"
                                    value={form.priority}
                                    onChange={(e) => setField('priority', e.target.value)}
                                    placeholder="Priority"
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                                />
                                <input
                                    type="number"
                                    value={form.points}
                                    onChange={(e) => setField('points', e.target.value)}
                                    placeholder="Points"
                                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                                />
                            </div>

                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => setField('active', e.target.checked)}
                                />
                                Active
                            </label>

                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                >
                                    <Plus size={16} />
                                    {saving ? 'Saving...' : (form.id ? 'Update Rule' : 'Create Rule')}
                                </button>
                                {form.id && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        style={{ borderRadius: '0.5rem', border: '1px solid #334155', background: 'transparent', color: '#fff', padding: '0.5rem 0.8rem' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="glass" style={{ borderRadius: '1rem', padding: '1rem' }}>
                        <h3 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Wand2 size={17} /> Text Classification Preview
                        </h3>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <input
                                value={previewText}
                                onChange={(e) => setPreviewText(e.target.value)}
                                placeholder="Type sample text: plastic bottle near road..."
                                style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.55rem' }}
                            />
                            <button
                                onClick={handlePreview}
                                style={{ borderRadius: '0.5rem', border: '1px solid #334155', background: 'transparent', color: '#fff', padding: '0.55rem 0.9rem' }}
                            >
                                Test
                            </button>
                        </div>

                        {previewResult && (
                            <div style={{ marginTop: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.6rem', padding: '0.7rem' }}>
                                <div style={{ color: '#e2e8f0' }}><strong>Category:</strong> {previewResult.categoryType}</div>
                                <div style={{ color: '#e2e8f0' }}><strong>Points:</strong> {previewResult.points}</div>
                                <div style={{ color: '#e2e8f0' }}><strong>Matched Keyword:</strong> {previewResult.matchedKeyword}</div>
                                <div style={{ color: '#e2e8f0' }}><strong>Priority:</strong> {previewResult.rulePriority}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass" style={{ borderRadius: '1rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <h3>Current Rules</h3>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.45rem 0.55rem' }}
                        >
                            <option value="">All Categories</option>
                            <option value="Biodegradable">Biodegradable</option>
                            <option value="Recyclable">Recyclable</option>
                            <option value="Non-Biodegradable">Non-Biodegradable</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ color: '#10b981', textAlign: 'center', padding: '1rem' }}>Loading rules...</div>
                    ) : rules.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No rules found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(15,23,42,0.8)', color: '#94a3b8', textAlign: 'left' }}>
                                        <th style={{ padding: '0.7rem' }}>ID</th>
                                        <th style={{ padding: '0.7rem' }}>Category</th>
                                        <th style={{ padding: '0.7rem' }}>Keyword</th>
                                        <th style={{ padding: '0.7rem' }}>Priority</th>
                                        <th style={{ padding: '0.7rem' }}>Points</th>
                                        <th style={{ padding: '0.7rem' }}>Active</th>
                                        <th style={{ padding: '0.7rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map((rule) => (
                                        <tr key={rule.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.7rem' }}>{rule.id}</td>
                                            <td style={{ padding: '0.7rem' }}>{rule.categoryType}</td>
                                            <td style={{ padding: '0.7rem' }}>{rule.keyword}</td>
                                            <td style={{ padding: '0.7rem' }}>{rule.priority}</td>
                                            <td style={{ padding: '0.7rem' }}>{rule.points}</td>
                                            <td style={{ padding: '0.7rem' }}>{rule.active ? 'Yes' : 'No'}</td>
                                            <td style={{ padding: '0.7rem', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setForm({
                                                        id: rule.id,
                                                        categoryType: rule.categoryType,
                                                        keyword: rule.keyword,
                                                        priority: rule.priority,
                                                        points: rule.points,
                                                        active: rule.active,
                                                    })}
                                                    style={{ borderRadius: '0.45rem', border: '1px solid #334155', background: 'transparent', color: '#fff', padding: '0.35rem 0.55rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.id)}
                                                    style={{ borderRadius: '0.45rem', border: '1px solid rgba(239,68,68,0.5)', background: 'transparent', color: '#ef4444', padding: '0.35rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRules;
