import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Car, Clock, MapPin, CreditCard, Activity, ArrowRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  // SIMULATED USER STATE: Change this to 'Incomplete', 'Pending', or 'Approved' to see the UI adapt!
  const [user] = useState({
    name: 'Hruthwik J.',
    kycStatus: 'Approved' as 'Incomplete' | 'Pending' | 'Approved', 
    walletBalance: 0,
  });

  const activeRide = null; // New/Pending users have no active rides

  // Helper function to dynamically style the KYC card based on status
  const getKycUI = () => {
    switch (user.kycStatus) {
      case 'Approved':
        return {
          glow: 'bg-green-500/20',
          iconStyle: 'bg-green-500/10 border-green-500/20 text-green-400',
          Icon: ShieldCheck,
          title: 'Identity Verified',
          desc: 'Your account is verified. You are ready to book rides.',
          btnStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30',
          btnText: 'Book a Ride',
          btnIcon: Car,
          btnLink: '/marketplace'
        };
      case 'Pending':
        return {
          glow: 'bg-yellow-500/20',
          iconStyle: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
          Icon: Clock,
          title: 'Verification Pending',
          desc: 'Your documents are currently under review by our team. Check back soon.',
          btnStyle: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
          btnText: 'Check Status',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
      case 'Incomplete':
      default:
        return {
          glow: 'bg-red-500/20',
          iconStyle: 'bg-red-500/10 border-red-500/20 text-red-400',
          Icon: ShieldAlert,
          title: 'Action Required',
          desc: 'KYC is incomplete. You must upload your Driving License to book vehicles.',
          btnStyle: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30',
          btnText: 'Complete KYC',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
    }
  };

  const kycUI = getKycUI();

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Welcome, {user.name}</h1>
        <p className="text-gray-400 mt-2">Manage your rentals, track active rides, and update your profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Dynamic KYC Status Card */}
        <div className="lg:col-span-2 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-all duration-500 ${kycUI.glow}`} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border ${kycUI.iconStyle}`}>
                <kycUI.Icon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{kycUI.title}</h2>
                <p className="text-sm text-gray-400 max-w-sm">
                  {kycUI.desc}
                </p>
              </div>
            </div>

            <Link 
              to={kycUI.btnLink} 
              className={`px-6 py-3 font-bold rounded-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center gap-2 whitespace-nowrap ${kycUI.btnStyle}`}
            >
              {kycUI.btnText} <kycUI.btnIcon size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Wallet Card */}
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <CreditCard size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Wallet Balance</span>
          </div>
          <p className="text-4xl font-bold text-white tracking-tight">₹{user.walletBalance}</p>
          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors">
            + Add Funds
          </button>
        </div>
      </div>

      {/* Active Ride Section */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="text-blue-400" size={20} /> Current Active Ride
      </h3>
      
      {/* Empty State for new/pending users */}
      <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <Car size={48} className="text-gray-600 mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">No Active Rides</h4>
        <p className="text-gray-400 mb-6">You don't have any vehicles currently booked or in use.</p>
        <Link to="/marketplace" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/10">
          Browse Vehicles
        </Link>
      </div>
    </div>
  );
}