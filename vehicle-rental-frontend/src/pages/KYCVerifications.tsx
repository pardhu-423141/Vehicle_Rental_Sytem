import { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface KYCRequest {
  id: string;
  userName: string;
  userEmail: string;
  documentType: 'Driving License' | 'Aadhaar Card';
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_KYC: KYCRequest[] = [
  { id: 'KYC-501', userName: 'Hruthwik Jayanth', userEmail: 'hruthwik@nitap.ac.in', documentType: 'Driving License', submittedDate: '2026-03-01', status: 'Pending' },
  { id: 'KYC-502', userName: 'Ananya Rao', userEmail: 'ananya.r@example.com', documentType: 'Aadhaar Card', submittedDate: '2026-03-02', status: 'Pending' },
  { id: 'KYC-503', userName: 'Suresh Kumar', userEmail: 'suresh.k@demo.com', documentType: 'Driving License', submittedDate: '2026-02-28', status: 'Approved' },
];

export default function KYCVerifications() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = (name: string, action: 'approve' | 'reject') => {
    toast.success(`User ${name} has been ${action === 'approve' ? 'Approved' : 'Rejected'}`);
  };

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* Header - Step 2 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">KYC Inbox</h1>
        <p className="text-gray-400 mt-2">Step 2: Review and verify customer identity documents.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400"><ShieldAlert size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">08</p>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Pending Review</p>
          </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><ShieldCheck size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">142</p>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Total Verified</p>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
           <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
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
                <th className="px-6 py-5 font-bold">Customer</th>
                <th className="px-6 py-5 font-bold">Document Type</th>
                <th className="px-6 py-5 font-bold">Submission Date</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Verification Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_KYC.map((request) => (
                <tr key={request.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-white">{request.userName}</div>
                    <div className="text-[11px] text-gray-500">{request.userEmail}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <FileText size={14} className="text-blue-400" />
                      {request.documentType}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400">{request.submittedDate}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      request.status === 'Approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      request.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {request.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(request.userName, 'approve')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-all shadow-lg shadow-green-900/20"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(request.userName, 'reject')}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-all shadow-lg shadow-red-900/20"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                        <button className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all" title="View Document">
                          <Eye size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">No actions required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}