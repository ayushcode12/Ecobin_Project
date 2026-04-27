import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FileText, 
    Plus, 
    Trash2, 
    Megaphone, 
    Lightbulb, 
    RefreshCcw,
    Send,
    Tag
} from 'lucide-react';
import { 
    getAllTips, createTip, deleteTip, 
    getAllAnnouncements, createAnnouncement, deleteAnnouncement 
} from '@/services/api';

const AdminContent = () => {
    const [tips, setTips] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tips');
    
    const [newTip, setNewTip] = useState({ title: '', content: '', category: 'General' });
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', active: true });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tipsRes, annRes] = await Promise.all([getAllTips(), getAllAnnouncements()]);
            setTips(tipsRes.data);
            setAnnouncements(annRes.data);
        } catch (err) {
            console.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTip = async (e) => {
        e.preventDefault();
        try {
            await createTip(newTip);
            setNewTip({ title: '', content: '', category: 'General' });
            fetchData();
        } catch (err) { alert('Failed to create tip'); }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await createAnnouncement(newAnnouncement);
            setNewAnnouncement({ title: '', message: '', active: true });
            fetchData();
        } catch (err) { alert('Failed to create announcement'); }
    };

    const handleDeleteTip = async (id) => {
        if (!window.confirm('Delete this tip?')) return;
        try { await deleteTip(id); fetchData(); } catch (err) { alert('Failed to delete'); }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try { await deleteAnnouncement(id); fetchData(); } catch (err) { alert('Failed to delete'); }
    };

    if (loading) return <div className="page-shell narrow flex items-center justify-center min-h-[50vh] animate-pulse">Loading Content...</div>;

    return (
        <div className="page-shell space-y-6">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Awareness & Engagement</span>
                    <h1 className="page-title"><FileText size={28} className="mr-3 inline-block" />Content Management</h1>
                    <p className="page-subtitle">Publish ecological tips and broadcast system-wide announcements.</p>
                </div>
                <button className="btn-ghost" onClick={fetchData}><RefreshCcw size={15} /> Refresh</button>
            </section>

            <div className="row gap-4 border-b border-white/5 pb-1">
                <button 
                    className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'tips' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('tips')}
                >
                    Eco Tips
                </button>
                <button 
                    className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === 'announcements' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    Announcements
                </button>
            </div>

            <div className="grid-2-1 gap-8">
                {/* List Column */}
                <div className="stack-md">
                    {activeTab === 'tips' ? (
                        tips.map(tip => (
                            <motion.article key={tip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-5 row space">
                                <div className="stack-xs">
                                    <div className="row gap-2">
                                        <Lightbulb size={16} className="text-emerald-400" />
                                        <h4 className="font-bold text-slate-100">{tip.title}</h4>
                                        <span className="badge brand scale-75">{tip.category}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{tip.content}</p>
                                </div>
                                <button className="btn-icon text-red-400" onClick={() => handleDeleteTip(tip.id)}><Trash2 size={16} /></button>
                            </motion.article>
                        ))
                    ) : (
                        announcements.map(ann => (
                            <motion.article key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-5 row space">
                                <div className="stack-xs">
                                    <div className="row gap-2">
                                        <Megaphone size={16} className="text-blue-400" />
                                        <h4 className="font-bold text-slate-100">{ann.title}</h4>
                                        {!ann.active && <span className="badge rejected scale-75">Inactive</span>}
                                    </div>
                                    <p className="text-sm text-slate-400">{ann.message}</p>
                                </div>
                                <button className="btn-icon text-red-400" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 size={16} /></button>
                            </motion.article>
                        ))
                    )}
                    {((activeTab === 'tips' && tips.length === 0) || (activeTab === 'announcements' && announcements.length === 0)) && (
                        <div className="surface-card p-12 text-center text-slate-500">No content found in this category.</div>
                    )}
                </div>

                {/* Form Column */}
                <aside className="stack-md">
                    <div className="surface-card p-6 border-white/5 bg-white/[0.02]">
                        <h3 className="section-title mb-6">
                            {activeTab === 'tips' ? 'Add New Eco Tip' : 'New Announcement'}
                        </h3>
                        
                        {activeTab === 'tips' ? (
                            <form className="stack-md" onSubmit={handleCreateTip}>
                                <div className="stack-xs">
                                    <label className="input-label">Tip Title</label>
                                    <input 
                                        className="input-control" 
                                        required 
                                        value={newTip.title}
                                        onChange={e => setNewTip({...newTip, title: e.target.value})}
                                    />
                                </div>
                                <div className="stack-xs">
                                    <label className="input-label">Category</label>
                                    <select 
                                        className="input-control"
                                        value={newTip.category}
                                        onChange={e => setNewTip({...newTip, category: e.target.value})}
                                    >
                                        <option>General</option>
                                        <option>Recycling</option>
                                        <option>Energy</option>
                                        <option>Water</option>
                                    </select>
                                </div>
                                <div className="stack-xs">
                                    <label className="input-label">Content</label>
                                    <textarea 
                                        className="input-control min-h-[100px]" 
                                        required
                                        value={newTip.content}
                                        onChange={e => setNewTip({...newTip, content: e.target.value})}
                                    />
                                </div>
                                <button className="btn-primary w-full"><Plus size={16} /> Publish Tip</button>
                            </form>
                        ) : (
                            <form className="stack-md" onSubmit={handleCreateAnnouncement}>
                                <div className="stack-xs">
                                    <label className="input-label">Announcement Title</label>
                                    <input 
                                        className="input-control" 
                                        required
                                        value={newAnnouncement.title}
                                        onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                                    />
                                </div>
                                <div className="stack-xs">
                                    <label className="input-label">Message</label>
                                    <textarea 
                                        className="input-control min-h-[100px]" 
                                        required
                                        value={newAnnouncement.message}
                                        onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                                    />
                                </div>
                                <button className="btn-primary w-full bg-blue-600 border-blue-500"><Send size={16} /> Broadcast</button>
                            </form>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AdminContent;
