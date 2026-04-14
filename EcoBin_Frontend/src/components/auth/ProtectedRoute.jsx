import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateSession } from '@/services/api';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkSession = async () => {
            const valid = await validateSession();
            if (!cancelled) {
                setIsAllowed(valid);
                setChecking(false);
            }
        };

        checkSession();
        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    if (checking) {
        return (
            <div className="page-shell compact">
                <div className="surface-card empty-state">Checking session...</div>
            </div>
        );
    }

    if (!isAllowed) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
