import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ToastProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route
                            path="/dashboard"
                            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                        />
                        <Route
                            path="/scan"
                            element={<ProtectedRoute><Scan /></ProtectedRoute>}
                        />
                        <Route
                            path="/report"
                            element={<ProtectedRoute><ReportWaste /></ProtectedRoute>}
                        />
                        <Route
                            path="/history"
                            element={<ProtectedRoute><History /></ProtectedRoute>}
                        />
                        <Route
                            path="/leaderboard"
                            element={<ProtectedRoute><Leaderboard /></ProtectedRoute>}
                        />
                        <Route
                            path="/profile"
                            element={<ProtectedRoute><Profile /></ProtectedRoute>}
                        />

                        <Route
                            path="/admin/dashboard"
                            element={<AdminRoute><AdminDashboard /></AdminRoute>}
                        />
                        <Route
                            path="/admin/reports"
                            element={<AdminRoute><AdminReports /></AdminRoute>}
                        />
                        <Route
                            path="/admin/users"
                            element={<AdminRoute><AdminUsers /></AdminRoute>}
                        />
                        <Route
                            path="/admin/scans"
                            element={<AdminRoute><AdminScans /></AdminRoute>}
                        />
                        <Route
                            path="/admin/content"
                            element={<AdminRoute><AdminContent /></AdminRoute>}
                        />
                        <Route
                            path="/admin/rules"
                            element={<AdminRoute><AdminRules /></AdminRoute>}
                        />
                        <Route
                            path="/admin/logs"
                            element={<AdminRoute><AdminLogs /></AdminRoute>}
                        />
                        <Route
                            path="/admin/settings"
                            element={<AdminRoute><AdminSettings /></AdminRoute>}
                        />
                    </Routes>
                </Layout>
            </ToastProvider>
        </Router>
    );
}

export default App;
