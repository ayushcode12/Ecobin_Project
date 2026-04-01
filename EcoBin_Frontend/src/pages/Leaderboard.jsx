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
                    <h1 className="page-title">Leaderboard</h1>
                    <p className="page-subtitle">Top Eco Warriors making daily impact through scans and responsible reporting.</p>
                </div>
            </section>

            <section className="surface-card page-section">
                {loading ? (
                    <div className="empty-state">Loading rankings...</div>
                ) : users.length === 0 ? (
                    <div className="empty-state">No leaderboard data available yet.</div>
                ) : (
                    <>
                        <div className="podium" style={{ marginBottom: '1rem' }}>
                            {[2, 1, 3].map((position) => {
                                const user = users[position - 1];
                                if (!user) {
                                    return <div key={position} className="podium-card" style={{ opacity: 0.45 }}>Waiting for rank #{position}</div>;
                                }

                                const champion = position === 1;

                                return (
                                    <motion.article
                                        key={position}
                                        className="podium-card"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: position * 0.08 }}
                                        style={{
                                            transform: champion ? 'translateY(-10px)' : 'none',
                                            background: champion
                                                ? 'linear-gradient(165deg, rgba(245,185,65,0.16), rgba(15,27,52,0.82))'
                                                : undefined,
                                        }}
                                    >
                                        {champion ? (
                                            <Trophy size={24} color="#f5b941" style={{ margin: '0 auto 0.35rem' }} />
                                        ) : (
                                            <Medal size={20} color={position === 2 ? '#cbd5e1' : '#fb923c'} style={{ margin: '0 auto 0.35rem' }} />
                                        )}
                                        {renderAvatar(user.name, position)}
                                        <div style={{ fontWeight: 760, marginBottom: '0.2rem' }}>{user.name}</div>
                                        <div className="badge accent" style={{ marginBottom: '0.3rem' }}>#{position}</div>
                                        <div style={{ color: '#7df2c7', fontWeight: 760 }}>{(user.totalPoints || 0).toLocaleString()} pts</div>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => {
                                            const rank = index + 1;
                                            return (
                                                <tr key={`${user.name}-${rank}`}>
                                                    <td style={{ fontWeight: 760 }}>#{rank}</td>
                                                    <td>
                                                        <div className="row">
                                                            <div
                                                                style={{
                                                                    width: '34px',
                                                                    height: '34px',
                                                                    borderRadius: '999px',
                                                                    background: `hsl(${stringToHue(user.name)} 60% 36%)`,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 760,
                                                                }}
                                                            >
                                                                {nameInitial(user.name)}
                                                            </div>
                                                            <span>{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#7df2c7', fontWeight: 760 }}>
                                                        {(user.totalPoints || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {users.length <= 3 && (
                                            <tr>
                                                <td colSpan={3}>
                                                    <div className="empty-state">Keep scanning and reporting to rise in rankings.</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {remaining.length > 0 && (
                            <p className="help-text" style={{ marginTop: '0.65rem' }}>
                                Showing all {users.length} ranked users.
                            </p>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Leaderboard;
