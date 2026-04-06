import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShieldCheck, Car, ArrowRight, Activity, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

export default function Home(): JSX.Element {
  const { user } = useAuth(); 

  // Helper to determine the correct Command Center
  const getDashboardPath = () => {
    if (!user) return "/login"; 

    // Added optional chaining here just in case!
    switch (user?.role) { 
      case 'ADMIN': 
        return "/AdminDashboard";
      case 'USER_MANAGER': 
        return "/user-manager/dashboard";
      case 'VEHICLE_MANAGER': 
        return "/manager/fleet";
      default: 
        return "/UserDashboard"; 
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-hidden selection:bg-blue-500/30">
      
      {/* 1. HERO SECTION */}
      <div className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Zap size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              {/* THE FIX: Added optional chaining and fallback */}
              {user ? `Welcome back, ${user?.role || ''}` : 'Next-Gen Fleet Access'}
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase">
            Drive the <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700">Future.</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {/* THE FIX: Added optional chaining and fallback to prevent the .replace() crash */}
            {user 
              ? `Identity confirmed. Ready to synchronize with the ${user?.role?.replace('_', ' ') || 'SYSTEM'} terminal.` 
              : "Instant access to a premium fleet of bikes and SUVs. No paperwork, no delays—just pure performance."
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={dashboardPath} 
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              {user ? 'Enter Command Center' : 'Initiate Session'} 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {!user && (
              <Link 
                to="/marketplace" 
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all backdrop-blur-md"
              >
                Browse Fleet
              </Link>
            )}
          </div>
        </div>
      </div>


      {/* 3. FEATURES GRID */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-all" />
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
            <Calendar size={28} />
          </div>
          <h3 className="text-xl font-black mb-3 uppercase tracking-tight">Rapid Booking</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Go from terminal to road in under 60 seconds.</p>
        </div>

        <div className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-green-500/30 transition-all duration-500 relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-green-600/5 blur-3xl group-hover:bg-green-600/15 transition-all" />
          <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-black mb-3 uppercase tracking-tight">Secure Protocols</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Biometric identity verification for every pilot.</p>
        </div>

        <div className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-600/5 blur-3xl group-hover:bg-purple-600/15 transition-all" />
          <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
            <Car size={28} />
          </div>
          <h3 className="text-xl font-black mb-3 uppercase tracking-tight">Elite Assets</h3>
          <p className="text-gray-400 text-sm leading-relaxed">High-performance EVs and urban mobility units.</p>
        </div>
      </div>

      {/* 4. FOOTER */}
      <div className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.5em]">
            © 2026 DriveRentals Protocol
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-green-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Node: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}