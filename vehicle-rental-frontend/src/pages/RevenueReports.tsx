import { useState, useEffect } from 'react';
import {
  IndianRupee, TrendingUp, Car, BarChart3,
  Loader2, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface MonthlyEntry {
  month: string;
  revenue: number;
}

interface TopVehicle {
  make: string;
  model: string;
  licensePlate: string;
  totalEarned: number;
  rentalCount: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface RecentTransaction {
  id: string;
  totalPrice: number;
  updatedAt: string;
  user: { name: string };
  vehicle: { make: string; model: string };
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  ONGOING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONFIRMED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

export default function RevenueReports() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [topVehicles, setTopVehicles] = useState<TopVehicle[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [revenueRes, txRes] = await Promise.all([
          api.get('/admin/reports/revenue'),
          api.get('/admin/reports/transactions')
        ]);
        setTotalRevenue(revenueRes.data.totalRevenue);
        setMonthly(revenueRes.data.monthlyBreakdown || []);
        setTopVehicles(revenueRes.data.topPerformingVehicles || []);
        setStatusBreakdown(revenueRes.data.bookingStatusBreakdown || []);
        setTransactions(txRes.data || []);
      } catch (error) {
        toast.error('Failed to load revenue reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const maxRevenue = monthly.length > 0 ? Math.max(...monthly.map(m => m.revenue), 1) : 1;

  const formatMonth = (key: string) => {
    const [year, month] = key.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 pb-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={36} /> Revenue Reports
        </h1>
        <p className="text-gray-400 mt-2">Earnings analysis, top-performing vehicles, and booking trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-2xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <IndianRupee size={24} />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Lifetime</span>
          </div>
          <p className="text-3xl font-black text-white">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-gray-300 mt-1">Total Revenue Collected</p>
        </div>

        <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 rounded-xl text-green-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Last month</span>
          </div>
          <p className="text-3xl font-black text-white">
            ₹{monthly.length > 0
              ? monthly[monthly.length - 1].revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })
              : '0'}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {monthly.length > 0 ? formatMonth(monthly[monthly.length - 1].month) : 'No data'}
          </p>
        </div>

        <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 rounded-xl text-purple-400">
              <Car size={24} />
            </div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Top earner</span>
          </div>
          <p className="text-2xl font-black text-white truncate">
            {topVehicles.length > 0 ? `${topVehicles[0].make} ${topVehicles[0].model}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {topVehicles.length > 0
              ? `₹${topVehicles[0].totalEarned.toLocaleString('en-IN', { maximumFractionDigits: 0 })} earned`
              : 'No completed bookings yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={20} /> Monthly Revenue
          </h2>
          {monthly.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {monthly.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition mb-1 whitespace-nowrap">
                      ₹{entry.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                    <div
                      className="w-full bg-blue-500/30 hover:bg-blue-500/60 border border-blue-500/20 rounded-t-lg transition-all duration-300 cursor-pointer"
                      style={{ height: `${Math.max(4, (entry.revenue / maxRevenue) * 160)}px` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold">{formatMonth(entry.month)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No revenue data available yet.
            </div>
          )}
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Booking Status</h2>
          <div className="space-y-3">
            {statusBreakdown.length > 0 ? statusBreakdown.map(s => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[s.status] || 'bg-white/10 text-gray-400 border-white/10'}`}>
                  {s.status}
                </span>
                <span className="text-white font-bold text-sm">{s.count}</span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No booking data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top Performing Vehicles */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="text-purple-400" size={20} /> Top Performing Vehicles
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {topVehicles.length > 0 ? topVehicles.map((v, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-500 w-5">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{v.make} {v.model}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{v.licensePlate} · {v.rentalCount} rentals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400 flex items-center gap-1">
                    <IndianRupee size={14} />
                    {v.totalEarned.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-gray-500">earned</p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-500">No completed bookings yet.</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="text-green-400" size={20} /> Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {transactions.length > 0 ? transactions.map(tx => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition">
                <div>
                  <p className="text-sm font-bold text-white">{tx.vehicle.make} {tx.vehicle.model}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {tx.user.name} · {new Date(tx.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
                  <ArrowUpRight size={14} />
                  ₹{tx.totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-500">No completed transactions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
