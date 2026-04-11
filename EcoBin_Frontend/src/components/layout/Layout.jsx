import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Leaf } from 'lucide-react';
import Navbar from './Navbar';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="brand-mark">
                            <Leaf size={20} className="text-emerald-200" />
                        </span>
                        <div>
                            <div className="brand-name">EcoBin</div>
                            <div className="help-text uppercase tracking-[0.18em]">Gamified Waste Sorting</div>
                        </div>
                    </div>
                    <p className="section-note">
                        Live scan, report issues, build streaks.
                    </p>
                </div>

                <div>
                    <h4 className="footer-title">Play</h4>
                    <ul className="footer-list">
                        <li><Link to="/scan">Scan Mode</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/leaderboard">Leaderboard</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-title">Action</h4>
                    <ul className="footer-list">
                        <li><Link to="/report">Report Waste</Link></li>
                        <li><Link to="/history">History</Link></li>
                        <li>
                            <a href="https://github.com/ayushcode12/Ecobin_Project" target="_blank" rel="noreferrer">
                                GitHub
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-note">
                {year} EcoBin.
            </div>
        </footer>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="app-shell">
            <div className="bg-grid" />
            <div className="bg-orb left" />
            <div className="bg-orb right" />

            <Navbar />
            <main className="app-main">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
