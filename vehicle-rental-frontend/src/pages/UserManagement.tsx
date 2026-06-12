import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
  status: string;
  joinDate: string;
  isActive: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Users from Database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");

      // Debug to inspect field names in your browser console
      console.log("Raw backend response:", data);

      let usersArray: any[] = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && Array.isArray(data.data)) {
        usersArray = data.data;
      } else if (data && Array.isArray(data.users)) {
        usersArray = data.users;
      } else if (data?.data && Array.isArray(data.data.users)) {
        usersArray = data.data.users;
      }

      const mappedUsers = usersArray.map((u: any, index: number) => {
        // Compute individual user validation status
        let uiStatus = "Pending";
        const rawStatus = (u.kycStatus || u.status || "").toUpperCase();
        if (rawStatus === "APPROVED" || rawStatus === "VERIFIED") uiStatus = "Verified";
        if (rawStatus === "REJECTED" || rawStatus === "SUSPENDED") uiStatus = "Suspended";

        // CRITICAL FIX: Ensure a strict, non-duplicate unique key per user row
        const uniqueId = u.id || u._id || `user-fallback-${index}-${u.email || 'anon'}`;

        return {
          id: uniqueId,
          name: u.name || u.firstName || "Unknown User",
          email: u.email || "N/A",
          phone: u.phone || u.phoneNumber || "N/A",
          trips: u.trips || 0,
          status: uiStatus,
          // CRITICAL FIX: Map individual active state cleanly, falling back to true
          isActive: u.isActive !== undefined ? u.isActive : true, 
          joinDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString()
            : "Unknown",
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

  // 2. Optimized State Handlers (Avoids global re-renders)
  const handleDeactivate = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      toast.success("User account deactivated.");
      
      // Optimistically update the single target user's local UI state instantly
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === userId ? { ...user, isActive: false } : user)
      );
    } catch (error) {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/reactivate`);
      toast.success("User account reactivated.");
      
      // Optimistically update the single target user's local UI state instantly
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === userId ? { ...user, isActive: true } : user)
      );
    } catch (error) {
      toast.error("Failed to reactivate user.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
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
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">User Directory</h1>
        <p className="text-gray-400 text-sm">
          Manage customer account active privileges and track user onboarding statuses.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md shadow-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search directory by name or email..."
          className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 outline-none transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-4.5 font-semibold">User Details</th>
                <th className="px-6 py-4.5 font-semibold">Contact Info</th>
                <th className="px-6 py-4.5 font-semibold text-center">Trips Booked</th>
                <th className="px-6 py-4.5 font-semibold">KYC Status</th>
                <th className="px-6 py-4.5 font-semibold text-right pr-8">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  
                  {/* Column 1: Profile card details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                          Registered: {user.joinDate}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Contact Communication lines */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Mail size={13} className="text-blue-400 opacity-80" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Phone size={13} className="text-green-400 opacity-80" /> {user.phone}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Stats metric tracking */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-white font-mono">{user.trips}</span>
                  </td>

                  {/* Column 4: System verification badge status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        user.status === "Verified"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : user.status === "Pending"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Column 5: Modular actions desk layout context */}
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex justify-end items-center h-full">
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-all duration-200 whitespace-nowrap shadow-sm shadow-red-900/10"
                        >
                          <UserX size={14} /> Deactivate Account
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(user.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-600 hover:text-white transition-all duration-200 whitespace-nowrap shadow-sm shadow-green-900/10"
                        >
                          <UserCheck size={14} /> Reactivate Account
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {/* Empty Data Placeholder UI state */}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                      <AlertTriangle size={32} className="text-gray-600" />
                      <p className="text-base font-medium text-white">No directory records found</p>
                      <p className="text-xs max-w-xs text-gray-400">
                        We couldn't locate any users matching "{searchTerm}". Try refining your spellings.
                      </p>
                    </div>
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