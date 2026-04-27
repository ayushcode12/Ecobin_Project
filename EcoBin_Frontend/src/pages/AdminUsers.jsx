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

            <div className="surface-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="input-control pl-12 py-3"
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
                            <div className="row wrap space p-6 gap-6">
                                <div className="row gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xl font-bold text-slate-100">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="stack-xs min-w-0">
                                        <div className="row gap-2">
                                            <h3 className="text-lg font-black text-slate-100 truncate">{user.name}</h3>
                                            {user.role === 'ROLE_ADMIN' && <span className="badge warning scale-75">Admin</span>}
                                            {user.enabled ? (
                                                <span className="badge approved scale-75">Active</span>
                                            ) : (
                                                <span className="badge rejected scale-75">Disabled</span>
                                            )}
                                        </div>
                                        <div className="row gap-4 text-xs text-slate-400">
                                            <span className="row gap-1"><Mail size={12} /> {user.email}</span>
                                            <span className="row gap-1"><Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="row gap-3">
                                    <button 
                                        className={`btn-soft ${user.enabled ? 'text-red-400' : 'text-emerald-400'}`}
                                        title={user.enabled ? 'Disable Account' : 'Enable Account'}
                                        onClick={() => handleToggleStatus(user.id, user.enabled)}
                                        disabled={actionLoading === user.id}
                                    >
                                        {user.enabled ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                                        <span className="hidden sm:inline">{user.enabled ? 'Disable' : 'Enable'}</span>
                                    </button>

                                    <button 
                                        className="btn-soft text-amber-400"
                                        title="Reset Score"
                                        onClick={() => handleResetScore(user.id)}
                                        disabled={actionLoading === user.id}
                                    >
                                        <RotateCcw size={16} />
                                        <span className="hidden sm:inline">Reset Score</span>
                                    </button>

                                    <button 
                                        className="btn-soft text-red-500 hover:bg-red-500/10"
                                        title="Delete User"
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={actionLoading === user.id || user.role === 'ROLE_ADMIN'}
                                    >
                                        <UserMinus size={16} />
                                    </button>
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
