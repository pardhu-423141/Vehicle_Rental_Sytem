import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Eye,
  Search, ArrowLeft, X, Loader2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchKycQueue, approveUserKyc, rejectUserKyc } from '../../api/userManagerApi';

export default function KycQueue() {
  const location = useLocation();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await fetchKycQueue();
        setQueue(data);
        
        const passedId = location.state?.preselectId;
        if (passedId) {
          const preselected = data.find((req: any) => req.id === passedId);
          if (preselected) setSelectedReq(preselected);
        }
      } catch (error) {
        toast.error("Failed to load KYC Queue");
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, [location.state?.preselectId]);

  const handleApprove = async (id: string) => {
    try {
      await approveUserKyc(id);
      setQueue(queue.filter(req => req.id !== id));
      toast.success("KYC Approved successfully!");
      setSelectedReq(null);
    } catch (error) {
      toast.error("Failed to approve KYC");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return toast.error("Please provide a reason.");
    try {
      await rejectUserKyc(id, rejectReason);
      setQueue(queue.filter(req => req.id !== id));
      toast.success("KYC Rejected.");
      setRejectReason('');
      setSelectedReq(null);
    } catch (error) {
      toast.error("Failed to reject KYC");
    }
  };

  // Filter queue based on search input
  const filteredQueue = queue.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={48} /></div>;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
        
        <div className="mb-8 flex justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-blue-400" size={32} /> KYC Verification Desk
            </h1>
          </div>
          <div>
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-white leading-none">{queue.length}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Pending Review</p>
            </div>
          </div>
        </div>

        {!selectedReq ? (
          /* --- LIST VIEW --- */
          <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..." 
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition shadow-lg" 
              />
            </div>

            <div className="space-y-4">
              {filteredQueue.length > 0 ? filteredQueue.map(req => (
                <div key={req.id} onClick={() => setSelectedReq(req)} className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/30 transition duration-200 cursor-pointer flex justify-between items-center group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-lg">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{req.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">ID: {req.id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-md uppercase tracking-widest font-semibold">Pending</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl backdrop-blur-sm">
                   <ShieldCheck size={48} className="text-gray-600 mx-auto mb-4" />
                   <p className="text-xl font-bold text-white mb-1">Queue is empty</p>
                   <p className="text-gray-400 text-sm">All users are verified.</p>
                 </div>
              )}
            </div>
          </div>
        ) : (
          /* --- DETAIL VIEW --- */
          <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-400">
            <button onClick={() => { setSelectedReq(null); setRejectReason(''); }} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-4 py-2 bg-white/5 rounded-xl border border-white/10 transition">
              <ArrowLeft size={14} /> Back to Queue
            </button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-600/20">{selectedReq.name.charAt(0)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedReq.name}</h2>
                  <p className="text-sm text-gray-400">{selectedReq.email}</p>
                </div>
              </div>

              {selectedReq.kycData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-blue-400"/> {selectedReq.kycData.idType} (Front)
                      </p>
                      <button onClick={() => setFullScreenImage(selectedReq.kycData.idImageFront)} className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg transition"><Eye size={12}/> View Full</button>
                    </div>
                    <div onClick={() => setFullScreenImage(selectedReq.kycData.idImageFront)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                      <img src={selectedReq.kycData.idImageFront} alt="ID Front" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye size={28} className="text-white" /></div>
                    </div>
                    <p className="text-sm font-mono text-white bg-black/30 px-4 py-2.5 rounded-xl text-center border border-white/5 tracking-widest">{selectedReq.kycData.idNumber}</p>
                  </div>
                  
                  {selectedReq.kycData.idImageBack && (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                           <FileText size={14} className="text-purple-400"/> {selectedReq.kycData.idType} (Back)
                         </p>
                         <button onClick={() => setFullScreenImage(selectedReq.kycData.idImageBack)} className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg transition"><Eye size={12}/> View Full</button>
                       </div>
                       <div onClick={() => setFullScreenImage(selectedReq.kycData.idImageBack)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                         <img src={selectedReq.kycData.idImageBack} alt="ID Back" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-200" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye size={28} className="text-white" /></div>
                       </div>
                     </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-8 flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={18} />
                  <span>Prisma verification error: KYC Data record is missing for this user.</span>
                </div>
              )}

              {/* --- UNIFIED ACTION DESK (Fixed alignment issues) --- */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                
                {/* Rejection Input Box (Spans 3 columns on desktop) */}
                <div className="space-y-2 md:col-span-3 w-full">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                    Rejection Feedback <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a clear reason only if you intend to reject this user..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 outline-none focus:border-red-500/40 focus:bg-red-500/5 transition text-sm resize-none"
                  />
                </div>

                {/* Direct Action Buttons (Spans 2 columns on desktop) */}
                <div className="flex gap-3 md:col-span-2 w-full h-[46px]">
                  <button
                    onClick={() => handleReject(selectedReq.id)}
                    disabled={!rejectReason.trim()}
                    className="flex-1 h-full bg-red-600/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-red-400 disabled:cursor-not-allowed"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  
                  <button
                    onClick={() => handleApprove(selectedReq.id)}
                    className="flex-[1.3] h-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-600/10 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Approve Access
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* --- FULL SCREEN LIGHTBOX MODAL --- */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition border border-white/10"><X size={20} /></button>
          <div className="relative max-w-[90vw] max-h-[90vh] p-1 bg-white/5 border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={fullScreenImage} alt="Full Screen Document" className="w-full h-full object-contain max-h-[82vh] rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}