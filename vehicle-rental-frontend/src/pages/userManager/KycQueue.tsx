import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Eye,
  Calendar, Search, ArrowLeft, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchKycQueue, approveUserKyc, rejectUserKyc } from '../../api/userManagerApi';

export default function KycQueue() {
  const location = useLocation();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Load real data from backend
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await fetchKycQueue();
        setQueue(data);
        
        // Auto-select if arriving from Dashboard click
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
    if (!rejectReason) return toast.error("Please provide a reason.");
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

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={48} /></div>;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
        
        <div className="mb-8 flex justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex gap-3">
              <ShieldCheck className="text-blue-400" size={32} /> KYC Verification Desk
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
              <p className="text-2xl font-bold text-white leading-none">{queue.length}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Pending Review</p>
            </div>
          </div>
        </div>

        {!selectedReq ? (
          /* --- LIST VIEW --- */
          <div className="w-full max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="text" placeholder="Search by name or ID..." className="w-full pl-11 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition shadow-lg" />
            </div>

            <div className="space-y-4">
              {queue.length > 0 ? queue.map(req => (
                <div key={req.id} onClick={() => setSelectedReq(req)} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-blue-500/30 cursor-pointer flex justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{req.name}</h3>
                      <p className="text-sm text-gray-400 font-mono">ID: {req.id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-md uppercase tracking-widest inline-block mb-2">Pending</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                   <ShieldCheck size={48} className="text-gray-500 mx-auto mb-4" />
                   <p className="text-xl font-bold text-white mb-1">Queue is empty</p>
                   <p className="text-gray-400">All users are verified.</p>
                 </div>
              )}
            </div>
          </div>
        ) : (
          /* --- DETAIL VIEW --- */
          <div className="w-full animate-in slide-in-from-right-4 duration-500">
            <button onClick={() => setSelectedReq(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <ArrowLeft size={16} /> Back to Queue
            </button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="flex items-center gap-5 mb-10 pb-8 border-b border-white/10">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">{selectedReq.name.charAt(0)}</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedReq.name}</h2>
                  <p className="text-gray-400">{selectedReq.email}</p>
                </div>
              </div>

              {/* Connected to Prisma kycData relation */}
              {selectedReq.kycData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2"><FileText size={16} className="text-blue-400"/> {selectedReq.kycData.idType}</p>
                      <button onClick={() => setFullScreenImage(selectedReq.kycData.idImageFront)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg"><Eye size={14}/> Full Screen</button>
                    </div>
                    <div onClick={() => setFullScreenImage(selectedReq.kycData.idImageFront)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                      <img src={selectedReq.kycData.idImageFront} alt="ID Front" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Eye size={32} className="text-white" /></div>
                    </div>
                    <p className="text-base font-mono text-white bg-black/40 px-4 py-3 rounded-xl text-center border border-white/5 tracking-widest">{selectedReq.kycData.idNumber}</p>
                  </div>
                  
                  {/* Render back image if they uploaded one */}
                  {selectedReq.kycData.idImageBack && (
                     <div className="space-y-4">
                       <div className="flex justify-between items-center">
                         <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2"><FileText size={16} className="text-purple-400"/> ID Back Side</p>
                         <button onClick={() => setFullScreenImage(selectedReq.kycData.idImageBack)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg"><Eye size={14}/> Full Screen</button>
                       </div>
                       <div onClick={() => setFullScreenImage(selectedReq.kycData.idImageBack)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                         <img src={selectedReq.kycData.idImageBack} alt="ID Back" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Eye size={32} className="text-white" /></div>
                       </div>
                     </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mb-8">
                  <p className="text-red-400 font-bold">Error: KYC Data missing for this user.</p>
                </div>
              )}

              <div className="pt-8 border-t border-white/10">
                <div className="flex flex-col md:flex-row gap-6">
                  <button onClick={() => handleApprove(selectedReq.id)} className="flex-1 py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3">
                    <CheckCircle2 size={24} /> Approve Verification
                  </button>
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="Reason for rejection (Required)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="flex-1 px-6 py-5 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500" />
                    <button onClick={() => handleReject(selectedReq.id)} className="px-8 py-5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-lg rounded-2xl flex items-center justify-center gap-2">
                      <XCircle size={24} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- FULL SCREEN LIGHTBOX MODAL --- */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10"><X size={24} /></button>
          <div className="relative max-w-[90vw] max-h-[90vh] p-2 bg-white/5 border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={fullScreenImage} alt="Full Screen Document" className="w-full h-full object-contain max-h-[85vh] rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}