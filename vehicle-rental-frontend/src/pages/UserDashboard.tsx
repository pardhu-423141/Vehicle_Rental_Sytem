import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Car, Clock, 
  CreditCard, Activity, ArrowRight, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  // 1. Destructure ID on the fly from Context
  const { user, logout } = useAuth();
  const id = user?.id; // This is the unique identifier for the logged-in user
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/user/profile`, {
            withCredentials: true 
        });
        setUserData(res.data);
      } catch (err: any) {
        console.error('Terminal Uplink Failed:', err);

        // 4. If the error is 401 (Unauthorized), kick them to login
        if (err.response?.status === 401) {
          // It's good practice to clear local auth state too
          if (logout) logout(); 
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    // If there's no ID in context, they shouldn't even be here
    if (!id) {
        navigate('/login', { replace: true });
    } else {
        fetchUserData();
    }
  }, [id, navigate, logout]);

  // 2. Helper function with safety checks
  const getKycUI = () => {
    const status = userData?.kycStatus || 'Incomplete';
    
    switch (status) {
      case 'APPROVED':
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
      case 'PENDING':
        return {
          glow: 'bg-yellow-500/20',
          iconStyle: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
          Icon: Clock,
          title: 'Verification Pending',
          desc: 'Your documents are currently under review. Check back soon.',
          btnStyle: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
          btnText: 'Check Status',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
      default:
        return {
          glow: 'bg-red-500/20',
          iconStyle: 'bg-red-500/10 border-red-500/20 text-red-400',
          Icon: ShieldAlert,
          title: 'Action Required',
          desc: 'KYC is incomplete. Upload your ID to unlock vehicle bookings.',
          btnStyle: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30',
          btnText: 'Complete KYC',
          btnIcon: ArrowRight,
          btnLink: '/kyc'
        };
    }
  };

  // 3. Loading Screen (Prevents crashes)
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
    <div className="w-full max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">
            Welcome, <span className="text-blue-400">{userData?.name || 'Operator'}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">Manage your fleet access and tracking stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* 2. Dynamic KYC Status Card */}
        <div className="lg:col-span-2 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className={`absolute -right-20 -top-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-all duration-500 ${kycUI.glow}`} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border ${kycUI.iconStyle}`}>
                <kycUI.Icon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{kycUI.title}</h2>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                  {kycUI.desc}
                </p>
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

        {/* 3. Quick Wallet Card */}
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center relative group">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <CreditCard size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Available Credits</span>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">
            ₹{userData?.walletBalance || 0}
          </p>
          <button className="mt-6 text-xs text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest flex items-center gap-2 transition-all">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">+</div>
            Top Up Wallet
          </button>
        </div>
      </div>

      {/* 4. Active Ride Section */}
      <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
        <Activity className="text-blue-500" size={14} /> Mission Status: Active Rides
      </h3>
      
      <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center">
        <div className="p-6 rounded-full bg-white/5 mb-6">
            <Car size={48} className="text-gray-700" />
        </div>
        <h4 className="text-xl font-bold text-white mb-2 tracking-tight">No Active Deployments</h4>
        <p className="text-gray-400 mb-8 max-w-xs text-sm">Your fleet is currently docked. Visit the marketplace to commission a vehicle.</p>
        <Link to="/marketplace" className="px-8 py-4 bg-white/5 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition border border-white/10 shadow-xl">
          Browse Marketplace
        </Link>
      </div>

    </div>
  );
}