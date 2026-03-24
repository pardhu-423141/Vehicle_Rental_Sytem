// AddVehicleModal.tsx
import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Loader2, CarFront } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Vehicle } from './VehicleCard';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Vehicle | null;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
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
    type: 'FIVE_SEATER' // Added default enum value
  });

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
        type: initialData.type || 'FIVE_SEATER'
      });
    } else if (!initialData && isOpen) {
      setFormData({
        make: '', model: '', year: new Date().getFullYear().toString(),
        licensePlate: '', color: 'White', fuelType: 'PETROL',
        transmission: 'MANUAL', rentalRate: '', imageUrl: '', status: 'Available',
        type: 'FIVE_SEATER'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // AddVehicleModal.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 1. Manually get the token from localStorage
  const token = localStorage.getItem('token'); 

  // 2. Format your payload
  const payload = {
    ...formData,
    year: Number(formData.year),
    rentalRate: parseFloat(formData.rentalRate),
    // Ensure 'type' matches your Enum (e.g., "FIVE_SEATER")
  };

  try {
    // 3. Pass the token in the config object (3rd argument of axios.post)
    const response = await axios.post(
      'http://localhost:5000/api/admin/vehicles', 
      payload, 
      {
        headers: {
          Authorization: `Bearer ${token}` // 🛡️ This is what the backend is looking for
        },
        withCredentials: true // Only keep this if your backend uses both cookies & tokens
      }
    );

    toast.success("Vehicle Added Successfully!");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">Basic Information</h4>
              
              {/* Added Vehicle Type Dropdown */}
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