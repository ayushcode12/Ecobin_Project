import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="glass" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 50
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf color="#10b981" size={28} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>EcoBin</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}>Home</Link>
                <Link to="/scan" style={{ color: '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}>Scan</Link>
                <Link to="/leaderboard" style={{ color: '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}>Leaderboard</Link>
                <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Get Started</button>
            </div>
        </nav>
    );
};

export default Navbar;
