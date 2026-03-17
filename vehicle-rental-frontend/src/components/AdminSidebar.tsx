import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  ShieldCheck, 
  Wrench, 
  UserCog, 
  LogOut, 
  X,
  MessageSquareWarning
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  // Organized based on your Workflow Roles
  const menuGroups = [
    {
      label: 'Core',
      items: [
        { name: 'Dashboard', path: '/AdminDashboard', icon: LayoutDashboard }, // Overview
      ]
    },
    {
      label: 'Inventory & Operations',
      items: [
        { name: 'Fleet Management', path: '/admin/fleet', icon: Car }, // Step 3
        { name: 'Maintenance Hub', path: '/admin/maintenance', icon: Wrench }, // Step 9
        { name: 'Issue Logs', path: '/admin/issues', icon: MessageSquareWarning }, // Step 7
      ]
    },
    {
      label: 'User & Staff Control',
      items: [
        { name: 'KYC Verifications', path: '/admin/kyc', icon: ShieldCheck }, // Step 2
        { name: 'Customer Directory', path: '/admin/users', icon: Users }, // Step 2.1
        { name: 'Staff Management', path: '/admin/staff', icon: UserCog }, // Step 2.3
      ]
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 h-full w-72 z-[70] bg-white/10 backdrop-blur-2xl border-r border-white/20 shadow-2xl transition-transform duration-500 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white italic tracking-tighter">
              DRIVE<span className="text-blue-400">ADMIN</span>
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-lg text-white hover:text-red-400 lg:hidden transition">
              <X size={20} />
            </button>
          </div>

          {/* Grouped Navigation */}
          <div className="flex-1 space-y-8">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4 ml-4">
                  {group.label}
                </h3>
                <nav className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 border ${
                        location.pathname === item.path 
                          ? 'bg-blue-600/40 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                          : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} className={location.pathname === item.path ? 'text-blue-300' : 'text-gray-400'} />
                      <span className="text-sm font-semibold">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Exit / Logout */}
          <Link to="/login" className="flex items-center gap-3 px-5 py-4 mt-8 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}