import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleGuard } from './auth/RoleGuard';
import { AppLayout } from './layouts/AppLayout';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

// Pages (Lazy Loaded)
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CrimeMapPage = React.lazy(() => import('./pages/CrimeMapPage').then(m => ({ default: m.CrimeMapPage })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Predictions = React.lazy(() => import('./pages/Predictions').then(m => ({ default: m.Predictions })));
const PoliceDataRequestPage = React.lazy(() => import('./pages/PoliceDataRequestPage').then(m => ({ default: m.PoliceDataRequestPage })));
const AdminDataRequests = React.lazy(() => import('./pages/AdminDataRequests').then(m => ({ default: m.AdminDataRequests })));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const Datasets = React.lazy(() => import('./pages/Datasets').then(m => ({ default: m.Datasets })));
const ModelPerformance = React.lazy(() => import('./pages/ModelPerformance').then(m => ({ default: m.ModelPerformance })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl space-y-6">
              <LoadingSkeleton type="card" count={3} />
            </div>
          </div>
        }>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request-access" element={
              <div className="min-h-screen bg-slate-950 p-4 md:p-8">
                <PoliceDataRequestPage />
              </div>
            } />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="crime-map" element={<RoleGuard allowedRoles={['ADMIN', 'POLICE', 'USER']}><CrimeMapPage /></RoleGuard>} />
              <Route path="analytics" element={<RoleGuard allowedRoles={['ADMIN', 'POLICE']}><Analytics /></RoleGuard>} />
              <Route path="predictions" element={<RoleGuard allowedRoles={['ADMIN', 'POLICE']}><Predictions /></RoleGuard>} />
              <Route path="model-performance" element={<RoleGuard allowedRoles={['ADMIN', 'POLICE']}><ModelPerformance /></RoleGuard>} />
              <Route path="datasets" element={<RoleGuard allowedRoles={['ADMIN', 'POLICE']}><Datasets /></RoleGuard>} />
              <Route path="reports" element={<Navigate to="/dashboard" replace />} />
              <Route path="data-requests" element={<PoliceDataRequestPage />} />
              <Route path="admin/requests" element={<RoleGuard allowedRoles={['ADMIN']}><AdminDataRequests /></RoleGuard>} />
              <Route path="admin/users" element={<RoleGuard allowedRoles={['ADMIN']}><AdminUsers /></RoleGuard>} />
              <Route path="admin/settings" element={<Navigate to="/admin/requests" replace />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 Wildcard */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};
