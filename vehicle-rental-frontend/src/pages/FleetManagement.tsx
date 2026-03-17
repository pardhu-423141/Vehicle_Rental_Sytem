import { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import VehicleCard, { type Vehicle } from '../components/VehicleCard';
import AddVehicleModal from '../components/AddVehicleModal';

const MOCK_FLEET: Vehicle[] = [
  { 
    id: 'V-001', name: 'Honda Activa', type: 'Bike', plate: 'AP-39-AX-1234', price: 40, 
    status: 'Available', image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800', 
    assignedManager: 'Suresh V.' // Step 3
  },
  { 
    id: 'V-002', name: 'Suzuki Swift', type: 'Mini', plate: 'AP-39-BC-5678', price: 120, 
    status: 'In Use', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800', 
    assignedManager: 'Mahesh K.' 
  },
  { 
    id: 'V-003', name: 'Toyota Innova', type: 'SUV', plate: 'AP-39-DX-9012', price: 350, 
    status: 'Under Maintenance', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800', 
    assignedManager: 'Rahul S.' // Step 9
  },
  { 
    id: 'V-004', name: 'Royal Enfield', type: 'Bike', plate: 'AP-39-ER-4321', price: 60, 
    status: 'Booked', image: 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?q=80&w=800', 
    assignedManager: 'Suresh V.' // Step 4
  },
];

export default function FleetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Step 7 Handler: Admin Pings Manager
  const handlePingManager = (id: string) => {
    const vehicle = MOCK_FLEET.find(v => v.id === id);
    toast.success(`Ping sent to ${vehicle?.assignedManager} regarding ${vehicle?.name}!`);
  };

  const filteredFleet = MOCK_FLEET.filter(vehicle => 
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fleet Command</h1>
          <p className="text-gray-400 mt-1">Total {MOCK_FLEET.length} vehicles under supervision.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={18}/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><List size={18}/></button>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.05]"
            >
                <Plus size={20} /> New Vehicle
            </button>
        </div>
      </div>

      {/* Toolbar */}
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
          <Filter size={20} /> All Categories
        </button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFleet.map(vehicle => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onPing={handlePingManager} 
          />
        ))}
      </div>

      <AddVehicleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}