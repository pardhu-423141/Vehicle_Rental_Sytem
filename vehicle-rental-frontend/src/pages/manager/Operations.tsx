import React, { useState, useEffect } from 'react';
import { 
  Key, ArrowRightLeft, ShieldCheck, AlertTriangle, 
  Clock, Search, CheckCircle2, Loader2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ManagerOperations() {
  const [activeTab, setActiveTab] = useState<'handovers' | 'returns'>('handovers');
  
  // Real-time State
  const [handovers, setHandovers] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  // ⚡ New state to track the reason and the UI state for entering it
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/operations/queue'); 
      setHandovers(data.handovers);
      setReturns(data.returns);
    } catch (error) {
      console.error("Queue Fetch Error:", error);
      toast.error("Failed to load operations queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const processHandover = async (bookingId: string, customerName: string) => {
    try {
      await api.put(`/operations/handover/${bookingId}`);
      setHandovers(handovers.filter(h => h.id !== bookingId));
      toast.success(`Keys handed to ${customerName}. Vehicle is now IN USE.`);
    } catch (error) {
      toast.error("Failed to process handover.");
    }
  };

  const processReturn = async (bookingId: string, condition: 'good' | 'maintenance') => {
    if (condition === 'maintenance' && !returnReason.trim()) {
      toast.error("Please provide a reason for maintenance.");
      return;
    }

    try {
      // ⚡ Send the reason to the backend
      await api.put(`/operations/return/${bookingId}`, { condition, reason: returnReason });
      
      setReturns(returns.filter(r => r.id !== bookingId));
      setInspectingId(null);
      setShowReasonInput(false);
      setReturnReason('');
      
      if (condition === 'good') {
        toast.success("Vehicle returned clean. Status updated to AVAILABLE.");
      } else {
        toast.error("Vehicle flagged. Task created in Service Inbox.");
      }
    } catch (error) {
      toast.error("Failed to process return.");
    }
  };

  const filterData = (dataArray: any[]) => {
    return dataArray.filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.user?.name.toLowerCase().includes(query) ||
        item.vehicle?.licensePlate.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  };

  const filteredHandovers = filterData(handovers);
  const filteredReturns = filterData(returns);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Daily Operations</h1>
          <p className="text-gray-400 mt-2">Manage today's physical key exchanges and inspections.</p>
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search ID, Name or Plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-px">
        <button 
          onClick={() => setActiveTab('handovers')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'handovers' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Key size={18} /> Pending Handovers
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{filteredHandovers.length}</span>
          {activeTab === 'handovers' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
        </button>
        
        <button 
          onClick={() => setActiveTab('returns')}
          className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'returns' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ArrowRightLeft size={18} /> Expected Returns
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{filteredReturns.length}</span>
          {activeTab === 'returns' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- HANDOVERS TAB --- */}
        {activeTab === 'handovers' && (
          filteredHandovers.length > 0 ? filteredHandovers.map(item => (
            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Key size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Pickup</span>
                    <h3 className="text-xl font-bold text-white mt-2">{item.user?.name || 'Unknown User'}</h3>
                    <p className="text-sm font-mono text-gray-400 mt-1" title={item.id}>ID: {item.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white flex items-center justify-end gap-1.5 font-medium">
                      <Clock size={14}/> {new Date(item.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Today</p>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Assigned Vehicle</p>
                    <p className="text-white font-bold">{item.vehicle?.make} {item.vehicle?.model}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-300 bg-white/10 px-2 py-1 rounded">{item.vehicle?.licensePlate}</span>
                </div>

                <button 
                  onClick={() => processHandover(item.id, item.user?.name)}
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
          filteredReturns.length > 0 ? filteredReturns.map(item => (
            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowRightLeft size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">Drop-off</span>
                    <h3 className="text-xl font-bold text-white mt-2">{item.user?.name || 'Unknown User'}</h3>
                    <p className="text-sm font-mono text-gray-400 mt-1" title={item.id}>ID: {item.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white flex items-center justify-end gap-1.5 font-medium">
                      <Clock size={14}/> {new Date(item.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Today</p>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Returning Vehicle</p>
                    <p className="text-white font-bold">{item.vehicle?.make} {item.vehicle?.model}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-300 bg-white/10 px-2 py-1 rounded">{item.vehicle?.licensePlate}</span>
                </div>

                {inspectingId === item.id ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Post-Ride Inspection</p>
                      <button onClick={() => { setInspectingId(null); setShowReasonInput(false); }} className="text-gray-500 hover:text-white"><X size={16}/></button>
                    </div>
                    
                    {/* ⚡ Dynamic UI based on whether they clicked "Issues" */}
                    {showReasonInput ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Describe the issue (e.g. Scratched bumper)..." 
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className="w-full px-4 py-3 bg-black/30 border border-red-500/30 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                        />
                        <button 
                          onClick={() => processReturn(item.id, 'maintenance')} 
                          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm"
                        >
                          Submit Issue to Inbox
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => processReturn(item.id, 'good')} className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm">
                          <CheckCircle2 size={16} /> Clean
                        </button>
                        <button onClick={() => setShowReasonInput(true)} className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm">
                          <AlertTriangle size={16} /> Issues
                        </button>
                      </div>
                    )}
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