import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import type { JSX } from 'react';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import FleetManagement from './pages/FleetManagement';
import UserManagement from './pages/UserManagement';
import StaffManagement from './pages/StaffManagement';
import KYCVerifications from './pages/KYCVerifications';
import MaintenanceHub from './pages/MaintenanceHub';
import IssueLogs from './pages/IssueLogs';
import RevenueReports from './pages/RevenueReports';
import UserDashboard from './pages/UserDashboard';
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';
import RideHistory from './pages/RideHistory';
import UserKYC from './pages/UserKYC';
import MyFleet from './pages/manager/MyFleet';
import ManagerOperations from './pages/manager/Operations';
import ServiceInbox from './pages/manager/Maintenance';
import IssueInbox from './pages/manager/IssueInbox';
import KycQueue from './pages/userManager/KycQueue';
import UserDirectory from './pages/userManager/UserDirectory';
import UserManagerDashboard from './pages/userManager/Dashboard';

import { PublicRoute } from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

export default function App(): JSX.Element {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#333', color: '#fff' }
        }} />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<Layout />}>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/marketplace" element={<Marketplace />} />

            {/* ADMIN ONLY */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/fleet" element={<FleetManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/staff" element={<StaffManagement />} />
              <Route path="/admin/kyc" element={<KYCVerifications />} />
              <Route path="/admin/maintenance" element={<MaintenanceHub />} />
              <Route path="/admin/issues" element={<IssueLogs />} />
              <Route path="/admin/revenue" element={<RevenueReports />} />
            </Route>

            {/* VEHICLE MANAGER */}
            <Route element={<ProtectedRoute allowedRoles={['VEHICLE_MANAGER', 'ADMIN']} />}>
              <Route path="/manager/operations" element={<ManagerOperations />} />
              <Route path="/manager/fleet" element={<MyFleet />} />
              <Route path="/manager/maintenance" element={<ServiceInbox />} />
              <Route path="/manager/issues" element={<IssueInbox />} />
            </Route>

            {/* USER MANAGER */}
            <Route element={<ProtectedRoute allowedRoles={['USER_MANAGER', 'ADMIN']} />}>
              <Route path="/user-manager/dashboard" element={<UserManagerDashboard />} />
              <Route path="/user-manager/kyc" element={<KycQueue />} />
              <Route path="/user-manager/directory" element={<UserDirectory />} />
            </Route>

            {/* STANDARD USER */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="/UserDashboard" element={<UserDashboard />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/history" element={<RideHistory />} />
              <Route path="/kyc" element={<UserKYC />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
