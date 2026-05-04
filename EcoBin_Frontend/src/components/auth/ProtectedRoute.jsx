import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateSession, getCurrentUser } from '@/services/api';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkSession = async () => {
            try {
                const response = await getCurrentUser();
                if (!cancelled) {
                    if (response.data) {
                        if (response.data.role === 'ROLE_ADMIN') {
                            // Admins shouldn't be on user protected routes
                            setIsAllowed(false);
                            window.location.href = '/admin/dashboard';
                        } else {
                            setIsAllowed(true);
                        }
                    } else {
                        setIsAllowed(false);
                    }
                    setChecking(false);
                }
            } catch (error) {
                if (!cancelled) {
                    setIsAllowed(false);
                    setChecking(false);
                }
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
