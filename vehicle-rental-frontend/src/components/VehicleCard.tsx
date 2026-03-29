// VehicleCard.tsx
import React from 'react';
import { Settings, Trash2, BellRing, Users } from 'lucide-react';

export interface Vehicle {
  id: string;
  name: string;
  type: 'TWO_WHEELER' | 'FOUR_SEATER' | 'FIVE_SEATER' | 'SEVEN_SEATER' | 'LUXURY';
  seatingCapacity: number; // Added
  plate: string;
  price: number;
  status: string; 
  image: string;
  assignedManager: string;
  deletedAt?: string | null; 
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  transmission?: string;
}

interface Props {
  vehicle: Vehicle;
  onPing: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onPing, onDelete, onEdit }: Props) {
  const fallbackImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=500";
  const shouldFade = vehicle.status === 'Unavailable' || !!vehicle.deletedAt;
  const isActionDisabled = vehicle.status !== 'Available';

  const statusStyles: Record<string, string> = {
    Available: 'bg-green-500/20 text-green-400 border-green-500/30',
    Booked: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'In Use': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Unavailable: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div 
      onClick={() => shouldFade && onEdit(vehicle)}
      className={`group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden transition-all duration-500 
      ${shouldFade ? 'opacity-40 grayscale-[0.6] cursor-pointer hover:opacity-80' : 'hover:scale-[1.02] cursor-default'}`}
    >
      <div className="relative h-40 w-full bg-black/20">
        <img 
          src={vehicle.image || fallbackImage} 
          alt={vehicle.name} 
          className="w-full h-full object-cover" 
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md ${statusStyles[vehicle.status] || 'bg-gray-500/20 text-white border-white/10'}`}>
          {vehicle.status}
        </div>
        {/* Seat Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] flex items-center gap-1 border border-white/10">
          <Users size={12} /> {vehicle.seatingCapacity} Seats
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
           <h3 className="text-white font-bold text-lg truncate flex-1">{vehicle.name}</h3>
           <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
             {vehicle.type.replace('_', ' ')}
           </span>
        </div>
        <p className="text-blue-400 font-bold mb-4">₹{vehicle.price}/hr</p>

        <div className="flex gap-2">
          <button 
            disabled={isActionDisabled}
            onClick={(e) => { e.stopPropagation(); onPing(vehicle.id); }}
            className="p-2 border border-yellow-500/30 text-yellow-400 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition hover:bg-yellow-500/10"
          >
            <BellRing size={16} />
          </button>

          <button 
            disabled={isActionDisabled}
            onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition hover:bg-blue-700"
          >
            <Settings size={14} /> {isActionDisabled ? 'Locked' : 'Edit'}
          </button>
          
          {!isActionDisabled && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}
              className="p-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}