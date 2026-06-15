import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Car, Clock,
  Activity, ArrowRight, Loader2, FileWarning, Calendar, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const id = user?.id;
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, bookingsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/bookings/my-bookings').catch(() => ({ data: [] }))
        ]);

        setUserData(profileRes.data);

        const allBookings = bookingsRes.data || [];
        const activeStatuses = ['PENDING', 'CONFIRMED', 'ONGOING'];

        const currentRides = allBookings.filter((booking: any) =>
          activeStatuses.includes(booking.status?.toUpperCase())
        );

        setActiveRides(currentRides);
      } catch (err: any) {
        console.error('Dashboard Data Fetch Failed:', err);
        if (err.response?.status === 401) {
          if (logout) logout();
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    if (!id) {
      navigate('/login', { replace: true });
    } else {
      fetchDashboardData();
    }
  }, [id, navigate, logout]);

  const actualUser = userData?.user || userData?.data || userData;

  const getKycUI = () => {
    const status = actualUser?.kycStatus?.toUpperCase() || 'INCOMPLETE';

    switch (status) {
      case 'APPROVED':
        return {
          glow: 'bg-green-500/20',
          iconStyle: 'bg-green-500/10 border-green-500/20 text-green-400',
          Icon: ShieldCheck,
          title: 'Identity Verified',
          desc: 'Your account is fully verified. You are ready to book rides.',
          btnStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30',
          btnText: 'Book a Ride',
          btnIcon: Car,
          btnLink: '/marketplace'
        };
      case 'PENDING':
        return {
          glow: 'bg-yellow-500/20',
          iconStyle: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
          Icon: Clock,
          title: 'Verification Pending',
          desc: 'Your documents are currently under review by our team. Check back soon.',
          btnStyle: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
          btnText: 'View Status',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
      case 'REJECTED':
        return {
          glow: 'bg-red-500/20',
          iconStyle: 'bg-red-500/10 border-red-500/20 text-red-400',
          Icon: FileWarning,
          title: 'Verification Rejected',
          desc: 'There was an issue verifying your documents. Please review and re-submit.',
          btnStyle: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30',
          btnText: 'Re-Submit KYC',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
      default:
        return {
          glow: 'bg-orange-500/20',
          iconStyle: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
          Icon: ShieldAlert,
          title: 'Action Required',
          desc: 'Your KYC is incomplete. Please upload your ID to unlock vehicle bookings.',
          btnStyle: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/30',
          btnText: 'Complete KYC',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
    }
  };

  const getRideStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ONGOING':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'CONFIRMED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-blue-400 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Synchronizing Session...</p>
      </div>
    );
  }

  const kycUI = getKycUI();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-12">

      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">
          Welcome, <span className="text-blue-400">{actualUser?.name || 'Explorer'}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">Manage your fleet access and tracking stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-all duration-500 ${kycUI.glow}`} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border ${kycUI.iconStyle}`}>
                <kycUI.Icon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{kycUI.title}</h2>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">{kycUI.desc}</p>
              </div>
            </div>

            <Link
              to={kycUI.btnLink}
              className={`px-6 py-4 font-black rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2 whitespace-nowrap text-xs uppercase tracking-widest ${kycUI.btnStyle}`}
            >
              {kycUI.btnText} <kycUI.btnIcon size={18} />
            </Link>
          </div>
        </div>
      </div>

      <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
        <Activity className="text-blue-500" size={14} /> Mission Status: Active Rides
      </h3>

      {activeRides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRides.map((ride) => (
            <div key={ride.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors flex flex-col">
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 relative bg-black/40 shrink-0">
                <img
                  src={ride.vehicle?.image || ride.vehicle?.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'}
                  alt={ride.vehicle?.name || `${ride.vehicle?.make} ${ride.vehicle?.model}`}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${getRideStatusStyle(ride.status)}`}>
                    {ride.status === 'ONGOING' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                    {ride.status}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col px-1">
                <div>
                  <h3 className="text-2xl font-bold text-white truncate">
                    {ride.vehicle?.name || `${ride.vehicle?.make} ${ride.vehicle?.model}`}
                  </h3>
                  <p className="text-sm font-mono text-gray-400 mt-1">{ride.vehicle?.licensePlate || 'Plate Unassigned'}</p>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Calendar size={16} className="text-gray-500" />
                    <span>From: {new Date(ride.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin size={16} className="text-gray-500" />
                    <span>Until: {new Date(ride.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono" title={ride.id}>
                    ID: {ride.id.split('-')[0].toUpperCase()}
                  </span>
                  <Link to="/history" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg opacity-20 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/30 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-56 h-36 mb-8 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1503376712341-a6fa46c4f51e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Luxury Car"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent" />
            </div>

            <h4 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Ready for your next adventure?</h4>
            <p className="text-gray-400 mb-10 max-w-md text-sm leading-relaxed">
              You don't have any upcoming or active trips. Browse our premium fleet and book the perfect vehicle.
            </p>

            {actualUser?.kycStatus?.toUpperCase() === 'APPROVED' ? (
              <Link to="/marketplace" className="px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/30 flex items-center gap-2">
                Book Your Ride <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/kyc" className="px-8 py-4 bg-orange-600/20 text-orange-400 border border-orange-500/30 text-sm font-bold rounded-2xl hover:bg-orange-600/30 transition flex items-center gap-2">
                <ShieldAlert size={18} /> Complete KYC to Book
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
