import { useState } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Clock, Hammer, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface MaintenanceTask {
  id: string;
  vehicleId: string;
  vehicleName: string;
  issue: string;
  reportedDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Awaiting Parts' | 'Scheduled';
}

const MOCK_TASKS: MaintenanceTask[] = [
  { id: 'MT-001', vehicleId: 'V-003', vehicleName: 'Toyota Innova', issue: 'Brake Noise Reported', reportedDate: '2026-03-01', priority: 'High', status: 'In Progress' },
  { id: 'MT-002', vehicleId: 'V-005', vehicleName: 'Honda Activa', issue: 'Oil Change & General Service', reportedDate: '2026-03-02', priority: 'Low', status: 'Scheduled' },
  { id: 'MT-003', vehicleId: 'V-009', vehicleName: 'Suzuki Swift', issue: 'Clutch plate slipping', reportedDate: '2026-02-28', priority: 'Medium', status: 'Awaiting Parts' },
];

export default function MaintenanceHub() {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const handleResolve = (id: string, name: string) => {
    toast.success(`${name} is now Available! Status updated in Step 9`);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* Header - Step 9 */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Maintenance Hub</h1>
        <p className="text-gray-400 mt-2">Step 9: Vehicle Manager repair and status recovery.</p>
      </div>

      {/* Maintenance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 shadow-xl shadow-red-900/10">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Active Repairs</p>
          </div>
        </div>
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Clock size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">02</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Awaiting Parts</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.12] transition-all">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-blue-400">
                <Hammer size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{task.vehicleName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{task.vehicleId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    task.priority === 'High' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{task.issue}</p>
                <p className="text-[10px] text-gray-500 mt-2">Reported on {task.reportedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                 <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1 tracking-tighter">Current Status</p>
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {task.status}
                 </div>
              </div>
              <button 
                onClick={() => handleResolve(task.id, task.vehicleName)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
              >
                <CheckCircle size={18} /> Mark as Available
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Wrench size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No vehicles currently under maintenance.</p>
          </div>
        )}
      </div>
    </div>
  );
}