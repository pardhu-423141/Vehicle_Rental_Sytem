import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Car,
  Loader2,
  Search // ⚡ Added Search icon
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ServiceInbox() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ⚡ New Search State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/operations/maintenance');
      setTasks(data);
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
      toast.error("Failed to load service inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/operations/maintenance/${taskId}`, { status: newStatus });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      if (newStatus === 'Resolved') {
        toast.success("Task resolved! Vehicle is now Available for rent.");
      } else {
        toast.success(`Task moved to ${newStatus}.`);
      }
    } catch (error) {
      toast.error("Failed to update task status.");
    }
  };

  // ⚡ Filter Logic: Search by Vehicle Name, Plate, Task ID, or Issue Description
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const vehicleName = `${task.vehicle?.make} ${task.vehicle?.model}`.toLowerCase();
    
    return (
      vehicleName.includes(query) ||
      (task.vehicle?.licensePlate || '').toLowerCase().includes(query) ||
      (task.issue || '').toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query)
    );
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      {/* 1. Header & Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wrench className="text-blue-400" size={32} /> Service Inbox
          </h1>
          <p className="text-gray-400 mt-2">Manage vehicle repair requests and routine maintenance.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center shadow-lg">
            <p className="text-2xl font-bold text-white leading-none">{pendingCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Pending</p>
          </div>
          <div className="px-5 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center shadow-lg">
            <p className="text-2xl font-bold text-purple-400 leading-none">{inProgressCount}</p>
            <p className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold mt-1">In Progress</p>
          </div>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="mb-6 relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search by vehicle, plate, or issue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition text-sm shadow-inner"
        />
      </div>

      {/* 3. Task List */}
      <div className="space-y-6">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (
          <div key={task.id} className={`bg-white/5 backdrop-blur-xl border rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300 relative overflow-hidden group ${
            task.status === 'Resolved' ? 'border-green-500/20 opacity-60' : 'border-white/10 hover:border-white/20'
          }`}>
            
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10">
              
              <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border flex items-center gap-1 w-fit ${
                    task.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    task.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {task.status === 'Resolved' && <CheckCircle2 size={12}/>}
                    {task.status === 'In Progress' && <Wrench size={12}/>}
                    {task.status === 'Pending' && <Clock size={12}/>}
                    {task.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Car size={18} className="text-gray-400" /> {task.vehicle?.make} {task.vehicle?.model}
                </h3>
                <p className="text-sm font-mono text-gray-400 bg-black/20 inline-block px-2 py-1 rounded border border-white/5 mt-1">
                  {task.vehicle?.licensePlate}
                </p>
                <p className="text-[10px] text-gray-600 mt-2 font-mono" title={task.id}>
                  ID: {task.id.split('-')[0].toUpperCase()}
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Reported Issue</p>
                  <p className="text-gray-200 text-lg leading-relaxed mb-4">{task.issue}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                    <Clock size={14} /> Logged on {new Date(task.reportedDate).toLocaleDateString()} at {new Date(task.reportedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                {task.status !== 'Resolved' && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                    {task.status === 'Pending' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'In Progress')}
                        className="px-6 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 font-bold rounded-xl flex items-center gap-2 transition active:scale-95 text-sm"
                      >
                        <Wrench size={16} /> Start Repair
                      </button>
                    )}
                    
                    <button 
                      onClick={() => updateTaskStatus(task.id, 'Resolved')}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 transition active:scale-95 text-sm shadow-lg shadow-green-900/30"
                    >
                      <CheckCircle2 size={16} /> Mark as Resolved
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
             <CheckCircle2 size={48} className="text-gray-600 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white mb-1">
               {searchQuery ? 'No matching tasks' : 'Inbox Zero!'}
             </h3>
             <p className="text-gray-400">
               {searchQuery ? 'Try adjusting your search terms.' : 'All vehicles are fully operational.'}
             </p>
          </div>
        )}
      </div>

    </div>
  );
}