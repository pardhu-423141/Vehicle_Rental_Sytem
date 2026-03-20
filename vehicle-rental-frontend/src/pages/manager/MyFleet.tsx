import React, { useState } from 'react';
import { Car, Wrench, CheckCircle2, AlertTriangle, MoreVertical, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

// Initial Mock Data for the assigned fleet
const INITIAL_FLEET = [
  { id: 'V-003', name: 'Tata Nexon EV', plate: 'AP-39-EV-001', type: 'SUV', status: 'Booked', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800' },
  { id: 'V-004', name: 'Suzuki Swift', plate: 'AP-39-DX-9012', type: 'Mini', status: 'In Use', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800' },
  { id: 'V-006', name: 'Hyundai i20', plate: 'AP-39-KL-5541', type: 'Mini', status: 'Available', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800' },
  { id: 'V-008', name: 'Mahindra Thar', plate: 'AP-39-TR-8810', type: 'SUV', status: 'Under Maintenance', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800' },
];

type VehicleStatus = 'Available' | 'Booked' | 'In Use' | 'Under Maintenance';

export default function MyFleet() {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Function to handle manual status overrides
  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    setFleet(fleet.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    setActiveDropdown(null);
    toast.success(`Vehicle ${vehicleId} marked as ${newStatus}.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pt-8">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assigned Fleet Inventory</h1>
          <p className="text-gray-400 mt-2">Monitor and manually override vehicle statuses for your assigned lot.</p>
        </div>
        
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Vehicles Managed</p>
          <p className="text-2xl font-bold text-white leading-none">{fleet.length}</p>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {fleet.map(vehicle => (
          <div key={vehicle.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col relative">
            
            {/* Image Area */}
            <div className="h-48 relative bg-black/40 shrink-0">
              <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover opacity-90" />
              
              {/* Dynamic Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 ${
                  vehicle.status === 'Available' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  vehicle.status === 'Booked' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  vehicle.status === 'In Use' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {vehicle.status === 'Under Maintenance' && <Wrench size={10} />}
                  {vehicle.status === 'Available' && <CheckCircle2 size={10} />}
                  {vehicle.status}
                </span>
              </div>

              {/* Status Override Menu Trigger */}
              <button 
                onClick={() => setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg border border-white/10 transition"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === vehicle.id && (
                <div className="absolute top-12 right-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-white/5 border-b border-white/5">
                    Override Status
                  </div>
                  <button onClick={() => handleStatusChange(vehicle.id, 'Available')} className="w-full text-left px-4 py-3 text-sm text-green-400 hover:bg-white/5 transition flex items-center gap-2">
                    <CheckCircle2 size={14} /> Available
                  </button>
                  <button onClick={() => handleStatusChange(vehicle.id, 'Under Maintenance')} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition flex items-center gap-2">
                    <AlertTriangle size={14} /> Maintenance
                  </button>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{vehicle.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{vehicle.type}</p>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Plate No.</span>
                  <span className="text-sm text-gray-200 font-mono">{vehicle.plate}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Vehicle ID</span>
                  <span className="text-sm text-gray-200 font-mono">{vehicle.id}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {activeDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
      )}
    </div>
  );
}