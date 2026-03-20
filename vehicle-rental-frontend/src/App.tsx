import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import type { JSX } from 'react';

// Import Components & Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard'; // Import the new admin page
import FleetManagement from './pages/FleetManagement';
import UserManagement from './pages/UserManagement';
import StaffManagement from './pages/StaffManagement';
import KYCVerifications from './pages/KYCVerifications';
import MaintenanceHub from './pages/MaintenanceHub';
import IssueLogs from './pages/IssueLogs';
import UserDashboard from './pages/UserDashboard';
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';
import RideHistory from './pages/RideHistory';
import UserKYC from './pages/UserKYC';
import MyFleet from './pages/manager/MyFleet';
import ManagerOperations from './pages/manager/Operations';
import ServiceInbox from './pages/manager/Maintenance';
import KycQueue from './pages/userManager/KycQueue';
import UserDirectory from './pages/userManager/UserDirectory';


export default function App(): JSX.Element {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ 
        style: { background: '#333', color: '#fff' } 
      }} />
      
      <Routes>
        {/* Everything inside this Layout route will have the glassmorphism background and Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Typing localhost:5173/AdminDashboard will now render this component */}
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/kyc" element={<KYCVerifications />} />
          <Route path="/admin/maintenance" element={<MaintenanceHub />} />
          <Route path="/admin/issues" element={<IssueLogs />} />
          <Route path="/UserDashboard" element={<UserDashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/history" element={<RideHistory />} />
          <Route path="/kyc" element={<UserKYC />} />
          <Route path="/manager/operations" element={<ManagerOperations />} />
          <Route path="/manager/fleet" element={<MyFleet />} />
          <Route path="/manager/maintenance" element={<ServiceInbox />} />
          <Route path="/user-manager/kyc" element={<KycQueue />} />
          <Route path="/user-manager/directory" element={<UserDirectory />} />
        </Route>
      </Routes>
    </Router>
  );
}