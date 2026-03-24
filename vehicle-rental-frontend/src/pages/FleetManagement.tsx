import { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Loader2 } from 'lucide-react';
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

  // 1. Fetch Fleet Data
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/vehicles');
      
      // Map Prisma model to Frontend UI interface
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
        assignedManager: 'Fleet Operations',
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

  // 2. Delete Handler (Soft Delete)
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from active service?")) return;

    try {
      await api.delete(`/admin/vehicles/${id}`);
      toast.success("Vehicle status updated to inactive");
      fetchFleet(); // Refresh list
    } catch (error) {
      toast.error("Could not delete vehicle");
    }
  };

  // 3. Restore Handler (For Unavailable Vehicles)
  // 3. Restore Handler (For Unavailable Vehicles)
  const handleRestoreVehicle = async (vehicle: Vehicle) => {
    const confirmRestore = window.confirm(
      `This ${vehicle.make} ${vehicle.model} (${vehicle.plate}) is currently Unavailable. Do you want to restore it and make it Available?`
    );
    
    if (confirmRestore) {
      try {
        // ⚡ THE FIX: Do NOT send the whole 'vehicle' object. 
        // Only send the exact fields that Prisma needs to update.
        await api.put(`/admin/vehicles/${vehicle.id}`, { 
          status: 'Available',
          deletedAt: null
        });
        
        toast.success(`${vehicle.plate} is now Available!`);
        fetchFleet(); // Refresh UI
      } catch (error: any) {
        console.error("Restore Error:", error.response?.data);
        toast.error("Failed to restore vehicle. Try again.");
      }
    }
  };

  // 4. Edit Handler
  const handleEditVehicle = (vehicle: Vehicle) => {
    // Prevent opening edit modal if it's unavailable. Force them to restore it first.
    if (vehicle.status === 'Unavailable') {
      handleRestoreVehicle(vehicle);
    } else {
      setSelectedVehicle(vehicle);
      setIsModalOpen(true);
    }
  };

  // 5. Ping Handler
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
        success: {
          duration: 4000,
          icon: '🔔',
        },
      }
    );
  };

  const filteredFleet = vehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading Screen
  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="text-gray-400 font-medium tracking-wide">Synchronizing Fleet Systems...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
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

      {/* Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or plate..."
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition flex items-center gap-3">
          <Filter size={20} /> Filter Database
        </button>
      </div>

      {/* Main Display Grid */}
      {filteredFleet.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFleet.map(vehicle => (
            <div 
              key={vehicle.id}
              // This onClick wrapper handles the "click card to restore" logic 
              onClick={() => {
                if (vehicle.status === 'Unavailable') {
                  handleRestoreVehicle(vehicle);
                }
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
          <p className="text-gray-400">No matching assets found in local storage or cloud.</p>
        </div>
      )}

      {/* Modal - Handles both ADD and EDIT */}
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