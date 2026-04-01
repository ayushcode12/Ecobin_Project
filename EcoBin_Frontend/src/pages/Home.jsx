import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleStartAction = () => {
        if (isAuthenticated) {
            navigate('/scan');
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <div style={{
                paddingTop: '8rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '100vh',
                paddingBottom: '2rem'
            }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    Waste Management <br /> Redefined
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{ maxWidth: '600px', fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}
                >
                    Use AI to identify waste, earn points, and climb the leaderboard.
                    Join the revolution for an eco-friendly future.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginBottom: '6rem' }}
                >
                    <button
                        className="btn-primary"
                        style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}
                        onClick={handleStartAction}
                    >
                        {isAuthenticated ? 'Start Scanning' : 'Login to Start'}
                    </button>
                </motion.div>

                {/* How It Works Section */}
                <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '6rem', textAlign: 'left' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>How EcoBin Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: '1. Scan', desc: 'Take a photo of any waste item using our AI camera.', icon: '📸' },
                            { title: '2. Identify', desc: 'Our smart AI instantly tells you if it is recyclable or biodegradable.', icon: '🤖' },
                            { title: '3. Earn', desc: 'Get points for every correct disposal and climb the leaderboard.', icon: '🏆' }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="glass"
                                style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h3>
                                <p style={{ color: '#94a3b8' }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Impact Statistics */}
                <div style={{
                    width: '100vw',
                    background: 'rgba(16, 185, 129, 0.05)',
                    padding: '4rem 0',
                    marginBottom: '6rem',
                    borderTop: '1px solid rgba(16, 185, 129, 0.1)',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                        {[
                            { label: 'Waste Items Recycled', value: '10,000+' },
                            { label: 'Active Eco Warriors', value: '500+' },
                            { label: 'CO2 Saved', value: '1,200 kg' }
                        ].map((stat, idx) => (
                            <div key={idx} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>{stat.value}</div>
                                <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to make a difference?</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>Join thousands of others in the movement towards a zero-waste lifestyle.</p>
                    <button
                        className="btn-primary"
                        style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
                        onClick={handleStartAction}
                    >
                        Get Started Now
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Home;
