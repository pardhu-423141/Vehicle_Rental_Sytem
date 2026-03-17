import React, { useState } from 'react';
import { X, Camera, Car, Fuel, Users, UserCircle, IndianRupee, ChevronDown, Gauge } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddVehicleModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop for Glass Effect */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header - Workflow Step 3 */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Register New Vehicle</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Step 3: Fleet Addition</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* 1. Vehicle Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Basic Information</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Vehicle Model Name</label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input type="text" placeholder="e.g. Royal Enfield Himalayan" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">License Plate Number</label>
                <input type="text" placeholder="AP-39-XX-0000" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Category</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer">
                    <option className="bg-slate-900">Bike</option>
                    <option className="bg-slate-900">Auto</option>
                    <option className="bg-slate-900">Sedan</option>
                    <option className="bg-slate-900">SUV</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Seating</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="number" placeholder="2" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Management & Pricing - Workflow Roles */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-tighter">Administrative Control</h4>
              
              {/* Manager Assignment Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Assign Vehicle Manager</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 text-blue-400" size={18} />
                  <select className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer">
                    <option className="bg-slate-900">Select Manager</option>
                    <option className="bg-slate-900">Suresh V. (Vehicle Manager)</option>
                    <option className="bg-slate-900">Mahesh K. (Vehicle Manager)</option>
                    <option className="bg-slate-900">Rahul S. (Maintenance Specialist)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-gray-500" size={18} />
                </div>
                <p className="text-[10px] text-gray-500 italic ml-1">*This manager will handle Step 5: Handover</p>
              </div>

              {/* Status Selection - Lifecycle Step 4 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Initial Status</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer font-bold">
                  <option className="bg-slate-900 text-green-400">Available</option>
                  <option className="bg-slate-900 text-yellow-400">Booked</option>
                  <option className="bg-slate-900 text-blue-400">In Use</option>
                  <option className="bg-slate-900 text-red-400">Under Maintenance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Hourly Rental Rate</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 text-green-400" size={18} />
                  <input type="number" placeholder="40" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Vehicle Photograph</label>
            <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500/50 hover:bg-white/5 transition cursor-pointer group">
              <Camera className="mb-2 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">Click to upload vehicle photo</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition transform hover:scale-[1.02] active:scale-95"
            >
              Add to Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}