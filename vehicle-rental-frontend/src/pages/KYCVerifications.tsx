import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Eye, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios'; // ⚡ Swapped to your custom API instance

export default function KYCVerifications() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch real data from backend
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // ⚡ Added leading slash and using 'api' instance
      const { data } = await api.get('/admin/kyc/submissions'); 
      
      // ⚡ SAFETY CHECK: Guarantee we are storing an array
      if (Array.isArray(data)) {
        setKycRequests(data);
      } else if (data && Array.isArray(data.data)) {
        // If your backend wrapped the array in a "data" object
        setKycRequests(data.data);
      } else {
        console.warn("Unexpected data format received:", data);
        setKycRequests([]); // Fallback to an empty array so .filter() never crashes
      }

    } catch (err) {
      console.error("KYC Fetch Error:", err);
      toast.error("Failed to load KYC submissions.");
      setKycRequests([]); // Ensure it stays an array even on error
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
      // ⚡ Using 'api' instance here too
      await api.patch(`/admin/kyc/review/${userId}`, { status: action });
      
      toast.success(`${userName} has been ${action.toLowerCase()}`);
      
      // Update local state without re-fetching
      setKycRequests(prev => prev.map(req => 
        req.id === userId ? { ...req, kycStatus: action } : req
      ));
    } catch (error) {
      toast.error("Action failed. Try again.");
    }
  };

  // ⚡ kycRequests is now guaranteed to be an array, so this will never crash
  const filteredRequests = kycRequests.filter(req => 
    req.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40}/></div>;

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      {/* Header and Stats */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">KYC Inbox</h1>
        <p className="text-gray-400 mt-2">Verify customer identities to unlock vehicle rentals.</p>
      </div>

      {/* Table Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
           <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-white">{request.name}</div>
                  <div className="text-[11px] text-gray-500">{request.email}</div>
                </td>
                <td className="px-6 py-5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-400" />
                    {request.kycData?.idType || 'No Document'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Num: {request.kycData?.idNumber}</div>
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
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAction(request.id, request.name, 'APPROVED')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40"><CheckCircle size={18} /></button>
                      <button onClick={() => handleAction(request.id, request.name, 'REJECTED')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40"><XCircle size={18} /></button>
                      {/* Added safety check for the href */}
                      {request.kycData?.idImageFront && (
                        <a href={request.kycData.idImageFront} target="_blank" rel="noreferrer" className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"><Eye size={18} /></a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500 italic">Completed</span>
                  )}
                </td>
              </tr>
            ))}
            
            {/* Added a friendly empty state */}
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
  );
}