import React, { useState } from 'react';
import { 
  Key, 
  ArrowRightLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data: Real-time queues for the manager
const MOCK_HANDOVERS = [
  { id: 'BKG-123', customer: 'Hruthwik J.', vehicle: 'Tata Nexon EV', plate: 'AP-39-EV-001', time: '10:00 AM', status: 'Pending' },
  { id: 'BKG-124', customer: 'Amit P.', vehicle: 'Honda Activa 6G', plate: 'AP-39-BK-4021', time: '11:30 AM', status: 'Pending' }
];

const MOCK_RETURNS = [
  { id: 'BKG-098', customer: 'Rahul S.', vehicle: 'Suzuki Swift', plate: 'AP-39-DX-9012', time: '05:00 PM', status: 'Expected' },
  { id: 'BKG-095', customer: 'Priya M.', vehicle: 'Royal Enfield Classic', plate: 'AP-39-RE-9922', time: '06:00 PM', status: 'Expected' }
];

export default function ManagerOperations() {
  const [activeTab, setActiveTab] = useState<'handovers' | 'returns'>('handovers');
  const [handovers, setHandovers] = useState(MOCK_HANDOVERS);
  const [returns, setReturns] = useState(MOCK_RETURNS);
  
  // State to track which return is currently being inspected
  const [inspectingId, setInspectingId] = useState<string | null>(null);

  const processHandover = (id: string, customer: string) => {
    // Remove from handover queue (Simulating DB update to 'In Use')
    setHandovers(handovers.filter(h => h.id !== id));
    toast.success(`Keys handed to ${customer}. Vehicle is now IN USE.`);
  };

  const processReturn = (id: string, condition: 'good' | 'maintenance') => {
    // Remove from returns queue (Simulating DB update to 'Available' or 'Maintenance')
    setReturns(returns.filter(r => r.id !== id));
    setInspectingId(null);
    
    if (condition === 'good') {
      toast.success("Vehicle returned clean. Status updated to AVAILABLE.");
    } else {
      toast.error("Vehicle flagged for issues. Status updated to UNDER MAINTENANCE.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      {/* 1. Header & Quick Search */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Daily Operations</h1>
          <p className="text-gray-400 mt-2">Manage today's physical key exchanges and inspections.</p>
        </div>
        
        {/* Optional quick search for walk-ins or large fleets */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search ID or Plate..."
            className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>
      </div>

      {/* 2. Operations Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-px">
        <button 
          onClick={() => setActiveTab('handovers')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'handovers' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Key size={18} /> Pending Handovers
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{handovers.length}</span>
          {activeTab === 'handovers' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
        </button>
        
        <button 
          onClick={() => setActiveTab('returns')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'returns' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ArrowRightLeft size={18} /> Expected Returns
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{returns.length}</span>
          {activeTab === 'returns' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
        </button>
      </div>

      {/* 3. Dynamic Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- HANDOVERS TAB --- */}
        {activeTab === 'handovers' && (
          handovers.length > 0 ? handovers.map(item => (
            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Key size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Pickup</span>
                    <h3 className="text-xl font-bold text-white mt-2">{item.customer}</h3>
                    <p className="text-sm font-mono text-gray-400 mt-1">{item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white flex items-center justify-end gap-1.5 font-medium"><Clock size={14}/> {item.time}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Today</p>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Assigned Vehicle</p>
                    <p className="text-white font-bold">{item.vehicle}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-300 bg-white/10 px-2 py-1 rounded">{item.plate}</span>
                </div>

                <button 
                  onClick={() => processHandover(item.id, item.customer)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-blue-900/40"
                >
                  <ShieldCheck size={20} /> Verify ID & Handover Keys
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <CheckCircle2 size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">All caught up!</p>
              <p className="text-gray-400">No pending handovers right now.</p>
            </div>
          )
        )}

        {/* --- RETURNS TAB --- */}
        {activeTab === 'returns' && (
          returns.length > 0 ? returns.map(item => (
            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowRightLeft size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">Drop-off</span>
                    <h3 className="text-xl font-bold text-white mt-2">{item.customer}</h3>
                    <p className="text-sm font-mono text-gray-400 mt-1">{item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white flex items-center justify-end gap-1.5 font-medium"><Clock size={14}/> {item.time}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Today</p>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Returning Vehicle</p>
                    <p className="text-white font-bold">{item.vehicle}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-300 bg-white/10 px-2 py-1 rounded">{item.plate}</span>
                </div>

                {/* Inline Inspection Logic */}
                {inspectingId === item.id ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-center text-gray-400 mb-3 font-bold uppercase tracking-widest">Post-Ride Inspection</p>
                    <div className="flex gap-3">
                      <button onClick={() => processReturn(item.id, 'good')} className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm">
                        <CheckCircle2 size={16} /> Clean
                      </button>
                      <button onClick={() => processReturn(item.id, 'maintenance')} className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm">
                        <AlertTriangle size={16} /> Issues
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setInspectingId(item.id)}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-900/40"
                  >
                    <ArrowRightLeft size={20} /> Process Return
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <CheckCircle2 size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">Lot is clear!</p>
              <p className="text-gray-400">No vehicles are expected back right now.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}