import { useState } from 'react';
import { MessageSquareWarning, Search, Bell, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';

interface IssueLog {
  id: string;
  vehicleId: string;
  adminName: string;
  managerName: string;
  subject: string;
  timestamp: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
}

const MOCK_LOGS: IssueLog[] = [
  { id: 'LOG-001', vehicleId: 'V-003', adminName: 'Hruthwik (Admin)', managerName: 'Rahul S.', subject: 'Brake Noise Reported by User', timestamp: '2026-03-03 10:15 AM', status: 'Acknowledged' },
  { id: 'LOG-002', vehicleId: 'V-001', adminName: 'Hruthwik (Admin)', managerName: 'Suresh V.', subject: 'Vehicle Overdue - 2 Hours', timestamp: '2026-03-03 09:00 AM', status: 'Open' },
  { id: 'LOG-003', vehicleId: 'V-008', adminName: 'Hruthwik (Admin)', managerName: 'Mahesh K.', subject: 'Low Tire Pressure Alert', timestamp: '2026-03-02 04:30 PM', status: 'Resolved' },
];

export default function IssueLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* Header - Step 7 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Issue & Communication Logs</h1>
        <p className="text-gray-400 mt-2">Step 7: Admin-to-Manager "Ping" and resolution history.</p>
      </div>

      {/* Search Filter */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search logs by Vehicle ID or Manager..."
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                <th className="px-6 py-5 font-bold">Alert Details</th>
                <th className="px-6 py-5 font-bold">Communication Path</th>
                <th className="px-6 py-5 font-bold">Time Sent</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                        <MessageSquareWarning size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{log.subject}</div>
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Vehicle: {log.vehicleId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Communication Path */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="font-semibold text-white">{log.adminName}</span>
                      <ArrowRight size={12} className="text-gray-500" />
                      <span className="font-semibold text-blue-300">{log.managerName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-xs text-gray-400">{log.timestamp}</td>

                  {/* Status Badges */}
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      log.status === 'Resolved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      log.status === 'Acknowledged' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    }`}>
                      {log.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                      <Bell size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Informative Footer */}
      <div className="mt-8 p-6 bg-blue-600/10 border border-blue-400/20 rounded-2xl flex items-start gap-4">
          <Bell size={24} className="text-blue-400 shrink-0 mt-1" />
          <div>
              <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-widest">About Step 7: Issue Tracking</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                  When the Admin detects an issue, they send a "Ping" to the assigned Vehicle Manager. 
                  The manager investigates and updates the status to "Acknowledged" or "Resolved" once the vehicle returns to "Available" status.
              </p>
          </div>
      </div>
    </div>
  );
}