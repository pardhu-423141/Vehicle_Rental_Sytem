import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, ShieldAlert, 
  Clock, Loader2, ArrowLeft, Eye, FileText, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

type KycStatus = 'All' | 'APPROVED' | 'PENDING' | 'INCOMPLETE' | 'REJECTED' | 'NOT_SUBMITTED';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: string;
  joined: string;
  kycData?: any; // Added to hold the document images
}

export default function UserDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycStatus>('All');
  
  // States for the Document Viewer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/user-manager/users');
      
      if (Array.isArray(data)) {
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown User',
          email: u.email || 'N/A',
          phone: 'N/A', 
          kycStatus: u.kycStatus ? u.kycStatus.toUpperCase() : 'NOT_SUBMITTED',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown',
          kycData: u.kycData // Store the images
        }));
        setUsers(mappedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);
      toast.error("Failed to load user directory.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = statusFilter === 'All' || user.kycStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><ShieldCheck size={12}/> Approved</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><ShieldAlert size={12}/> Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">Incomplete</span>;
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center"><Loader2 className="animate-spin text-purple-500 mb-4" size={40}/><p className="text-gray-400">Loading directory...</p></div>;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Users className="text-purple-400" size={32} /> User Directory
            </h1>
            <p className="text-gray-400 mt-2">Manage all registered accounts and their verification statuses.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center shadow-lg">
              <p className="text-2xl font-bold text-white leading-none">{users.length}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total Users</p>
            </div>
          </div>
        </div>

        {/* --- TOGGLE BETWEEN DIRECTORY TABLE AND DOCUMENT VIEWER --- */}
        {!selectedUser ? (
          
          /* DIRECTORY TABLE VIEW */
          <div className="animate-in slide-in-from-bottom-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl mb-6 flex flex-col md:flex-row gap-4 relative z-20">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition text-sm shadow-inner"
                />
              </div>

              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as KycStatus)}
                  className="w-full pl-11 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition text-sm appearance-none cursor-pointer shadow-inner"
                >
                  <option value="All">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="NOT_SUBMITTED">Not Submitted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <th className="p-4 pl-6">User Details</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">KYC Status</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold group-hover:bg-purple-600/40 transition-colors">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</p>
                              <p className="text-xs font-mono text-gray-500">{user.id.split('-')[0].toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-300">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(user.kycStatus)}
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-400">{user.joined}</p>
                        </td>
                        <td className="p-4 text-center">
                          {/* DIRECT BUTTON INSTEAD OF DROPDOWN */}
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition flex items-center gap-2 mx-auto text-xs font-bold"
                          >
                            <ShieldCheck size={14} /> View Docs
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        ) : (

          /* DOCUMENT VIEWER VIEW (Exact same style as KYC Queue) */
          <div className="w-full animate-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setSelectedUser(null)}
              className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-4 py-2 bg-white/5 rounded-xl border border-white/10"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedUser.name}</h2>
                    <p className="text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(selectedUser.kycStatus)}
                </div>
              </div>

              {selectedUser.kycData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                        <FileText size={16} className="text-blue-400"/> {selectedUser.kycData.idType}
                      </p>
                      <button onClick={() => setFullScreenImage(selectedUser.kycData.idImageFront)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                        <Eye size={14}/> Full Screen
                      </button>
                    </div>
                    <div onClick={() => setFullScreenImage(selectedUser.kycData.idImageFront)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                      <img src={selectedUser.kycData.idImageFront} alt="ID Front" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Eye size={32} className="text-white" /></div>
                    </div>
                    <p className="text-base font-mono text-white bg-black/40 px-4 py-3 rounded-xl text-center border border-white/5 tracking-widest">{selectedUser.kycData.idNumber}</p>
                  </div>
                  
                  {selectedUser.kycData.idImageBack && (
                     <div className="space-y-4">
                       <div className="flex justify-between items-center">
                         <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-2">
                           <FileText size={16} className="text-purple-400"/> ID Back Side
                         </p>
                         <button onClick={() => setFullScreenImage(selectedUser.kycData.idImageBack)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                           <Eye size={14}/> Full Screen
                         </button>
                       </div>
                       <div onClick={() => setFullScreenImage(selectedUser.kycData.idImageBack)} className="aspect-[1.6/1] rounded-2xl border border-white/10 relative group bg-black/40 cursor-pointer overflow-hidden">
                         <img src={selectedUser.kycData.idImageBack} alt="ID Back" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Eye size={32} className="text-white" /></div>
                       </div>
                     </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center py-12">
                  <ShieldAlert size={40} className="text-yellow-500 mx-auto mb-3" />
                  <p className="text-yellow-400 font-bold text-lg">No Documents Found</p>
                  <p className="text-gray-400 mt-1">This user has not submitted any KYC documents yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- FULL SCREEN LIGHTBOX MODAL --- */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10">
            <X size={24} />
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh] p-2 bg-white/5 border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={fullScreenImage} alt="Full Screen Document" className="w-full h-full object-contain max-h-[85vh] rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}