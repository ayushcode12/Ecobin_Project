import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Navbar from './Navbar';
import CustomCursor from '../ui/CustomCursor';

const Layout = ({ children }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 50, stiffness: 300 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            document.documentElement.style.setProperty('--x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="app-container overflow-hidden">
            <CustomCursor />
            
            {/* Immersive HUD Background Elements */}
            <div className="bg-grid" />
            <div className="bg-orb left" />
            <div className="bg-orb right" />
            
            {/* Reactive Glow */}
            <motion.div 
                className="fixed inset-0 pointer-events-none -z-10 opacity-30"
                style={{
                    background: `radial-gradient(600px circle at var(--x) var(--y), rgba(104, 213, 163, 0.08), transparent 80%)`
                }}
            />
            
            {/* Dynamic Interactive Glow */}
            <motion.div 
                className="fixed inset-0 pointer-events-none -z-20 opacity-20"
                style={{
                    background: `radial-gradient(1000px circle at ${springX}px ${springY}px, rgba(120, 198, 240, 0.05), transparent 70%)`,
                    translateX: useSpring(useMotionValue(0), springConfig),
                    translateY: useSpring(useMotionValue(0), springConfig),
                }}
            />

            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
