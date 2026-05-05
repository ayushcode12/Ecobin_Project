import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy, Search } from 'lucide-react';
import { getLeaderboard } from '@/services/api';

const stringToHue = (value = '') => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
};

const nameInitial = (name) => String(name || '?').charAt(0).toUpperCase();

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await getLeaderboard();
                const sorted = [...(response?.data || [])].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
                setUsers(sorted);
            } catch (error) {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const remaining = useMemo(() => users.slice(3), [users]);

    const renderAvatar = (name, rank) => {
        const hue = stringToHue(name);
        const isChampion = rank === 1;

        return (
            <div
                className="podium-avatar"
                style={{
                    width: isChampion ? '90px' : '76px',
                    height: isChampion ? '90px' : '76px',
                    background: `linear-gradient(140deg, hsl(${hue} 70% 48%), hsl(${(hue + 45) % 360} 72% 35%))`,
                    borderColor: isChampion ? 'rgba(245, 185, 65, 0.72)' : 'rgba(255,255,255,0.28)',
                    boxShadow: isChampion ? '0 0 24px rgba(245, 185, 65, 0.35)' : 'none',
                }}
            >
                {nameInitial(name)}
            </div>
        );
    };

    return (
        <div className="page-shell narrow">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">Eco Rankings</span>
                    <h1 className="page-title">Leaderboard</h1>
                    <p className="page-subtitle">Compete with fellow eco-warriors and climb the ranks by scanning waste and reporting incidents.</p>
                </div>
                <div className="min-w-[280px]">
                    <div className="input-icon-wrap">
                        <Search size={16} className="input-icon" />
                        <input 
                            type="text" 
                            className="input-control" 
                            placeholder="Search warrior..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="surface-card page-section">
                {loading ? (
                    <div className="empty-state">Loading rankings...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">No leaderboard data available yet.</div>
                ) : (
                    <>
                        <div className="podium-grid mb-10">
                            {[2, 1, 3].map((position) => {
                                const user = users[position - 1];
                                if (!user) return <div key={position} className="podium-placeholder">Rank #{position} Empty</div>;

                                const champion = position === 1;

                                return (
                                    <motion.article
                                        key={position}
                                        className={`podium-stand-wrap pos-${position}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: position * 0.1 }}
                                    >
                                        <div className="podium-user-info">
                                            {champion ? (
                                                <Trophy size={28} className="mx-auto mb-2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                            ) : (
                                                <Medal size={22} className={`mx-auto mb-2 ${position === 2 ? 'text-slate-300' : 'text-orange-400'}`} />
                                            )}
                                            {renderAvatar(user.name, position)}
                                            <div className="text-lg font-black text-slate-100 mt-2 truncate w-full">{user.name}</div>
                                            <div className="font-black text-emerald-400 text-lg">{(user.totalPoints || 0).toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">XP</span></div>
                                        </div>
                                        <div className={`podium-bar rank-${position}`}>
                                            <div className="rank-number">#{position}</div>
                                            <div className="badge warning mt-auto mb-4">{user.currentStreak || 0}d Streak</div>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>

                        <div className="table-shell">
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>User</th>
                                            <th>Total Points</th>
                                            <th>Streak</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user, index) => {
                                            const rank = index + 1;
                                            return (
                                                <tr key={`${user.name}-${rank}`} className={user.name === searchQuery ? 'bg-emerald-500/10' : ''}>
                                                    <td className="font-bold">
                                                        <div className="flex items-center gap-2">
                                                            {rank <= 3 ? <Trophy size={14} className={rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : 'text-orange-400'} /> : null}
                                                            #{rank}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="row">
                                                            <div
                                                                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full font-bold"
                                                                style={{ background: `hsl(${stringToHue(user.name)} 60% 36%)` }}
                                                            >
                                                                {nameInitial(user.name)}
                                                            </div>
                                                            <span>{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="font-bold text-emerald-200">{(user.totalPoints || 0).toLocaleString()}</td>
                                                    <td><span className="badge warning">{user.currentStreak || 0}d</span></td>
                                                </tr>
                                            );
                                        })}

                                        {users.length <= 3 && (
                                            <tr>
                                                <td colSpan={4}><div className="empty-state">Keep scanning and reporting to rise in rankings.</div></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {remaining.length > 0 && <p className="help-text mt-3">Showing all {users.length} ranked users.</p>}
                    </>
                )}
            </section>
        </div>
    );
};

export default Leaderboard;
