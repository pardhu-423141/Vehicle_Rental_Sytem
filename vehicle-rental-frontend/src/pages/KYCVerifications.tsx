import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Eye, CheckCircle, XCircle, FileText, Loader2, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function KYCVerifications() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ⚡ New State for the Document Review Modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // 1. Fetch real data from backend
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/kyc/submissions'); 
      
      let extraction: any[] = [];
      if (Array.isArray(data)) extraction = data;
      else if (data && Array.isArray(data.data)) extraction = data.data;
      else if (data?.data && Array.isArray(data.data.submissions)) extraction = data.data.submissions;

      setKycRequests(extraction);
    } catch (err) {
      console.error("KYC Fetch Error:", err);
      toast.error("Failed to load KYC submissions.");
      setKycRequests([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSubmissions(); 
  }, []);

  // 2. Handle Approve/Reject Action
  const handleAction = async (userId: string, userName: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/kyc/review/${userId}`, { status: action });
      
      toast.success(`${userName}'s KYC has been ${action.toLowerCase()}!`);
      
      // Update local state to reflect changes instantly
      setKycRequests(prev => prev.map(req => 
        (req.id === userId || req._id === userId) ? { ...req, kycStatus: action } : req
      ));

      // Close modal if it's open
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("KYC Action Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to process KYC action.");
    }
  };

  const filteredRequests = kycRequests.filter(req => 
    req.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40}/></div>;

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700 relative">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">KYC Inbox</h1>
        <p className="text-gray-400 mt-2">Verify customer identities to unlock vehicle rentals.</p>
      </div>

      {/* Search & Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
           <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Document</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.map((request) => {
                const reqId = request.id || request._id;
                return (
                  <tr key={reqId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-white">{request.name}</div>
                      <div className="text-[11px] text-gray-500">{request.email}</div>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-400" />
                        {request.kycData?.idType || 'No Document Info'}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Num: {request.kycData?.idNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        request.kycStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        request.kycStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {request.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {request.kycStatus === 'PENDING' ? (
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-900/20"
                        >
                          <Eye size={16} /> Review Docs
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition"
                        >
                           View Record
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredRequests.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No KYC requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚡ DOCUMENT REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-white">Document Verification</h3>
                <p className="text-sm text-gray-400 mt-1">Reviewing KYC for <span className="text-blue-400 font-semibold">{selectedRequest.name}</span></p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* User Details Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-white font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Document Type</p>
                  <p className="text-sm text-white font-medium">{selectedRequest.kycData?.idType || 'Not Provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">ID Number</p>
                  <p className="text-sm text-white font-medium">{selectedRequest.kycData?.idNumber || 'Not Provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                  <p className={`text-sm font-bold ${selectedRequest.kycStatus === 'APPROVED' ? 'text-green-400' : selectedRequest.kycStatus === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {selectedRequest.kycStatus}
                  </p>
                </div>
              </div>

              {/* Document Images */}
              <div className="space-y-6">
                {/* Front Image */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="text-sm font-bold text-gray-300">Front of Document</h4>
                    {selectedRequest.kycData?.idImageFront && (
                      <a href={selectedRequest.kycData.idImageFront} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        Open Full <ExternalLink size={12}/>
                      </a>
                    )}
                  </div>
                  {selectedRequest.kycData?.idImageFront ? (
                    <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden flex justify-center p-2">
                      <img 
                        src={selectedRequest.kycData.idImageFront} 
                        alt="ID Front" 
                        className="max-h-[400px] object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-gray-500 text-sm">
                      No front image uploaded
                    </div>
                  )}
                </div>

                {/* Back Image (if your backend supports it) */}
                {selectedRequest.kycData?.idImageBack && (
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="text-sm font-bold text-gray-300">Back of Document</h4>
                      <a href={selectedRequest.kycData.idImageBack} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        Open Full <ExternalLink size={12}/>
                      </a>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden flex justify-center p-2">
                      <img 
                        src={selectedRequest.kycData.idImageBack} 
                        alt="ID Back" 
                        className="max-h-[400px] object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer - Actions */}
            {selectedRequest.kycStatus === 'PENDING' && (
              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4">
                <button 
                  onClick={() => handleAction(selectedRequest.id || selectedRequest._id, selectedRequest.name, 'REJECTED')}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/20 transition"
                >
                  <XCircle size={18} /> Reject KYC
                </button>
                <button 
                  onClick={() => handleAction(selectedRequest.id || selectedRequest._id, selectedRequest.name, 'APPROVED')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition"
                >
                  <CheckCircle size={18} /> Approve KYC
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}