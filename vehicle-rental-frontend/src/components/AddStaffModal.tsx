import React from 'react';
import { X, UserPlus, Mail, Shield, Wrench, Briefcase } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStaffModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
            <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-widest font-bold">System Hierarchy Control</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form className="p-8 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="e.g. Suresh V."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="email" 
                placeholder="manager@driveadmin.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Assign Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-blue-400" size={18} />
              <select className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer">
                <option className="bg-slate-900" value="vehicle-manager">Vehicle Manager</option>
                <option className="bg-slate-900" value="user-manager">User Manager</option>
              </select>
            </div>
            <p className="text-[10px] text-gray-500 italic ml-1">
              *Vehicle Managers handle maintenance; User Managers handle KYC.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition transform hover:scale-[1.02] active:scale-95"
            >
              Confirm Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}