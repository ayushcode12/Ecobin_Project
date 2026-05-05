import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    UserMinus, 
    RotateCcw, 
    ShieldCheck, 
    ShieldX,
    RefreshCcw,
    Mail,
    Calendar,
    Trophy
} from 'lucide-react';
import { getAllUsers, updateUserStatus, resetUserScore, deleteUserByAdmin } from '@/services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load user list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handleToggleStatus = async (userId, currentStatus) => {
        setActionLoading(userId);
        try {
            await updateUserStatus(userId, !currentStatus);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: !currentStatus } : u));
        } catch (err) {
            alert('Failed to update user status.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetScore = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s points and streaks to zero?')) return;
        
        setActionLoading(userId);
        try {
            await resetUserScore(userId);
            alert('User score reset successfully.');
        } catch (err) {
            alert('Failed to reset score.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('CRITICAL: This will permanently delete the user account. Proceed?')) return;

        setActionLoading(userId);
        try {
            await deleteUserByAdmin(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="page-shell narrow flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-blue-400 font-bold">Scanning User Directory...</div>
        </div>;
    }

    return (
        <div className="page-shell space-y-6">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Identity Management</span>
                    <h1 className="page-title"><Users size={28} className="mr-3 inline-block" />User Management</h1>
                    <p className="page-subtitle">Monitor accounts, moderate behavior, and manage eco-performance scores.</p>
                </div>
                <button className="btn-ghost" onClick={fetchUsers}><RefreshCcw size={15} /> Refresh</button>
            </section>

            {error && <div className="alert error">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="surface-card p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Citizens</div>
                        <div className="text-2xl font-black text-white">{users.length}</div>
                    </div>
                </div>
                <div className="surface-card p-6 flex items-center gap-4 border-emerald-500/10 bg-emerald-500/[0.02]">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Accounts</div>
                        <div className="text-2xl font-black text-white">{users.filter(u => u.enabled).length}</div>
                    </div>
                </div>
                <div className="surface-card p-6 flex items-center gap-4 border-amber-500/10 bg-amber-500/[0.02]">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Elite Warriors</div>
                        <div className="text-2xl font-black text-white">{users.filter(u => (u.points || 0) > 500).length}</div>
                    </div>
                </div>
            </div>

            <div className="surface-card p-2 border-white/5 bg-white/[0.02] shadow-inner mb-6">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by identity or email sequence..." 
                        className="input-control border-transparent bg-transparent pl-14 py-4 text-sm font-medium focus:bg-white/[0.02]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="stack-md">
                {filteredUsers.length === 0 ? (
                    <div className="surface-card p-12 text-center text-slate-500">No users match your criteria.</div>
                ) : (
                    filteredUsers.map((user) => (
                        <motion.article 
                            key={user.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="surface-card overflow-hidden"
                        >
                            <div className="row wrap space p-5 gap-6">
                                <div className="row gap-5 flex-1 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="h-14 w-14 rounded-[20px] bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${user.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </div>
                                    <div className="stack-xs min-w-0">
                                        <div className="row gap-3">
                                            <h3 className="text-[17px] font-black text-white truncate">{user.name}</h3>
                                            <div className="flex gap-1.5">
                                                {user.role === 'ROLE_ADMIN' && <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Admin</span>}
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${user.enabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {user.enabled ? 'Verified' : 'Suspended'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-500">
                                            <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-600" /> {user.email}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-600" /> Registered {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="row gap-2.5">
                                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                                        <button 
                                            className={`p-2.5 rounded-lg transition-all ${user.enabled ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}
                                            title={user.enabled ? 'Suspend Account' : 'Reactivate Account'}
                                            onClick={() => handleToggleStatus(user.id, user.enabled)}
                                            disabled={actionLoading === user.id}
                                        >
                                            {user.enabled ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
                                        </button>
                                        <button 
                                            className="p-2.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                                            title="Reset Progress"
                                            onClick={() => handleResetScore(user.id)}
                                            disabled={actionLoading === user.id}
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button 
                                            className={`p-2.5 rounded-lg transition-all ${user.role === 'ROLE_ADMIN' ? 'opacity-20 cursor-not-allowed' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'}`}
                                            title="Terminate Identity"
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={actionLoading === user.id || user.role === 'ROLE_ADMIN'}
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
