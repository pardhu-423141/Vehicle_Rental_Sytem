import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data: Tasks assigned to this specific manager by the Admin
const INITIAL_TASKS = [
  { 
    id: 'TSK-091', 
    vehicle: 'Mahindra Thar', 
    plate: 'AP-39-TR-8810',
    issue: 'Customer reported squeaky brakes during last return.', 
    priority: 'High', 
    status: 'Pending',
    reportedDate: 'Mar 20, 09:30 AM'
  },
  { 
    id: 'TSK-088', 
    vehicle: 'Hyundai i20', 
    plate: 'AP-39-KL-5541',
    issue: 'Routine 10,000km oil change and tire rotation required.', 
    priority: 'Low', 
    status: 'In Progress',
    reportedDate: 'Mar 18, 02:15 PM'
  },
  { 
    id: 'TSK-085', 
    vehicle: 'Tata Nexon EV', 
    plate: 'AP-39-EV-001',
    issue: 'Charging port flap is loose. Needs tightening.', 
    priority: 'Medium', 
    status: 'Pending',
    reportedDate: 'Mar 19, 11:00 AM'
  }
];

// CHANGED: Component name is now ServiceInbox to avoid collision with Admin's MaintenanceHub
export default function ServiceInbox() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const updateTaskStatus = (id: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
    
    if (newStatus === 'Resolved') {
      toast.success(`Task ${id} resolved! Vehicle marked as Available.`);
    } else {
      toast.success(`Task ${id} moved to ${newStatus}.`);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'High' && t.status !== 'Resolved').length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      {/* 1. Page Header & Stats */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* CHANGED: UI Title updated */}
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wrench className="text-blue-400" size={32} /> Service & Repair Inbox
          </h1>
          <p className="text-gray-400 mt-2">Manage repair requests and routine servicing alerts assigned by the Admin.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-2xl font-bold text-white leading-none">{pendingCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Pending Jobs</p>
          </div>
          <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-red-400 leading-none">{highPriorityCount}</p>
            <p className="text-[10px] text-red-500/70 uppercase tracking-widest font-bold mt-1">High Priority</p>
          </div>
        </div>
      </div>

      {/* 2. Task List */}
      <div className="space-y-6">
        {tasks.map(task => (
          <div key={task.id} className={`bg-white/5 backdrop-blur-xl border rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300 relative overflow-hidden group ${
            task.status === 'Resolved' ? 'border-green-500/20 opacity-60' : 
            task.priority === 'High' ? 'border-red-500/30' : 'border-white/10'
          }`}>
            
            {task.priority === 'High' && task.status !== 'Resolved' && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
            )}

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 relative z-10">
              
              <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border flex items-center gap-1 w-fit ${
                    task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {task.priority === 'High' && <ShieldAlert size={12}/>}
                    {task.priority} Priority
                  </span>
                  
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

                <h3 className="text-xl font-bold text-white mb-1">{task.vehicle}</h3>
                <p className="text-sm font-mono text-gray-400 bg-black/20 inline-block px-2 py-1 rounded border border-white/5">{task.plate}</p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Reported Issue</p>
                  <p className="text-gray-200 text-lg leading-relaxed mb-4">{task.issue}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                    <Clock size={14} /> Logged by Admin on {task.reportedDate}
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
        ))}
      </div>

    </div>
  );
}