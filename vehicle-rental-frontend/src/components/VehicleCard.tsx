import React from 'react';
import { Settings, Trash2, Fuel, Users, Gauge, UserCircle, BellRing } from 'lucide-react';

export interface Vehicle {
  id: string;
  name: string;
  type: 'Bike' | 'Auto' | 'Mini' | 'Sedan' | 'SUV';
  plate: string;
  price: number;
  // Updated to match your documentation lifecycle
  status: 'Available' | 'Booked' | 'In Use' | 'Under Maintenance'; 
  image: string;
  assignedManager: string; // New: Step 3
}

interface Props {
  vehicle: Vehicle;
  onPing: (id: string) => void; // New: Step 7
}

export default function VehicleCard({ vehicle, onPing }: Props) {
  const statusStyles = {
    Available: 'bg-green-500/20 text-green-400 border-green-500/30',
    Booked: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'In Use': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Under Maintenance': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-40 w-full bg-black/20">
        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md ${statusStyles[vehicle.status]}`}>
          {vehicle.status}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg">{vehicle.name}</h3>
          <p className="text-blue-400 font-bold">₹{vehicle.price}/hr</p>
        </div>
        
        {/* Manager Assignment Display */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
          <UserCircle size={14} className="text-blue-400" />
          <span>Manager: <span className="text-gray-200 font-medium">{vehicle.assignedManager}</span></span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
            <Users size={14} className="text-gray-400" />
            <span className="text-[10px] text-white">4 Seats</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
            <Fuel size={14} className="text-gray-400" />
            <span className="text-[10px] text-white">Petrol</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
            <Gauge size={14} className="text-gray-400" />
            <span className="text-[10px] text-white">Manual</span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Ping Button for Step 7: Issue Reporting */}
          <button 
            onClick={() => onPing(vehicle.id)}
            className="p-2 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition"
            title="Ping Manager regarding issue"
          >
            <BellRing size={16} />
          </button>
          <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
            <Settings size={14} /> Edit
          </button>
          <button className="p-2 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}