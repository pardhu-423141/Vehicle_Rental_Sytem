import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  Car, 
  LayoutDashboard, 
  History, 
  ShieldCheck,
  Bell,
  User
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Links based on User Workflow
  const navLinks = [
    { name: 'Dashboard', path: '/UserDashboard', icon: LayoutDashboard },
    { name: 'Rent a Ride', path: '/marketplace', icon: Car }, // Step 3
    { name: 'My Trips', path: '/history', icon: History }, // Step 8
    { name: 'KYC Status', path: '/kyc', icon: ShieldCheck }, // Step 2
  ];

  // Mock Notifications Data
  const mockNotifications = [
    { id: 1, title: 'Identity Verified', message: 'Your KYC is approved. You can now book vehicles.', time: '2m ago', isRead: false, type: 'success' },
    { id: 2, title: 'Upcoming Ride', message: 'Your Tata Nexon EV rental starts tomorrow at 10:00 AM.', time: '2h ago', isRead: false, type: 'info' },
    { id: 3, title: 'Return Reminder', message: 'Your rental for Suzuki Swift ended successfully. View receipt.', time: '1d ago', isRead: true, type: 'system' },
  ];

  // Ola/Uber style search interceptor
  const handleSearchClick = () => {
    if (location.pathname !== '/marketplace') {
      navigate('/marketplace');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          {/* 1. Logo */}
          <Link to="/UserDashboard" className="flex-shrink-0 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white italic tracking-tighter">
              DRIVE<span className="text-blue-500">RENTALS</span>
            </h1>
          </Link>

          {/* 2. Ola-Style Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div 
              onClick={handleSearchClick}
              className="relative group cursor-text"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                readOnly={location.pathname !== '/marketplace'}
                placeholder="Search for Bikes, Autos, SUVs..."
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 hover:border-blue-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-text shadow-inner"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <span className="bg-white/10 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest hidden lg:block">
                  Find Ride
                </span>
              </div>
            </div>
          </div>

          {/* 3. Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* 4. User Profile & Notifications */}
          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-4 lg:pl-8 relative">
            
            {/* Bell Button */}
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition relative"
            >
              <Bell size={20} />
              {mockNotifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute top-full mt-4 right-20 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-white font-bold text-sm">Notifications</h3>
                  <button className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">Mark all read</button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {mockNotifications.map(notification => (
                    <div key={notification.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer flex gap-3 ${notification.isRead ? 'opacity-60' : ''}`}>
                      <div className="mt-1.5 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-500' : 
                          notification.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 text-center bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <span className="text-xs text-gray-300 font-bold">View All Notifications</span>
                </div>
              </div>
            )}

            {/* User Profile Pill */}
            <button className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-full transition group ml-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
                HJ
              </div>
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition">Hruthwik</span>
            </button>
          </div>

          {/* 5. Mobile Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={handleSearchClick}
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/10 md:hidden"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 border-b border-white/10 bg-black/40 backdrop-blur-2xl' : 'max-h-0'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            );
          })}
          
          {/* Mobile Notifications Quick Link */}
          <button className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all">
            <div className="flex items-center gap-3">
              <Bell size={18} />
              Notifications
            </div>
            {mockNotifications.some(n => !n.isRead) && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">New</span>
            )}
          </button>

          {/* Mobile User Section */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              HJ
            </div>
            <div>
              <p className="text-white font-bold text-sm">Hruthwik Jayanth</p>
              <p className="text-blue-400 text-xs">View Profile</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}