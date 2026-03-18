import React from 'react';
import { 
  Car, 
  Users, 
  Activity, 
  Clock, 
  Settings, 
  BellRing, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Updated Stats based on Workflow Lifecycle
const STATS = [
  { label: 'In Use (On Road)', value: '24', icon: Activity, color: 'text-blue-400', desc: 'Active rentals' }, // Step 6
  { label: 'Booked (Pending)', value: '08', icon: Clock, color: 'text-yellow-400', desc: 'Awaiting handover' }, // Step 4
  { label: 'In Maintenance', value: '05', icon: Settings, color: 'text-red-400', desc: 'Step 9: Repairing' }, // Step 9
  { label: 'Pending KYC', value: '12', icon: Users, color: 'text-purple-400', desc: 'Step 2: Verification' }, // Step 2
];

// Mock Data for Step 7: Issue Reporting
const RECENT_ISSUES = [
  { id: 'ISS-102', vehicle: 'V-003 (Toyota)', manager: 'Rahul S.', issue: 'Brake Noise reported by user', status: 'Pending' },
  { id: 'ISS-101', vehicle: 'V-001 (Activa)', manager: 'Suresh V.', issue: 'Overdue Return (2 hours)', status: 'In Progress' },
];

export default function AdminDashboard() {
  const handleQuickPing = (manager: string) => {
    toast.success(`Broadcasting alert to ${manager}...`);
  };

  return (
    <div className="w-full max-w-7xl px-6 animate-in fade-in duration-700">
      
      {/* 1. Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Admin Command Center</h1>
        <p className="text-gray-400 mt-2">Overseeing User Managers, Vehicle Managers, and Fleet Lifecycle.</p>
      </div>

      {/* 2. Workflow Lifecycle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STATS.map((stat, index) => (
          <div key={index} className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl hover:bg-white/[0.15] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Status</span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <h3 className="text-gray-200 text-sm font-semibold mt-1">{stat.label}</h3>
            <p className="text-[11px] text-gray-500 mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Issue & Communication Hub (Step 7) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-400" size={20} />
                <h2 className="text-xl font-bold text-white">Active Issue Logs</h2>
              </div>
              <button className="text-sm text-blue-400 hover:underline">View All Tickets</button>
            </div>
            
            <div className="p-0">
              {RECENT_ISSUES.map((log) => (
                <div key={log.id} className="p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition">
                  <div className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{log.vehicle}</span>
                        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded">Assigned: {log.manager}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{log.issue}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleQuickPing(log.manager)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition"
                  >
                    <BellRing size={14} /> Ping Manager
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Manager Responsibility Overview */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Staff Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <ManagerCard name="Rahul S." role="Maintenance" load={5} />
               <ManagerCard name="Suresh V." role="Vehicle Mgr" load={3} />
               <ManagerCard name="Mahesh K." role="Vehicle Mgr" load={8} />
            </div>
          </div>
        </div>

        {/* 5. Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-2xl shadow-xl">
            <h3 className="text-white font-bold mb-4">Step 2: KYC Queue</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-white">HJ</div>
                  <span className="text-xs text-gray-200">Hruthwik J.</span>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition">
                Review Verifications
              </button>
            </div>
          </div>

          {/* Maintenance Summary */}
          <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-red-400">
              <Settings size={18} />
              <h3 className="font-bold text-white">Maintenance Hub</h3>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 italic">Step 9: Service Required</span>
                  <span className="text-white font-bold">05 Cars</span>
               </div>
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[60%]"></div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component for Manager Performance
function ManagerCard({ name, role, load }: { name: string, role: string, load: number }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition">
      <div className="text-sm font-bold text-white">{name}</div>
      <div className="text-[10px] text-blue-400 uppercase font-bold tracking-tighter mb-2">{role}</div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500">Active Load</span>
        <span className="text-xs font-bold text-white">{load} Vehicles</span>
      </div>
    </div>
  );
}