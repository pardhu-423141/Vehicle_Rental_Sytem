import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar.tsx'; // Keeping the extension as per your structure
import { Menu } from 'lucide-react';

export default function Layout() {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const location = useLocation();

  // Detect if the user is on any admin-related route
  const isAdminPage = location.pathname.toLowerCase().includes('admin');

  return (
    /**
     * Parent Container
     * h-screen + overflow-hidden ensures the browser window itself never scrolls.
     * This fixes the "unwanted space" issue at the bottom.
     */
    <div className="relative h-screen w-full overflow-hidden flex flex-col font-sans">
      
      {/* 1. Fixed Background Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        {/* Dark overlay with slight blur for the Glassmorphism effect */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Navigation Logic */}
      {isAdminPage ? (
        <>
          {/* Admin Sidebar - Fully hidden until 'isAdminSidebarOpen' is true */}
          <AdminSidebar isOpen={isAdminSidebarOpen} setIsOpen={setIsAdminSidebarOpen} />
          
          {/* Floating Menu Symbol (Trigger) */}
          <button 
            onClick={() => setIsAdminSidebarOpen(true)}
            className="fixed top-6 left-6 z-40 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 shadow-2xl transition-all active:scale-95 group"
            title="Open Menu"
          >
            <Menu size={24} className="group-hover:text-blue-400 transition-colors" />
          </button>
        </>
      ) : (
        /* Regular Customer Navbar */
        <Navbar />
      )}

      {/* 3. Main Scrollable Content Area */}
      <main className="relative z-10 flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="w-full min-h-full flex flex-col items-center pt-24 pb-12 transition-all duration-500">
          {/* Outlet renders the specific page (Home, Login, AdminDashboard, etc.) 
              Inside this container, your Glass Cards will look perfectly centered.
          */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}