import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Wrench, Briefcase, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vehicle-manager'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // ⚡ FIX: Grab the token exactly how Login.tsx saved it
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:5000/api/admin/staff', formData, {
        headers: {
          Authorization: `Bearer ${token}` // Send token for backend verification
        },
        withCredentials: true
      });
      
      toast.success("Staff member created successfully!");
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '', role: 'vehicle-manager' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create staff.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
            <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-widest font-bold">System Hierarchy Control</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Suresh V."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="manager@driveadmin.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="password" required minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Assign Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-blue-400" size={18} />
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
              >
                <option className="bg-slate-900" value="vehicle-manager">Vehicle Manager</option>
                <option className="bg-slate-900" value="user-manager">User Manager</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={loading}
              className="flex-1 py-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}