import { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import VehicleCard, { type Vehicle } from '../components/VehicleCard';
import AddVehicleModal from '../components/AddVehicleModal';
import api from '../api/axios';

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // ⚡ 1. NEW FILTER STATES
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    fuelType: 'All',
    transmission: 'All'
  });

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/vehicles');
      
      const mappedVehicles: Vehicle[] = data.map((v: any) => ({
        id: v.id,
        name: `${v.make} ${v.model}`,
        make: v.make,
        model: v.model,
        type: v.type || 'Mini', 
        plate: v.licensePlate,
        price: v.rentalRate,
        status: v.deletedAt ? 'Unavailable' : v.status,
        image: v.imageUrl,
        assignedManager: v.manager?.name || 'Unassigned',
        managerId: v.managerId || '',
        fuelType: v.fuelType,
        transmission: v.transmission,
        year: v.year
      }));

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load fleet from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from active service?")) return;
    try {
      await api.delete(`/admin/vehicles/${id}`);
      toast.success("Vehicle status updated to inactive");
      fetchFleet(); 
    } catch (error) {
      toast.error("Could not delete vehicle");
    }
  };

  const handleRestoreVehicle = async (vehicle: Vehicle) => {
    const confirmRestore = window.confirm(
      `This ${vehicle.make} ${vehicle.model} (${vehicle.plate}) is currently Unavailable. Do you want to restore it and make it Available?`
    );
    if (confirmRestore) {
      try {
        await api.put(`/admin/vehicles/${vehicle.id}`, { 
          status: 'Available',
          deletedAt: null
        });
        toast.success(`${vehicle.plate} is now Available!`);
        fetchFleet(); 
      } catch (error: any) {
        console.error("Restore Error:", error.response?.data);
        toast.error("Failed to restore vehicle. Try again.");
      }
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    if (vehicle.status === 'Unavailable') {
      handleRestoreVehicle(vehicle);
    } else {
      setSelectedVehicle(vehicle);
      setIsModalOpen(true);
    }
  };

  const handlePingManager = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Sending alert for ${vehicle.plate}...`,
        success: `Priority alert sent to Fleet Manager for ${vehicle.name} (${vehicle.plate})`,
        error: 'Failed to send notification.',
      },
      {
        style: {
          minWidth: '300px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        },
        success: { duration: 4000, icon: '🔔' },
      }
    );
  };

  // ⚡ 2. UPDATED FILTER LOGIC (Checks Search + All Filters)
  const filteredFleet = vehicles.filter(vehicle => {
    // Check Search Term
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Check Dropdown Filters
    const matchesStatus = filters.status === 'All' || vehicle.status?.toLowerCase() === filters.status.toLowerCase();
    const matchesType = filters.type === 'All' || vehicle.type === filters.type;
    const matchesFuel = filters.fuelType === 'All' || vehicle.fuelType === filters.fuelType;
    const matchesTransmission = filters.transmission === 'All' || vehicle.transmission === filters.transmission;

    return matchesSearch && matchesStatus && matchesType && matchesFuel && matchesTransmission;
  });

  // ⚡ 3. CLEAR FILTERS HELPER
  const clearFilters = () => {
    setFilters({ status: 'All', type: 'All', fuelType: 'All', transmission: 'All' });
    setSearchTerm('');
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="text-gray-400 font-medium tracking-wide">Synchronizing Fleet Systems...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fleet Command</h1>
          <p className="text-gray-400 mt-1">Total {vehicles.length} units identified.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={18}/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><List size={18}/></button>
            </div>
            <button 
                onClick={() => {
                  setSelectedVehicle(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.05]"
            >
                <Plus size={20} /> New Vehicle
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or plate..."
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* ⚡ 4. TOGGLE FILTER PANEL BUTTON */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-4 backdrop-blur-md border rounded-2xl text-white transition flex items-center gap-3 shadow-lg ${
            showFilters || Object.values(filters).some(v => v !== 'All') 
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
              : 'bg-white/10 border-white/20 hover:bg-white/20'
          }`}
        >
          <Filter size={20} /> Filter Database
        </button>
      </div>

      {/* ⚡ 5. THE EXPANDABLE FILTER PANEL */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold tracking-tight">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <X size={12} /> Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Status</label>
              <select 
                value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="under maintenance">Maintenance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Category</label>
              <select 
                value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="All">All Categories</option>
                <option value="TWO_WHEELER">2 Wheeler</option>
                <option value="FOUR_SEATER">4 Seater</option>
                <option value="FIVE_SEATER">5 Seater</option>
                <option value="SEVEN_SEATER">7 Seater</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Fuel Type</label>
              <select 
                value={filters.fuelType} onChange={(e) => setFilters({...filters, fuelType: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="All">All Fuels</option>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Transmission</label>
              <select 
                value={filters.transmission} onChange={(e) => setFilters({...filters, transmission: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="All">All Transmissions</option>
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATIC">Automatic</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Display Grid */}
      {filteredFleet.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFleet.map(vehicle => (
            <div 
              key={vehicle.id}
              onClick={() => {
                if (vehicle.status === 'Unavailable') handleRestoreVehicle(vehicle);
              }}
              className={vehicle.status === 'Unavailable' ? 'cursor-pointer' : ''}
            >
              <VehicleCard 
                vehicle={vehicle} 
                onPing={handlePingManager} 
                onDelete={handleDeleteVehicle}
                onEdit={handleEditVehicle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/20">
          <Filter size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-white font-bold text-xl mb-1">No matches found</p>
          <p className="text-gray-400 mb-6">Try adjusting your filters or search terms.</p>
          {(searchTerm || Object.values(filters).some(v => v !== 'All')) && (
             <button onClick={clearFilters} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold">
               Clear Filters
             </button>
          )}
        </div>
      )}

      <AddVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
          fetchFleet();
        }}
        initialData={selectedVehicle}
      />
    </div>
  );
}