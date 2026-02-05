import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <div style={{
                paddingTop: '8rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: '100vh'
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
                >
                    <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>Start Scanning</button>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
