import React from 'react';

export const SkeletonCard = ({ className = '', height = '200px' }) => {
    return (
        <div 
            className={`skeleton-root ${className}`} 
            style={{ height }}
        >
            <div className="skeleton-grid" />
            <div className="skeleton-shimmer" />
            
            {/* HUD technical accents */}
            <div className="absolute top-2 left-2 w-4 h-[1px] bg-white/10" />
            <div className="absolute top-2 left-2 w-[1px] h-4 bg-white/10" />
            <div className="absolute bottom-2 right-2 w-4 h-[1px] bg-white/10" />
            <div className="absolute bottom-2 right-2 w-[1px] h-4 bg-white/10" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-white/5 uppercase tracking-[0.4em]">
                Diagnostic_Boot...
            </div>
        </div>
    );
};

export const SkeletonText = ({ className = '', width = '100%', height = '12px' }) => {
    return (
        <div 
            className={`skeleton-root rounded-full ${className}`} 
            style={{ width, height }}
        >
            <div className="skeleton-shimmer" />
        </div>
    );
};

export const SkeletonCircle = ({ size = '48px', className = '' }) => {
    return (
        <div 
            className={`skeleton-root rounded-full ${className}`} 
            style={{ width: size, height: size }}
        >
            <div className="skeleton-shimmer" />
        </div>
    );
};
