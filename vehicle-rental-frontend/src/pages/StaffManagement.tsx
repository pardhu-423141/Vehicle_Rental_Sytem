import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Shield, Wrench, UserCog, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import AddStaffModal from '../components/AddStaffModal';

interface StaffMember {
  id: string;
  name: string;
  role: 'User Manager' | 'Vehicle Manager';
  email: string;
  assignedTasks: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      // ⚡ FIX: Grab the token from localStorage
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get('http://localhost:5000/api/admin/staff', {
        headers: {
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true
      });

      let staffArray: any[] = [];
      if (Array.isArray(data)) staffArray = data;
      else if (data && Array.isArray(data.data)) staffArray = data.data;
      else if (data && Array.isArray(data.staff)) staffArray = data.staff;

      const mappedStaff: StaffMember[] = staffArray.map((s: any) => {
        const rawRole = (s.role || '').toUpperCase();
        const role = rawRole.includes('USER') ? 'User Manager' : 'Vehicle Manager';

        return {
          id: s._id || s.id,
          name: s.name || s.firstName || 'Unknown Staff',
          email: s.email || 'N/A',
          role: role,
          assignedTasks: s.assignedTasks || s.tasks || 0,
          status: 'Active'
        };
      });

      setStaff(mappedStaff);
    } catch (error) {
      console.error("Fetch Staff Error:", error);
      toast.error("Failed to load staff directory.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="text-gray-400 font-medium">Loading staff directory...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Staff Management</h1>
          <p className="text-gray-400 mt-2">Oversee roles and assign responsibility for KYC and Vehicles.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:scale-[1.05] active:scale-95"
            >
                <UserPlus size={20} /> Add Staff Member
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search staff by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                <th className="px-6 py-5 font-bold">Staff Member</th>
                <th className="px-6 py-5 font-bold">Role</th>
                <th className="px-6 py-5 font-bold">Workload Tracking</th>
                <th className="px-6 py-5 font-bold text-center">Status</th>
                <th className="px-6 py-5 font-bold text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold uppercase">
                        {staffMember.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{staffMember.name}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {staffMember.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {staffMember.role === 'User Manager' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                           <Shield size={14} className="text-purple-400" />
                           <span className="text-[11px] font-bold text-purple-200">KYC Manager</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                           <Wrench size={14} className="text-orange-400" />
                           <span className="text-[11px] font-bold text-orange-200">Vehicle Manager</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        <span>{staffMember.role === 'User Manager' ? 'Pending KYCs' : 'Assigned Fleet'}</span>
                        <span className="text-white">{staffMember.assignedTasks}</span>
                      </div>
                      <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${staffMember.role === 'User Manager' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} 
                          style={{ width: `${Math.min((staffMember.assignedTasks / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md bg-green-500/20 text-green-400 border-green-500/30">
                      {staffMember.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                      <UserCog size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchStaff()} 
      />
    </div>
  );
}