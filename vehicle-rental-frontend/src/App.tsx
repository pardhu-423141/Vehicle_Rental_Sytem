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
        </Route>
      </Routes>
    </Router>
  );
}