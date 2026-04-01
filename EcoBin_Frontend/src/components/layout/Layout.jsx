import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Leaf, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            background: 'rgba(15, 23, 42, 0.62)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '2.4rem 1.6rem',
            marginTop: 'auto'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.6rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <Leaf color="#10b981" size={23} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>EcoBin</span>
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: 1.55, fontSize: '0.92rem' }}>
                        Empowering communities to sort waste better and keep streets cleaner through daily classification.
                    </p>
                </div>

                <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.8rem' }}>Platform</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <li><Link to="/" style={{ color: 'inherit' }}>Home</Link></li>
                        <li><Link to="/scan" style={{ color: 'inherit' }}>Scan</Link></li>
                        <li><Link to="/history" style={{ color: 'inherit' }}>History</Link></li>
                        <li><Link to="/leaderboard" style={{ color: 'inherit' }}>Leaderboard</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.8rem' }}>Connect</h4>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <a href="#" aria-label="Github" style={{ color: '#94a3b8', padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}><Github size={18} /></a>
                        <a href="#" aria-label="Twitter" style={{ color: '#94a3b8', padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}><Twitter size={18} /></a>
                        <a href="#" aria-label="LinkedIn" style={{ color: '#94a3b8', padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' }}><Linkedin size={18} /></a>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.8rem', paddingTop: '1.3rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#64748b', fontSize: '0.85rem' }}>
                {year} EcoBin. All rights reserved. Built with care for cleaner cities.
            </div>
        </footer>
    );
};

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'fixed',
                top: '-8%',
                left: '-8%',
                width: '48vw',
                height: '48vw',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(56px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '-10%',
                right: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.17) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(58px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
