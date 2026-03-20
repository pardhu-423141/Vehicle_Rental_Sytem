import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar'; 
import ManagerNavbar from './ManagerNavbar';
import UserManagerNavbar from './UserManagerNavbar'; // Import the new Navbar
import { Menu } from 'lucide-react';

export default function Layout() {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const location = useLocation();

  // Strict routing detection to separate the roles
  const isAdminPage = location.pathname.toLowerCase().includes('/admin');
  const isUserManagerPage = location.pathname.toLowerCase().includes('/user-manager');
  
  // Make sure to only flag Vehicle Manager if it's '/manager' but NOT '/user-manager'
  const isVehicleManagerPage = location.pathname.toLowerCase().includes('/manager') && !isUserManagerPage; 

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col font-sans text-slate-200">
      
      {/* Background Layer */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* Dynamic Navigation Logic */}
      {isAdminPage ? (
        <>
          <AdminSidebar isOpen={isAdminSidebarOpen} setIsOpen={setIsAdminSidebarOpen} />
          <button 
            onClick={() => setIsAdminSidebarOpen(true)}
            className="fixed top-6 left-6 z-40 p-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white hover:bg-white/10 shadow-2xl transition-all active:scale-95 group"
          >
            <Menu size={24} className="group-hover:text-blue-400 transition-colors" />
          </button>
        </>
      ) : isUserManagerPage ? (
        /* Serve Role 2.2: User Manager Navbar */
        <UserManagerNavbar />
      ) : isVehicleManagerPage ? (
        /* Serve Role 2.4: Vehicle Manager Navbar */
        <ManagerNavbar />
      ) : (
        /* Default to Role 2.1: Customer Navbar */
        <Navbar />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="w-full min-h-full flex flex-col items-center pt-24 pb-12 transition-all duration-500">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}