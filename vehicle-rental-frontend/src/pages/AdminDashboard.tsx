import React, { useEffect, useState } from 'react';
import { 
  Car, Users, Activity, Clock, Settings, BellRing, 
  AlertTriangle, ChevronRight, CheckCircle2, Wrench 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ⚡ Added for navigation
import toast from 'react-hot-toast';
import api from '../api/axios';

// ⚡ Added Interfaces matching your Prisma Schema
interface DashboardStats {
  activeVehicles: number;
  totalRevenue: number;
  totalBookings: number;
  pendingVerifications: number;
  pendingMaintenance: number; // Based on MaintenanceTask model
  totalVehicles: number;
}

interface RecentBooking {
  id: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  vehicle?: { make: string; model: string };
  user?: { name: string };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/admin/stats'); 
        
        // ⚡ Assuming your backend returns stats and recent bookings together
        setStats(data.stats || data); 
        setRecentBookings(data.recentBookings || []); 
        
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to sync live database stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickPing = (manager: string) => {
    toast.success(`Broadcasting alert to ${manager}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-12 h-12 text-blue-500 mb-4" />
          <p className="text-xl font-bold tracking-widest">CONNECTING TO DATABASE...</p>
        </div>
      </div>
    );
  }

  // ⚡ Dynamically map stats to UI based on backend data
  const UI_STATS = [
    { label: 'Active Fleet', value: stats?.activeVehicles || 0, icon: Activity, color: 'text-blue-400', desc: 'Vehicles ready for rent' },
    { label: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0', icon: Clock, color: 'text-yellow-400', desc: 'Lifetime earnings' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Car, color: 'text-red-400', desc: 'Rentals processed' },
    { label: 'Pending KYC', value: stats?.pendingVerifications || 0, icon: Users, color: 'text-purple-400', desc: 'Users awaiting verification' },
  ];

  // ⚡ Calculate Fleet Health based on Prisma MaintenanceTasks vs Total Vehicles
  const total = stats?.totalVehicles || 1; 
  const pendingMaint = stats?.pendingMaintenance || 0;
  const healthPercentage = Math.max(0, Math.round(((total - pendingMaint) / total) * 100));

  return (
    <div className="w-full max-w-7xl px-6 animate-in fade-in duration-700">
      
      {/* 1. Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Admin Command Center</h1>
        <p className="text-gray-400 mt-2 tracking-wide">Syncing real-time data from PostgreSQL.</p>
      </div>

      {/* 2. Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {UI_STATS.map((stat, index) => (
          <div key={index} className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl hover:bg-white/[0.15] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <h3 className="text-gray-200 text-sm font-semibold mt-1">{stat.label}</h3>
            <p className="text-[11px] text-gray-500 mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Real Recent Bookings (Mapped to Prisma Booking Model) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={20} />
                <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
              </div>
              <button 
                onClick={() => navigate('/admin/bookings')} // ⚡ Functional routing
                className="text-sm text-blue-400 hover:underline"
              >
                View Ledger
              </button>
            </div>
            
            <div className="p-0">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition">
                  <div className="flex gap-4 items-center">
                    {/* Status Indicator Dot */}
                    <div className={`w-2 h-2 rounded-full shadow-lg ${
                      booking.status === 'COMPLETED' ? 'bg-green-500 shadow-green-500/50' : 
                      booking.status === 'ONGOING' ? 'bg-blue-500 shadow-blue-500/50' : 
                      booking.status === 'CANCELLED' ? 'bg-red-500 shadow-red-500/50' :
                      'bg-yellow-500 shadow-yellow-500/50'
                    }`}></div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : `Booking #${booking.id.slice(-6)}`}
                        </span>
                        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded">
                          ${booking.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">
                        User: {booking.user?.name || 'Unknown'} | Status: {booking.status}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleQuickPing("Finance")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition"
                  >
                    <BellRing size={14} /> Audit
                  </button>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="p-10 text-center text-gray-500">No recent bookings found.</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Sidebar: KYC & System Health */}
        <div className="space-y-6">
          
          {/* KYC Review Queue */}
          <div className="p-6 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-2xl shadow-xl">
            <h3 className="text-white font-bold mb-4">KYC Review Queue</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                 <div className="flex flex-col">
                   <span className="text-xs text-gray-400">Awaiting Action</span>
                   <span className="text-xl font-bold text-white">{stats?.pendingVerifications || 0} Users</span>
                 </div>
                 <Users size={24} className="text-blue-400" />
               </div>
               <button 
                 onClick={() => navigate('/admin/kyc')} // ⚡ Functional routing
                 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/40 transition"
               >
                 Manage Verifications
               </button>
            </div>
          </div>

          {/* Maintenance Hub (Mapped to MaintenanceTask Model) */}
          <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-orange-400">
                <Settings size={18} />
                <h3 className="font-bold text-white">Maintenance Hub</h3>
              </div>
              <div className="space-y-4 mb-6">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 italic text-[10px]">Fleet Health Status</span>
                    <span className={`font-bold ${healthPercentage < 80 ? 'text-red-400' : 'text-green-400'}`}>
                      {healthPercentage}%
                    </span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${healthPercentage < 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                      style={{ width: `${healthPercentage}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5 mt-4">
                   <span className="text-xs text-gray-300">Pending Tasks</span>
                   <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                     <Wrench size={14} /> {stats?.pendingMaintenance || 0}
                   </span>
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/admin/fleet')} // ⚡ Functional routing
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg border border-white/10 transition"
            >
              Open Service Bay
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}