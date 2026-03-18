import { useState } from 'react';
import { Search, UserCheck, UserX, ShieldCheck, Mail, Phone } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
  status: 'Verified' | 'Pending' | 'Suspended';
  joinDate: string;
}

const MOCK_USERS: User[] = [
  { id: 'USR-001', name: 'Hruthwik Jayanth', email: 'hruthwik@nitap.ac.in', phone: '+91 98765 43210', trips: 12, status: 'Verified', joinDate: '2025-12-01' },
  { id: 'USR-002', name: 'Ananya Rao', email: 'ananya.r@example.com', phone: '+91 87654 32109', trips: 0, status: 'Pending', joinDate: '2026-02-15' },
  { id: 'USR-003', name: 'Suresh Kumar', email: 'suresh.k@demo.com', phone: '+91 76543 21098', trips: 24, status: 'Verified', joinDate: '2025-10-10' },
  { id: 'USR-004', name: 'Priya Singh', email: 'priya.s@web.com', phone: '+91 65432 10987', trips: 3, status: 'Suspended', joinDate: '2026-01-05' },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        {user.name.charAt(0)}
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
                        <button title="Verify User" className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition">
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button title="Suspend User" className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition">
                        <UserX size={16} />
                      </button>
                      <button title="View Details" className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition">
                        <ShieldCheck size={16} />
                      </button>
                    </div>
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