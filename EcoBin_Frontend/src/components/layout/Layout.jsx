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
                    <div className="mb-3 flex items-center gap-3">
                        <span className="brand-mark">
                            <Leaf size={20} className="text-emerald-200" />
                        </span>
                        <div>
                            <div className="brand-name">EcoBin</div>
                            <div className="help-text uppercase tracking-[0.18em]">College Project Edition</div>
                        </div>
                    </div>
                    <p className="section-note">
                        Smart waste sorting, field reporting, and community scoring in one product experience. Built to look like a real platform, not just a demo screen.
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
                    <h4 className="footer-title">Features</h4>
                    <ul className="footer-list">
                        <li>Live camera classification with review flow</li>
                        <li>Waste reporting queue for admins</li>
                        <li>Points, streaks, and leaderboard tracking</li>
                        <li>Rule management for project demos and testing</li>
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
                {year} EcoBin. Designed for practical, community-driven waste action and a polished college-project presentation.
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
