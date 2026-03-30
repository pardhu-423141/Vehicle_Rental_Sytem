import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, ShieldCheck, Bell, UserCircle, Activity, LogOut } from 'lucide-react'; // Added LogOut
import { useAuth } from '../context/AuthContext'; // Adjust import path if needed
import toast from 'react-hot-toast';

export default function UserManagerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New state for profile menu
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from context

  // Handle Logout Action
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/auth'); // Or '/login'
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/user-manager/dashboard', icon: Activity },
    { name: 'KYC Queue', path: '/user-manager/kyc', icon: ShieldCheck },
    { name: 'User Directory', path: '/user-manager/directory', icon: Users },
  ];

  const userManagerNotifications = [
    { id: 1, title: 'New KYC Submission', message: 'Aditi Sharma uploaded Aadhaar and Driving License for review.', time: '2m ago', isRead: false, type: 'info' },
    { id: 2, title: 'System Flag', message: 'Kiran Kumar submitted a potentially blurry or invalid document. Manual check required.', time: '15m ago', isRead: false, type: 'warning' },
    { id: 3, title: 'Account Locked', message: 'User ID #4920 locked after 5 failed verification attempts.', time: '2h ago', isRead: true, type: 'urgent' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/user-manager/kyc" className="flex-shrink-0 flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tighter">
              USER<span className="text-purple-500">ADMIN</span>
            </h1>
            <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-purple-500/30 hidden sm:block">
              Staff
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4 relative">
            
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-gray-400 hover:text-white transition relative"
            >
              <Bell size={20} />
              {userManagerNotifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-full mt-4 right-20 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-white font-bold text-sm">KYC Alerts</h3>
                  <button className="text-[10px] text-purple-400 font-bold uppercase tracking-widest hover:text-purple-300 transition-colors">Mark all read</button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {userManagerNotifications.map(notification => (
                    <div key={notification.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer flex gap-3 ${notification.isRead ? 'opacity-60' : ''}`}>
                      <div className="mt-1.5 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.type === 'urgent' ? 'bg-red-500' : 
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-purple-500'
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
              </div>
            )}

            {/* --- UPDATED DYNAMIC PROFILE SECTION --- */}
            <div className="relative flex items-center pl-4 border-l border-white/10 ml-2">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 text-left focus:outline-none group"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-none group-hover:text-purple-300 transition-colors">
                    {user?.name || 'Manager'}
                  </p>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">
                    User Mgr
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30 transition-all">
                  <UserCircle size={24} />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-6 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
            {/* -------------------------------------- */}

          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}