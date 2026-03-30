import React, { useState, useEffect } from 'react';
import { 
  Car, Wrench, CheckCircle2, AlertTriangle, MoreVertical, 
  Loader2, Search, ArrowLeft, History, Calendar, User, Settings,
  Fuel, Settings2, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';

type VehicleStatus = 'Available' | 'Booked' | 'In Use' | 'Under Maintenance';

export default function MyFleet() {
  const { user } = useAuth(); 
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // States for the detail view and REAL history
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vehicles'); 
      setFleet(data);
    } catch (error) {
      console.error("Fetch Fleet Error:", error);
      toast.error("Failed to load assigned fleet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    setActiveDropdown(null);
    try {
      await api.put(`/vehicles/update/${vehicleId}`, { status: newStatus });
      setFleet(fleet.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle({ ...selectedVehicle, status: newStatus });
      }
      
      toast.success(`Vehicle status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error("Failed to update vehicle status.");
    }
  };

  // ⚡ NEW FUNCTION: Fetch real history when a vehicle is clicked
  const handleVehicleClick = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setLoadingHistory(true);
    try {
      const { data } = await api.get(`/vehicles/${vehicle.id}/history`);
      setVehicleHistory(data);
    } catch (error) {
      console.error("History fetch error:", error);
      toast.error("Could not load vehicle history.");
      setVehicleHistory([]); // Fallback to empty
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredFleet = fleet.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hey, <span className="text-blue-400">{user?.name || 'Manager'}</span>! 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Here is the real-time status of the vehicles assigned to your lot.
        </p>
      </div>

      {!selectedVehicle ? (
        /* --- MAIN DASHBOARD VIEW --- */
        <div className="animate-in slide-in-from-bottom-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search make, model, or plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>

            <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-center shadow-lg whitespace-nowrap hidden md:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Managed</p>
              <p className="text-2xl font-bold text-white leading-none">{fleet.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredFleet.length > 0 ? filteredFleet.map(vehicle => (
              <div 
                key={vehicle.id} 
                onClick={() => handleVehicleClick(vehicle)} // ⚡ Updated click handler
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col relative group cursor-pointer hover:border-blue-500/30 transition-all"
              >
                
                <div className="h-48 relative bg-black/40 shrink-0 overflow-hidden">
                  <img 
                    src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800'} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" 
                  />
                  
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 shadow-lg ${
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

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg border border-white/10 transition z-10"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeDropdown === vehicle.id && (
                    <div className="absolute top-12 right-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-white/5 border-b border-white/5 pl-4">
                        Override Status
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(vehicle.id, 'Available'); }} className="w-full text-left px-4 py-3 text-sm text-green-400 hover:bg-white/5 transition flex items-center gap-2">
                        <CheckCircle2 size={14} /> Available
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(vehicle.id, 'Under Maintenance'); }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition flex items-center gap-2">
                        <AlertTriangle size={14} /> Maintenance
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{vehicle.type.replace('_', ' ')} • {vehicle.year}</p>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Plate No.</span>
                      <span className="text-sm text-gray-200 font-mono">{vehicle.licensePlate}</span>
                    </div>
                  </div>
                </div>

              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Car size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-1">
                  {searchQuery ? 'No Matching Vehicles' : 'No Vehicles Assigned'}
                </h3>
                <p className="text-gray-400">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Ask the System Administrator to assign vehicles to your lot.'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- DETAILED VEHICLE VIEW --- */
        <div className="w-full animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => setSelectedVehicle(null)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-4 py-2 bg-white/5 rounded-xl border border-white/10 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Fleet
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Vehicle Info & Specs */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-56 relative bg-black/40">
                  <img src={selectedVehicle.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800'} alt="Vehicle" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest inline-block mb-2 shadow-lg ${
                      selectedVehicle.status === 'Available' ? 'bg-green-500 text-black' :
                      selectedVehicle.status === 'Booked' ? 'bg-yellow-500 text-black' :
                      selectedVehicle.status === 'In Use' ? 'bg-blue-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {selectedVehicle.status}
                    </span>
                    <h2 className="text-2xl font-bold text-white leading-tight">{selectedVehicle.make} {selectedVehicle.model}</h2>
                    <p className="text-gray-300 text-sm font-mono mt-1">{selectedVehicle.licensePlate}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Settings2 size={14}/> Type</span>
                    <span className="text-sm font-bold text-white">{selectedVehicle.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Fuel size={14}/> Fuel</span>
                    <span className="text-sm font-bold text-white">{selectedVehicle.fuelType}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Gearbox</span>
                    <span className="text-sm font-bold text-white">{selectedVehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><IndianRupee size={14}/> Daily Rate</span>
                    <span className="text-sm font-bold text-green-400">₹{selectedVehicle.rentalRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: REAL Activity History */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                <History className="text-blue-400" size={24} /> Activity & Booking History
              </h3>

              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                     <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                     <p className="text-gray-400 text-sm">Fetching database records...</p>
                  </div>
                ) : vehicleHistory.length > 0 ? (
                  vehicleHistory.map((log) => (
                    <div key={log.id} className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          log.type === 'BOOKING' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {log.type === 'BOOKING' ? <User size={20} /> : <Wrench size={20} />}
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            log.type === 'BOOKING' ? 'text-blue-400' : 'text-orange-400'
                          }`}>
                            {log.type}
                          </span>
                          <h4 className="text-white font-bold text-sm mt-0.5">{log.desc}</h4>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {log.date}
                          </p>
                        </div>
                      </div>
                      
                      <div className="sm:text-right ml-16 sm:ml-0">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                          log.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-gray-400">No previous bookings found in the database.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {activeDropdown && !selectedVehicle && (
        <div className="fixed inset-0 z-0" onClick={() => setActiveDropdown(null)} />
      )}
    </div>
  );
}