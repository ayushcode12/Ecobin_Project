import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/services/api';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            setLoading(false);
            setIsAdmin(false);
            return;
        }

        const checkAdmin = async () => {
            try {
                const response = await getCurrentUser();
                if (!cancelled) {
                    setIsAdmin(response?.data?.role === 'ROLE_ADMIN');
                }
            } catch (error) {
                if (!cancelled) {
                    setIsAdmin(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        checkAdmin();
        return () => {
            cancelled = true;
        };
    }, [token, location.pathname]);

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#10b981', fontSize: '1.1rem' }}>Checking admin access...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
