import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  MoreVertical,
  Mail,
  Ban,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios'; // ⚡ Using your custom axios instance!

type KycStatus = 'All' | 'APPROVED' | 'PENDING' | 'INCOMPLETE' | 'REJECTED';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: string;
  joined: string;
}

export default function UserDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycStatus>('All');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 1. Fetch Real Users from Backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Ensure you have an endpoint like GET /api/admin/users
      const { data } = await api.get('/admin/users');
      
      if (Array.isArray(data)) {
        // Map backend fields to the format our frontend table expects
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown User',
          email: u.email || 'N/A',
          phone: u.phone || 'N/A',
          kycStatus: u.kycStatus ? u.kycStatus.toUpperCase() : 'INCOMPLETE',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'
        }));
        setUsers(mappedUsers);
      } else if (data && Array.isArray(data.data)) {
        // Fallback in case backend sends { data: [...] }
        const mappedUsers = data.data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown User',
          email: u.email || 'N/A',
          phone: u.phone || 'N/A',
          kycStatus: u.kycStatus ? u.kycStatus.toUpperCase() : 'INCOMPLETE',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'
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

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = statusFilter === 'All' || user.kycStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 2. Handle Actions (like Revoking KYC)
  const handleAction = async (userId: string, action: string) => {
    setActiveDropdown(null);
    
    if (action === 'revoke') {
      try {
        // Reusing the KYC review endpoint to reject/revoke their status
        await api.patch(`/admin/kyc/review/${userId}`, { status: 'REJECTED' });
        
        // Update local state to reflect the change immediately
        setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'REJECTED' } : u));
        toast.success(`KYC revoked for user. They must re-verify.`);
      } catch (error) {
        console.error("Revoke Error:", error);
        toast.error("Failed to revoke KYC status.");
      }
    } else {
      toast.success(`${action} action triggered (Backend implementation pending)`);
    }
  };

  // Helper for Status Badges (Updated to expect Uppercase matching backend)
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
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      {/* 1. Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-purple-400" size={32} /> User Directory
          </h1>
          <p className="text-gray-400 mt-2">Manage all registered accounts and their verification statuses.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-2xl font-bold text-white leading-none">{users.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total Users</p>
          </div>
        </div>
      </div>

      {/* 2. Search and Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl mb-6 flex flex-col md:flex-row gap-4 relative z-20">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as KycStatus)}
            className="w-full pl-11 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition text-sm appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4 pl-6">User Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  
                  {/* Name & ID */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</p>
                        <p className="text-xs font-mono text-gray-500">{user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <p className="text-sm text-gray-300">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {getStatusBadge(user.kycStatus)}
                  </td>

                  {/* Date */}
                  <td className="p-4">
                    <p className="text-sm text-gray-400">{user.joined}</p>
                  </td>

                  {/* Action Menu */}
                  <td className="p-4 text-center relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Dropdown Box */}
                    {activeDropdown === user.id && (
                      <div className="absolute top-12 right-6 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-white/5 border-b border-white/5 text-left pl-4">
                          Manage User
                        </div>
                        <button onClick={() => handleAction(user.id, 'Email Sent')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2">
                          <Mail size={14} /> Contact User
                        </button>
                        <button onClick={() => handleAction(user.id, 'Viewed Documents')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2 border-b border-white/5">
                          <ShieldCheck size={14} /> View Documents
                        </button>
                        <button onClick={() => handleAction(user.id, 'revoke')} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition flex items-center gap-2">
                          <Ban size={14} /> Revoke KYC
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              )) : (
                /* Empty State */
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

      {/* Invisible overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setActiveDropdown(null)} />
      )}

    </div>
  );
}