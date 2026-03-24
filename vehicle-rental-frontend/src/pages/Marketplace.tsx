import React, { useState } from 'react';
import { IndianRupee, UserCircle, Car, Bike, CarFront, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Mock Data reflecting Step 3 requirements
const MOCK_VEHICLES = [
  { id: 'V-001', name: 'Honda Activa 6G', type: 'Bike', price: 40, status: 'Available', manager: 'Suresh V.', image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800' },
  { id: 'V-002', name: 'Royal Enfield Classic', type: 'Bike', price: 80, status: 'Available', manager: 'Suresh V.', image: 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?q=80&w=800' },
  { id: 'V-003', name: 'Tata Nexon EV', type: 'SUV', price: 350, status: 'Available', manager: 'Mahesh K.', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800' },
  { id: 'V-004', name: 'Suzuki Swift', type: 'Mini', price: 120, status: 'In Use', manager: 'Mahesh K.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800' },
  { id: 'V-005', name: 'Hyundai Verna', type: 'Sedan', price: 200, status: 'Available', manager: 'Rahul S.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800' },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Visual Category Definitions
  const categories = [
    { id: 'All', label: 'All Rides', icon: LayoutGrid },
    { id: 'Bike', label: 'Bikes', icon: Bike },
    { id: 'Mini', label: 'Mini Cars', icon: Car },
    { id: 'Sedan', label: 'Sedans', icon: Car },
    { id: 'SUV', label: 'SUVs', icon: CarFront },
  ];

  // Core Logic: Filter by category and STRICTLY 'Available' status
  const availableFleet = MOCK_VEHICLES.filter(v => v.status === 'Available');
  
  const filteredVehicles = availableFleet.filter(vehicle => {
    return selectedCategory === 'All' || vehicle.type === selectedCategory;
  });

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      
      {/* 1. Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Vehicle Fleet</h1>
        <p className="text-gray-400 mt-2">Select a category to browse our currently available vehicles.</p>
      </div>

      {/* 2. Visual Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border ${
                isSelected 
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-4 rounded-full mb-3 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                <category.icon size={28} strokeWidth={1.5} />
              </div>
              <span className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Available Vehicle Grid */}
      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white">
          {selectedCategory === 'All' ? 'All Available Vehicles' : `${selectedCategory}s`}
        </h2>
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
              
              {/* Image Area */}
              <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10">
                  {vehicle.type}
                </div>
              </div>

              {/* Details Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{vehicle.name}</h3>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">ID: {vehicle.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-400 tracking-tight flex items-center justify-end">
                      <IndianRupee size={16} />{vehicle.price}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">per hour</p>
                  </div>
                </div>

                {/* Manager Info */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 text-xs text-gray-400">
                  <UserCircle size={14} className="text-gray-500" />
                  <span>Managed by: <span className="text-gray-300 font-medium">{vehicle.manager}</span></span>
                </div>

                {/* Booking Action */}
                <Link 
                  to={`/checkout/${vehicle.id}`}
                  className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
          <Car size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No {selectedCategory !== 'All' ? selectedCategory.toLowerCase() + 's' : 'vehicles'} available</h3>
          <p className="text-gray-400 max-w-md">
            We couldn't find any available vehicles in this category right now.
          </p>
        </div>
      )}

    </div>
  );
}