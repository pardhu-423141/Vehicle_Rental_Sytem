import { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Clock, Hammer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios'; // ⚡ Use your custom API instance for Auth tokens!

interface MaintenanceTask {
  id: string;          // Maps to Vehicle.id
  vehicleId: string;   // Maps to Vehicle.licensePlate
  vehicleName: string; // Maps to Vehicle.make + Vehicle.model
  reportedDate: string;
  status: string;
}

export default function MaintenanceHub() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Maintenance Data (Vehicles with status 'Maintenance')
  const fetchMaintenanceTasks = async () => {
    try {
      setLoading(true);
      // Fetch all vehicles
      const { data } = await api.get('/admin/vehicles'); 
      
      if (Array.isArray(data)) {
        // Filter only the vehicles that are in maintenance
        const maintenanceVehicles = data.filter((v: any) => 
          v.status === 'Maintenance' || v.status === 'maintenance'
        );

        const mappedTasks = maintenanceVehicles.map((v: any) => ({
          id: v.id,
          vehicleId: v.licensePlate,
          vehicleName: `${v.make} ${v.model}`,
          reportedDate: new Date(v.updatedAt).toLocaleDateString(),
          status: v.status 
        }));
        
        setTasks(mappedTasks);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceTasks();
  }, []);

  // 2. Resolve Task: Updates vehicle status back to "Available"
  const handleResolve = async (vehicleId: string, vehicleName: string) => {
    try {
      // ⚡ Re-use your existing update endpoint. We only send the status!
      await api.put(`/admin/vehicles/${vehicleId}`, {
        status: 'Available'
      });
      
      toast.success(`${vehicleName} is now Available!`);
      // Remove it from the UI immediately without needing to refresh the page
      setTasks(prev => prev.filter(t => t.id !== vehicleId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const activeCount = tasks.length;

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="text-gray-400 font-medium">Synchronizing Maintenance Logs...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Maintenance Hub</h1>
        <p className="text-gray-400 mt-2">Recovery center for vehicles currently out of service.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 shadow-lg shadow-red-900/10">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">In the Shop</p>
          </div>
        </div>
        
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Clock size={24}/></div>
          <div>
            <p className="text-2xl font-bold text-white">{activeCount > 0 ? 'Active Work' : 'All Clear'}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Workflow Status</p>
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
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{task.vehicleName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono">
                    {task.vehicleId}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">General Maintenance / Routine Check</p>
                <p className="text-[10px] text-gray-500 mt-2">Status Updated: {task.reportedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                 <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1 tracking-tighter">Current Phase</p>
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {task.status.toUpperCase()}
                 </div>
              </div>
              
              <button 
                onClick={() => handleResolve(task.id, task.vehicleName)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 whitespace-nowrap"
              >
                <CheckCircle size={18} /> Mark Available
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/20">
            <Wrench size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No vehicles currently require maintenance.</p>
          </div>
        )}
      </div>
    </div>
  );
}