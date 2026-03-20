import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye,
  User,
  Calendar,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data: Users waiting for KYC approval
const INITIAL_QUEUE = [
  {
    id: 'REQ-001',
    user: 'Aditi Sharma',
    email: 'aditi.s@example.com',
    submittedAt: 'Today, 10:30 AM',
    status: 'Pending',
    documents: {
      aadhaar: 'XXXX-XXXX-8812',
      dl: 'AP-09-2019837',
      // Using placeholder images for document previews
      aadhaarImg: 'https://images.unsplash.com/photo-1633265486064-086b219458ce?q=80&w=800&auto=format&fit=crop',
      dlImg: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=800&auto=format&fit=crop' 
    }
  },
  {
    id: 'REQ-002',
    user: 'Kiran Kumar',
    email: 'kiran.k@example.com',
    submittedAt: 'Today, 09:15 AM',
    status: 'Pending',
    documents: {
      aadhaar: 'XXXX-XXXX-1029',
      dl: 'TS-07-2021004',
      aadhaarImg: 'https://images.unsplash.com/photo-1633265486064-086b219458ce?q=80&w=800&auto=format&fit=crop',
      dlImg: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=800&auto=format&fit=crop'
    }
  }
];

export default function KycQueue() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedReq, setSelectedReq] = useState(INITIAL_QUEUE[0]);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id: string) => {
    setQueue(queue.filter(req => req.id !== id));
    toast.success("KYC Approved! User can now book vehicles.");
    
    // Auto-select the next item in the queue if available
    const remaining = queue.filter(req => req.id !== id);
    if (remaining.length > 0) setSelectedReq(remaining[0]);
    else setSelectedReq(null as any);
  };

  const handleReject = (id: string) => {
    if (!rejectReason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setQueue(queue.filter(req => req.id !== id));
    toast.success("KYC Rejected. User has been notified to re-upload.");
    setRejectReason('');
    
    const remaining = queue.filter(req => req.id !== id);
    if (remaining.length > 0) setSelectedReq(remaining[0]);
    else setSelectedReq(null as any);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      {/* 1. Header & Quick Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-400" size={32} /> KYC Verification Desk
          </h1>
          <p className="text-gray-400 mt-2">Review and verify user identity documents.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-2xl font-bold text-white leading-none">{queue.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Pending Review</p>
          </div>
          <div className="px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-green-400 leading-none">12</p>
            <p className="text-[10px] text-green-500/70 uppercase tracking-widest font-bold mt-1">Approved Today</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: The Queue */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition text-sm"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {queue.length > 0 ? queue.map(req => (
              <div 
                key={req.id} 
                onClick={() => setSelectedReq(req)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  selectedReq?.id === req.id 
                    ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-900/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-sm">{req.user}</h3>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-2">{req.id}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar size={12}/> Submitted {req.submittedAt}
                </p>
              </div>
            )) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <ShieldCheck size={32} className="text-gray-500 mx-auto mb-2" />
                <p className="text-white font-bold">Queue is empty</p>
                <p className="text-xs text-gray-400">All users are verified.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Document Viewer */}
        <div className="w-full lg:w-2/3">
          {selectedReq ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl h-full flex flex-col">
              
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {selectedReq.user.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white leading-none">{selectedReq.user}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedReq.email}</p>
                </div>
              </div>

              {/* Document Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1">
                
                {/* Aadhaar Card */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-400"/> Aadhaar / National ID
                    </p>
                    <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                      <Eye size={12}/> View Full
                    </button>
                  </div>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-white/10 relative group">
                    <img src={selectedReq.documents.aadhaarImg} alt="Aadhaar Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-sm font-mono text-white bg-black/40 px-3 py-2 rounded-lg text-center border border-white/5 tracking-wider">
                    {selectedReq.documents.aadhaar}
                  </p>
                </div>

                {/* Driving License */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <FileText size={14} className="text-purple-400"/> Driving License
                    </p>
                    <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                      <Eye size={12}/> View Full
                    </button>
                  </div>
                  <div className="aspect-[1.6/1] rounded-xl overflow-hidden border border-white/10 relative group">
                    <img src={selectedReq.documents.dlImg} alt="DL Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-sm font-mono text-white bg-black/40 px-3 py-2 rounded-lg text-center border border-white/5 tracking-wider">
                    {selectedReq.documents.dl}
                  </p>
                </div>

              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleApprove(selectedReq.id)}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-green-900/30"
                  >
                    <CheckCircle2 size={20} /> Approve Verification
                  </button>
                  
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Reason for rejection (e.g. Blurry image)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="flex-1 px-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition text-sm"
                    />
                    <button 
                      onClick={() => handleReject(selectedReq.id)}
                      className="px-6 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <XCircle size={20} /> Reject
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl text-center">
              <div>
                <ShieldCheck size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-white mb-2">Ready for Review</p>
                <p className="text-gray-400 text-sm">Select an application from the queue to begin verification.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}