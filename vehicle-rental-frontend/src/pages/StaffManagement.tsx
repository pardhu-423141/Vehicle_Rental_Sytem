import React, { useState } from 'react';
import { UserPlus, Search, Mail, Shield, Wrench, UserCog, MoreVertical, LayoutGrid, List } from 'lucide-react';
import AddStaffModal from '../components/AddStaffModal';

interface StaffMember {
  id: string;
  name: string;
  role: 'User Manager' | 'Vehicle Manager';
  email: string;
  assignedTasks: number; // For User Mgr: Pending KYCs | For Vehicle Mgr: Assigned Vehicles
  status: 'Active' | 'On Leave' | 'Inactive';
}

const MOCK_STAFF: StaffMember[] = [
  { id: 'STF-001', name: 'Suresh V.', role: 'Vehicle Manager', email: 'suresh.v@driveadmin.com', assignedTasks: 5, status: 'Active' },
  { id: 'STF-002', name: 'Ananya R.', role: 'User Manager', email: 'ananya.r@driveadmin.com', assignedTasks: 12, status: 'Active' },
  { id: 'STF-003', name: 'Rahul S.', role: 'Vehicle Manager', email: 'rahul.s@driveadmin.com', assignedTasks: 3, status: 'On Leave' },
  { id: 'STF-004', name: 'Mahesh K.', role: 'Vehicle Manager', email: 'mahesh.k@driveadmin.com', assignedTasks: 8, status: 'Active' },
];

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Filter staff based on search input
  const filteredStaff = MOCK_STAFF.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* 1. Page Header */}
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

      {/* 2. Search Toolbar */}
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

      {/* 3. Staff Directory Table */}
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
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{staff.name}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {staff.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badges */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {staff.role === 'User Manager' ? (
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

                  {/* Workload Metric */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        <span>{staff.role === 'User Manager' ? 'Pending KYCs' : 'Assigned Fleet'}</span>
                        <span className="text-white">{staff.assignedTasks}</span>
                      </div>
                      <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${staff.role === 'User Manager' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} 
                          style={{ width: `${(staff.assignedTasks / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${
                      staff.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      staff.status === 'On Leave' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {staff.status}
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

      {/* 4. Role Assignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-500/20 rounded-lg"><Shield className="text-purple-400" size={20}/></div>
             <h4 className="text-white font-bold">User Management</h4>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">Verifies customer KYC documents including Aadhaar and Driving Licenses to ensure booking security.</p>
        </div>
        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-orange-500/20 rounded-lg"><Wrench className="text-orange-400" size={20}/></div>
             <h4 className="text-white font-bold">Fleet Operations</h4>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">Handles vehicle handover, return inspections, and maintenance tracking for assigned vehicles.</p>
        </div>
      </div>

      {/* Add Staff Modal Component */}
      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}