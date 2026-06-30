import { useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, ShieldCheck, Bell, UserCircle, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function UserManagerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useSocket();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/user-manager/dashboard', icon: Activity },
    { name: 'KYC Queue', path: '/user-manager/kyc', icon: ShieldCheck },
    { name: 'User Directory', path: '/user-manager/directory', icon: Users },
  ];

  const typeColor = (type: string) => {
    if (type === 'kyc') return 'bg-purple-500';
    if (type === 'issue') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const formatTime = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

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
            {navLinks.map(link => {
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

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
                className="p-2 text-gray-400 hover:text-white transition relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-full mt-3 right-0 w-[360px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <Bell size={14} className="text-purple-400" /> KYC Alerts
                      {unreadCount > 0 && (
                        <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full border border-red-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-purple-400 font-bold uppercase tracking-widest hover:text-purple-300 transition">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={28} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm">All clear — no new alerts</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer flex gap-3 ${n.isRead ? 'opacity-60' : 'bg-white/[0.02]'}`}
                        >
                          <div className="mt-1.5 shrink-0">
                            <div className={`w-2 h-2 rounded-full ${typeColor(n.type)} ${!n.isRead ? 'animate-pulse' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${n.isRead ? 'text-gray-300' : 'text-white'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2 font-medium">
                              {formatTime(n.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative flex items-center pl-4 border-l border-white/10 ml-2">
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
                className="flex items-center gap-3 text-left focus:outline-none group"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-none group-hover:text-purple-300 transition-colors">
                    {user?.name || 'Manager'}
                  </p>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">User Mgr</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30 transition-all">
                  <UserCircle size={24} />
                </div>
              </button>

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
