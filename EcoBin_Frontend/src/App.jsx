import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Scan from '@/pages/Scan';
import Leaderboard from '@/pages/Leaderboard';
import AdminReports from '@/pages/AdminReports';
import AdminRules from '@/pages/AdminRules';
import ReportWaste from '@/pages/ReportWaste';
import History from '@/pages/History';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                        path="/admin/reports"
                        element={<AdminRoute><AdminReports /></AdminRoute>}
                    />
                    <Route
                        path="/admin/rules"
                        element={<AdminRoute><AdminRules /></AdminRoute>}
                    />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
