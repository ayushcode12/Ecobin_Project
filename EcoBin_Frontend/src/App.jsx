import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Scan from '@/pages/Scan';
import Leaderboard from '@/pages/Leaderboard';
import AdminReports from '@/pages/AdminReports';
import AdminRules from '@/pages/AdminRules';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminScans from '@/pages/AdminScans';
import AdminContent from '@/pages/AdminContent';
import AdminLogs from '@/pages/AdminLogs';
import AdminSettings from '@/pages/AdminSettings';
import ReportWaste from '@/pages/ReportWaste';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import { ToastProvider } from '@/components/ui/ToastProvider';
import PageTransition from '@/components/layout/PageTransition';

const AppContent = () => {
    const location = useLocation();
    
    return (
        <ToastProvider>
            <Layout>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />

                        <Route
                            path="/dashboard"
                            element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>}
                        />
                        <Route
                            path="/scan"
                            element={<ProtectedRoute><PageTransition><Scan /></PageTransition></ProtectedRoute>}
                        />
                        <Route
                            path="/report"
                            element={<ProtectedRoute><PageTransition><ReportWaste /></PageTransition></ProtectedRoute>}
                        />
                        <Route
                            path="/history"
                            element={<ProtectedRoute><PageTransition><History /></PageTransition></ProtectedRoute>}
                        />
                        <Route
                            path="/leaderboard"
                            element={<ProtectedRoute><PageTransition><Leaderboard /></PageTransition></ProtectedRoute>}
                        />
                        <Route
                            path="/profile"
                            element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>}
                        />

                        <Route
                            path="/admin/dashboard"
                            element={<AdminRoute><PageTransition><AdminDashboard /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/reports"
                            element={<AdminRoute><PageTransition><AdminReports /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/users"
                            element={<AdminRoute><PageTransition><AdminUsers /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/scans"
                            element={<AdminRoute><PageTransition><AdminScans /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/content"
                            element={<AdminRoute><PageTransition><AdminContent /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/rules"
                            element={<AdminRoute><PageTransition><AdminRules /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/logs"
                            element={<AdminRoute><PageTransition><AdminLogs /></PageTransition></AdminRoute>}
                        />
                        <Route
                            path="/admin/settings"
                            element={<AdminRoute><PageTransition><AdminSettings /></PageTransition></AdminRoute>}
                        />
                    </Routes>
                </AnimatePresence>
            </Layout>
        </ToastProvider>
    );
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
        </Router>
    );
}

export default App;
