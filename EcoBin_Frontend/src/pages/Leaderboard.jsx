import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy } from 'lucide-react';
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
                    <span className="section-kicker mb-4">Points, Ranking, Recognition</span>
                    <h1 className="page-title">Leaderboard</h1>
                    <p className="page-subtitle">Top Eco Warriors making daily impact through live scans, responsible reporting, and consistent community activity.</p>
                </div>
            </section>

            <section className="surface-card page-section">
                {loading ? (
                    <div className="empty-state">Loading rankings...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">No leaderboard data available yet.</div>
                ) : (
                    <>
                        <div className="podium mb-4">
                            {[2, 1, 3].map((position) => {
                                const user = users[position - 1];
                                if (!user) {
                                    return <div key={position} className="podium-card opacity-45">Waiting for rank #{position}</div>;
                                }

                                const champion = position === 1;

                                return (
                                    <motion.article
                                        key={position}
                                        className={`podium-card ${champion ? '-translate-y-2 bg-gradient-to-br from-amber-500/20 to-slate-900/85' : ''}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: position * 0.08 }}
                                    >
                                        {champion ? (
                                            <Trophy size={24} className="mx-auto mb-1.5 text-amber-300" />
                                        ) : (
                                            <Medal size={20} className={`mx-auto mb-1.5 ${position === 2 ? 'text-slate-300' : 'text-orange-400'}`} />
                                        )}
                                        {renderAvatar(user.name, position)}
                                        <div className="mb-1 font-bold">{user.name}</div>
                                        <div className="badge accent mb-1">#{position}</div>
                                        <div className="font-bold text-emerald-200">{(user.totalPoints || 0).toLocaleString()} pts</div>
                                        <div className="badge warning mt-2">{user.currentStreak || 0}-day streak</div>
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
                                        {users.map((user, index) => {
                                            const rank = index + 1;
                                            return (
                                                <tr key={`${user.name}-${rank}`}>
                                                    <td className="font-bold">#{rank}</td>
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
