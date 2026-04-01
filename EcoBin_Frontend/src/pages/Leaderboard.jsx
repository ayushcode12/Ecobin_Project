import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '@/services/api';
import { Trophy, Medal, User } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await getLeaderboard();
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>

            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '8rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Leaderboard</h1>
                    <p style={{ color: '#94a3b8' }}>Top Eco Warriors making a difference.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{ borderRadius: '1rem', overflow: 'hidden' }}
                >
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981' }}>Loading Rankings...</div>
                    ) : <>
                        {/* Podium for Top 3 */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem', height: 'auto', paddingTop: '2rem' }}>
                            {/* 2nd Place */}
                            {users.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '200px' }}
                                >
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #64748b', boxShadow: '0 10px 30px -10px rgba(148, 163, 184, 0.5)' }}>
                                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{users[1]?.name?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#64748b', color: 'white', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>#2</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{users[1]?.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{users[1]?.totalPoints} pts</div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {users.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '220px', transform: 'translateY(-20px)' }}
                                >
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #fcd34d, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #b45309', boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)' }}>
                                            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{users[0]?.name?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                                            <Trophy size={40} color="#fbbf24" fill="#fbbf24" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#b45309', color: 'white', fontSize: '0.9rem', fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '1rem', border: '1px solid #fcd34d' }}>#1</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, color: '#fcd34d', fontSize: '1.5rem', marginBottom: '0.25rem', textShadow: '0 2px 10px rgba(245, 158, 11, 0.3)' }}>{users[0]?.name}</div>
                                        <div style={{ color: '#fdba74', fontSize: '1rem', fontWeight: 700 }}>{users[0]?.totalPoints} pts</div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {users.length > 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '200px' }}
                                >
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdba74, #9a3412)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #7c2d12', boxShadow: '0 10px 30px -10px rgba(154, 52, 18, 0.5)' }}>
                                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{users[2]?.name?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#7c2d12', color: 'white', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>#3</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{users[2]?.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{users[2]?.totalPoints} pts</div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Scalable Scrollable List */}
                        <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
                            {/* Sticky Header */}
                            <div style={{
                                display: 'flex',
                                padding: '1rem 2rem',
                                background: 'rgba(30, 41, 59, 0.8)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginTop: '0'
                            }}>
                                <div style={{ width: '15%' }}>Rank</div>
                                <div style={{ width: '55%' }}>User</div>
                                <div style={{ width: '30%', textAlign: 'right' }}>Total Points</div>
                            </div>

                            {/* Scrollable Content */}
                            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                                {users.slice(3).map((user, index) => (
                                    <motion.div
                                        key={index + 3}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="leaderboard-row"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                                            transition: 'background 0.2s',
                                            cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ width: '15%', fontWeight: 700, color: '#64748b', fontSize: '1.1rem' }}>#{index + 4}</div>
                                        <div style={{ width: '55%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `hsl(${Math.random() * 360}, 70%, 20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '1rem' }}>{user.name}</span>
                                        </div>
                                        <div style={{ width: '30%', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
                                            {user.totalPoints.toLocaleString()}
                                        </div>
                                    </motion.div>
                                ))}

                                {users.length <= 3 && (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        Join the movement to see your name here!
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                    }
                </motion.div>
            </div>
        </div>
    );
};

export default Leaderboard;
