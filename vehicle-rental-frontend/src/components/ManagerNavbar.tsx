import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Car, ArrowRightLeft, Wrench, Bell, UserCircle } from 'lucide-react';

export default function ManagerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'My Fleet', path: '/manager/fleet', icon: Car },
    { name: 'Handovers & Returns', path: '/manager/operations', icon: ArrowRightLeft },
    { name: 'Service Inbox', path: '/manager/maintenance', icon: Wrench },
  ];

  // Mock Notifications specific to Role 2.4 (Vehicle Manager)
  const managerNotifications = [
    { id: 1, title: 'New Maintenance Task', message: 'Admin flagged Mahindra Thar (AP-39-TR-8810) for brake inspection.', time: '5m ago', isRead: false, type: 'urgent' },
    { id: 2, title: 'Upcoming Handover', message: 'Customer Hruthwik J. arriving in 15 mins for Tata Nexon EV.', time: '10m ago', isRead: false, type: 'info' },
    { id: 3, title: 'Late Return Warning', message: 'Suzuki Swift (AP-39-DX-9012) is 30 mins past scheduled drop-off.', time: '1h ago', isRead: true, type: 'warning' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/manager/fleet" className="flex-shrink-0 flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tighter">
              DRIVE<span className="text-blue-500">MANAGER</span>
            </h1>
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-blue-500/30 hidden sm:block">
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
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
            
            {/* Notifications Bell Trigger */}
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-gray-400 hover:text-white transition relative"
            >
              <Bell size={20} />
              {managerNotifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute top-full mt-4 right-20 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-white font-bold text-sm">Manager Alerts</h3>
                  <button className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">Mark all read</button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {managerNotifications.map(notification => (
                    <div key={notification.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer flex gap-3 ${notification.isRead ? 'opacity-60' : ''}`}>
                      <div className="mt-1.5 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.type === 'urgent' ? 'bg-red-500' : 
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
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
                  <span className="text-xs text-gray-300 font-bold">View All Activity</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">Mahesh K.</p>
                <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-1">Vehicle Mgr</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UserCircle size={24} />
              </div>
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