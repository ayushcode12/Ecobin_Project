import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    const springConfig = { damping: 25, stiffness: 250 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleHoverStart = (e) => {
            const target = e.target;
            if (
                target.tagName === 'BUTTON' || 
                target.tagName === 'A' || 
                target.closest('button') || 
                target.closest('a') ||
                target.getAttribute('role') === 'button'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHoverStart);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHoverStart);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* Central Dot */}
            <motion.div 
                className="cursor-dot hidden md:block"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%'
                }}
            />

            {/* Trailing Outline */}
            <motion.div 
                className={`cursor-outline hidden md:flex ${isHovering ? 'interactive-active' : ''}`}
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%'
                }}
            >
                {isHovering && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="cursor-status"
                    >
                        Target_Locked
                    </motion.div>
                )}
            </motion.div>
        </>
    );
};

export default CustomCursor;
