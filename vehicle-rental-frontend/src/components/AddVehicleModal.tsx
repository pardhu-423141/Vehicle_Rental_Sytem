import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Loader2, CarFront, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Vehicle } from './VehicleCard';
import axios from 'axios';
import api from '../api/axios'; // Make sure this points to your configured axios instance

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null; // Using any to accommodate the managerId passed from FleetManagement
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<any[]>([]); // ⚡ NEW: State to hold staff list
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    licensePlate: '',
    color: 'White',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    rentalRate: '',
    imageUrl: '',
    status: 'Available',
    type: 'FIVE_SEATER',
    managerId: '' // ⚡ NEW: State for assigned manager
  });

  // 1. Handle Initial Data when opening modal
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        make: initialData.make || '',
        model: initialData.model || '',
        year: initialData.year?.toString() || new Date().getFullYear().toString(),
        licensePlate: initialData.plate || '',
        color: 'White', 
        fuelType: initialData.fuelType || 'PETROL',
        transmission: initialData.transmission || 'MANUAL',
        rentalRate: initialData.price?.toString() || '',
        imageUrl: initialData.image || '',
        status: initialData.status || 'Available',
        type: initialData.type || 'FIVE_SEATER',
        managerId: initialData.managerId || '' // ⚡ Load existing manager if editing
      });
    } else if (!initialData && isOpen) {
      setFormData({
        make: '', model: '', year: new Date().getFullYear().toString(),
        licensePlate: '', color: 'White', fuelType: 'PETROL',
        transmission: 'MANUAL', rentalRate: '', imageUrl: '', status: 'Available',
        type: 'FIVE_SEATER', managerId: ''
      });
    }
  }, [initialData, isOpen]);

// 2. ⚡ NEW: Fetch Staff list for the dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const { data } = await api.get('/admin/staff');
        
        // ⚡ FILTER: Strictly grab ONLY the Vehicle Managers
        const strictlyVehicleManagers = data.filter((manager: any) => manager.role === 'VEHICLE_MANAGER');
        
        setManagers(strictlyVehicleManagers);
      } catch (error) {
        console.error("Failed to fetch managers", error);
      }
    };
    
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  // 3. Handle Form Submission (Add OR Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token'); 

    // Format your payload
    const payload = {
      ...formData,
      year: Number(formData.year),
      rentalRate: parseFloat(formData.rentalRate),
      // If managerId is empty string, send null so it unassigns them
      managerId: formData.managerId === '' ? null : formData.managerId
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true 
      };

      // ⚡ Handle EDIT vs CREATE dynamically
      if (isEditMode && initialData) {
        await axios.put(`http://localhost:5000/api/admin/vehicles/${initialData.id}`, payload, config);
        toast.success("Vehicle Updated Successfully!");
      } else {
        await axios.post('http://localhost:5000/api/admin/vehicles', payload, config);
        toast.success("Vehicle Added Successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Submit Error:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Operation failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? `Update ${formData.make}` : 'Register New Vehicle'}
            </h2>
            <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-semibold">
              Asset Configuration
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* ⚡ NEW: MANAGER ASSIGNMENT DROPDOWN */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl mb-6">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <UserCircle size={16} /> Assign Fleet Manager
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Unassigned (General Fleet Pool) --</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.role.replace('_', ' ')})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-2">
              Assigned managers will receive alerts for maintenance and operations regarding this specific vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">Basic Information</h4>
              
              <div className="relative">
                <CarFront className="absolute left-3 top-3.5 text-blue-400" size={18} />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="TWO_WHEELER">2 Wheeler</option>
                  <option value="FOUR_SEATER">4 Seater</option>
                  <option value="FIVE_SEATER">5 Seater</option>
                  <option value="SEVEN_SEATER">7 Seater</option>
                  <option value="LUXURY">Luxury</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  required placeholder="Make" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                />
                <input 
                  required placeholder="Model" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>

              <input 
                required placeholder="License Plate" 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                value={formData.licensePlate}
                onChange={(e) => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">Technical Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                </select>
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.transmission}
                  onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                >
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                </select>
              </div>

              <input 
                required type="number" placeholder="Year" 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 text-green-400" size={18} />
                <input 
                  required type="number" placeholder="Rental Rate / Day" 
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rentalRate}
                  onChange={(e) => setFormData({...formData, rentalRate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Vehicle Image URL</label>
            <input 
              type="text" 
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditMode ? 'Update Asset' : 'Add to Fleet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}