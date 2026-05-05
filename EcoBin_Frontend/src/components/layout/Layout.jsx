import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <div className="bg-grid" />
            <div className="bg-orb left" />
            <div className="bg-orb right" />
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
