import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Activity, FileText, Loader2 } from 'lucide-react'; 
import { fetchDashboardData } from '../../api/userManagerApi'; 
import { useAuth } from '../../context/AuthContext'; 
import toast from 'react-hot-toast';

const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function UserManagerDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({ totalUsers: 0, pendingKyc: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setStats(data.stats);
        setRecentRequests(data.recentRequests);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-12">
      
      {/* Clean Header Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hey, <span className="text-purple-400">{user?.name || 'Manager'}</span>! 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Here is your identity verification summary.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-white mb-1">{stats.totalUsers}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Registered Users</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
            <Users size={32} />
          </div>
        </div>

        <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex items-center justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-4xl font-bold text-white mb-1">{stats.pendingKyc}</p>
            <p className="text-xs text-yellow-200/70 font-bold uppercase tracking-widest">Pending Verifications</p>
          </div>
          <div className="p-4 bg-yellow-500/20 rounded-2xl text-yellow-400 border border-yellow-500/30 relative z-10">
            <Clock size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-purple-400" size={20} /> Priority Queue Snapshot
          </h2>
        </div>

        <div className="space-y-4 flex-1">
          {recentRequests.length > 0 ? recentRequests.map((req) => (
            <Link 
              key={req.id} 
              to="/user-manager/kyc" 
              state={{ preselectId: req.id }} 
              className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all cursor-pointer group block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold group-hover:scale-110 transition-transform">
                  {req.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{req.name}</p>
                  <p className="text-xs font-mono text-gray-500">ID: {req.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded uppercase font-bold tracking-widest mb-1 inline-block">
                  Pending
                </span>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 justify-end mt-1">
                  <Clock size={10} /> {timeAgo(req.updatedAt)}
                </p>
              </div>
            </Link>
          )) : (
            <p className="text-center text-gray-400 py-4">No pending KYC requests.</p>
          )}
        </div>

        <Link to="/user-manager/kyc" className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-900/40">
          <FileText size={20} /> Go to Processing Queue
        </Link>
      </div>
    </div>
  );
}