import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Activity,
  FileText
} from 'lucide-react';

// Simplified Mock Data
const STATS = {
  totalUsers: 1248,
  pendingKyc: 12,
};

const RECENT_REQUESTS = [
  { id: 'REQ-001', name: 'Aditi Sharma', time: '10 mins ago', status: 'Pending' },
  { id: 'REQ-002', name: 'Kiran Kumar', time: '25 mins ago', status: 'Pending' },
  { id: 'REQ-003', name: 'Suresh V.', time: '1 hour ago', status: 'Pending' },
];

export default function UserManagerDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-12">
      
      {/* 1. Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Manager Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back. Here is your identity verification summary.</p>
      </div>

      {/* 2. Simplified Stats Grid (Now 2 columns instead of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        
        {/* Total Users */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-white mb-1">{STATS.totalUsers}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Registered Users</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
            <Users size={32} />
          </div>
        </div>

        {/* Pending KYC (Urgent Action) */}
        <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex items-center justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-4xl font-bold text-white mb-1">{STATS.pendingKyc}</p>
            <p className="text-xs text-yellow-200/70 font-bold uppercase tracking-widest">Pending Verifications</p>
          </div>
          <div className="p-4 bg-yellow-500/20 rounded-2xl text-yellow-400 border border-yellow-500/30 relative z-10">
            <Clock size={32} />
          </div>
        </div>
        
      </div>

      {/* 3. Action Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Priority Queue Snapshot */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl h-full flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="text-purple-400" size={20} /> Priority Queue Snapshot
              </h2>
              <Link to="/user-manager/kyc" className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                View Full Queue <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4 flex-1">
              {RECENT_REQUESTS.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{req.name}</p>
                      <p className="text-xs font-mono text-gray-500">{req.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded uppercase font-bold tracking-widest mb-1 inline-block">
                      {req.status}
                    </span>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 justify-end mt-1">
                      <Clock size={10} /> {req.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/user-manager/kyc" className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-900/40">
              <FileText size={20} /> Start Processing Queue
            </Link>

          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-6 relative z-10">Quick Workflows</h2>
            
            <div className="space-y-3 relative z-10">
              <Link to="/user-manager/kyc" className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all group/link">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover/link:text-white transition-colors">Verify Documents</span>
                </div>
                <ArrowRight size={16} className="text-gray-500 group-hover/link:text-purple-400 group-hover/link:translate-x-1 transition-all" />
              </Link>

              <Link to="/user-manager/directory" className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all group/link">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Users size={18} />
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover/link:text-white transition-colors">Manage Users</span>
                </div>
                <ArrowRight size={16} className="text-gray-500 group-hover/link:text-blue-400 group-hover/link:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}