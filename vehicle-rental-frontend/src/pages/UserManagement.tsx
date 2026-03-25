import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, ShieldCheck, Mail, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
  status: string;
  joinDate: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Real Users from Database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users'); 
      
      // ⚡ DEBUG: Check your browser's Developer Tools Console to see this!
      console.log("Raw backend response for users:", data);

      // ⚡ BULLETPROOF EXTRACTION: Check all common ways backends send arrays
      let usersArray: any[] = [];
      
      if (Array.isArray(data)) {
        usersArray = data; // If backend sends just the array: [...]
      } else if (data && Array.isArray(data.data)) {
        usersArray = data.data; // If backend sends: { data: [...] }
      } else if (data && Array.isArray(data.users)) {
        usersArray = data.users; // If backend sends: { users: [...] }
      } else if (data?.data && Array.isArray(data.data.users)) {
        usersArray = data.data.users; // If backend sends: { data: { users: [...] } }
      } else {
        console.warn("Could not find an array in the backend response!");
      }

      const mappedUsers = usersArray.map((u: any) => {
        let uiStatus = 'Pending';
        const rawStatus = (u.kycStatus || u.status || '').toUpperCase();
        if (rawStatus === 'APPROVED') uiStatus = 'Verified';
        if (rawStatus === 'REJECTED' || rawStatus === 'SUSPENDED') uiStatus = 'Suspended';

        return {
          // Fallbacks added for every field just in case your DB names them differently
          id: u._id || u.id, 
          name: u.name || u.firstName || 'Unknown User',
          email: u.email || 'N/A',
          phone: u.phone || u.phoneNumber || 'N/A',
          trips: u.trips || 0,
          status: uiStatus,
          joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'
        };
      });

      setUsers(mappedUsers);
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

  // 2. Handle Actions
  const handleUserAction = async (userId: string, action: 'APPROVED' | 'SUSPENDED') => {
    try {
      // ⚡ Translate "SUSPENDED" to "REJECTED" because the KYC endpoint likely 
      // only accepts "APPROVED" or "REJECTED" as valid database enums.
      const backendStatus = action === 'SUSPENDED' ? 'REJECTED' : 'APPROVED';

      await api.patch(`/admin/kyc/review/${userId}`, { status: backendStatus });
      
      toast.success(`User status updated successfully!`);
      
      // Update the UI immediately without refreshing the page
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: action === 'APPROVED' ? 'Verified' : 'Suspended' };
        }
        return u;
      }));
    } catch (error: any) {
      // ⚡ THIS IS THE MAGIC BULLET FOR DEBUGGING 400 ERRORS:
      // It will print the exact validation error your backend is throwing
      console.error("Backend Error Details:", error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || "Failed to update user status.";
      toast.error(errorMessage);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="text-gray-400 font-medium">Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">User Directory</h1>
        <p className="text-gray-300">Manage customer accounts and verify KYC documents.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email..."
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-5 font-semibold">User Details</th>
                <th className="px-6 py-5 font-semibold">Contact Info</th>
                <th className="px-6 py-5 font-semibold text-center">Trips</th>
                <th className="px-6 py-5 font-semibold">Status</th>
                <th className="px-6 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  {/* User Profile Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-200 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Joined: {user.joinDate}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Mail size={12} className="text-blue-400" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Phone size={12} className="text-green-400" /> {user.phone}
                      </div>
                    </div>
                  </td>

                  {/* Trip Count */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-white">{user.trips}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.status === 'Verified' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      user.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.status === 'Pending' && (
                        <button 
                          onClick={() => handleUserAction(user.id, 'APPROVED')}
                          title="Verify User" 
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      {user.status !== 'Suspended' && (
                        <button 
                          onClick={() => handleUserAction(user.id, 'SUSPENDED')}
                          title="Suspend User" 
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                      <button title="View Details" className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition">
                        <ShieldCheck size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State Fallback */}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}