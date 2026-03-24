import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Menu, X, Car, LayoutDashboard, 
  History, ShieldCheck, Bell, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Rent a Ride', path: '/marketplace', icon: Car },
    { name: 'My Trips', path: '/history', icon: History },
    { name: 'KYC Status', path: '/kyc', icon: ShieldCheck },
  ];

  const handleSearchClick = () => {
    if (location.pathname !== '/marketplace') {
      navigate('/marketplace');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20 transition-all duration-500">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 relative">
          
          {/* 1. Logo Section */}
          <div className={`flex items-center transition-all duration-700 ease-in-out ${
            user ? 'w-auto' : 'w-full justify-center'
          }`}>
            <Link to="/" className="flex items-center gap-2 group">
              <h1 className="text-2xl font-black text-white italic tracking-tighter transition-all">
                DRIVE<span className="text-blue-500 group-hover:text-blue-400 transition-colors">RENTALS</span>
              </h1>
            </Link>
          </div>

          {/* 2. Authenticated Content */}
          {user && (
            <>
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl hidden md:block mx-8 animate-in fade-in slide-in-from-left-4 duration-700">
                <div onClick={handleSearchClick} className="relative group cursor-text">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    readOnly={location.pathname !== '/marketplace'}
                    placeholder="Search for Bikes, Autos, SUVs..."
                    className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1 animate-in fade-in duration-700">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <link.icon size={16} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* User Controls */}
              <div className="flex items-center gap-3 border-l border-white/10 ml-4 pl-4 lg:pl-8 animate-in fade-in slide-in-from-right-4 duration-700">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition relative hidden md:block"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                </button>

                {/* Profile Pill */}
                <button className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-full transition group">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-blue-400 transition hidden sm:inline">
                    {user?.name || 'Operator'}
                  </span>
                </button>

                {/* 🔥 Desktop Logout Button */}
                <button 
                  onClick={logout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && (
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] border-b border-white/10 bg-black/80 backdrop-blur-2xl' : 'max-h-0'
        }`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold text-gray-300 hover:text-white"
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Operator</p>
                </div>
              </div>

              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}