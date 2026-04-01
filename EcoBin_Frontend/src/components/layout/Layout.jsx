import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Leaf, Linkedin, Twitter } from 'lucide-react';
import Navbar from './Navbar';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <Leaf size={22} className="text-emerald-300" />
                        <span className="footer-title mb-0">EcoBin</span>
                    </div>
                    <p className="section-note">
                        Built to help communities classify waste correctly, report roadside waste faster, and drive cleaner neighborhoods together.
                    </p>
                </div>

                <div>
                    <h4 className="footer-title">Platform</h4>
                    <ul className="footer-list">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/scan">Scan</Link></li>
                        <li><Link to="/history">History</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="footer-title">Community</h4>
                    <div className="row wrap mb-3">
                        <a className="btn-soft" href="https://github.com/ayushcode12/Ecobin_Project" target="_blank" rel="noreferrer" aria-label="GitHub">
                            <Github size={16} /> GitHub
                        </a>
                        <a className="btn-soft" href="#" aria-label="Twitter">
                            <Twitter size={16} /> Twitter
                        </a>
                        <a className="btn-soft" href="#" aria-label="LinkedIn">
                            <Linkedin size={16} /> LinkedIn
                        </a>
                    </div>
                    <p className="help-text">Track progress, share impact, and keep the clean-city momentum going.</p>
                </div>
            </div>
            <div className="footer-note">
                {year} EcoBin. Designed for practical, community-driven waste action.
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
