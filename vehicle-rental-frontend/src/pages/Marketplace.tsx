import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, UserCircle, Car, Bike, CarFront, LayoutGrid, 
  Loader2, ShieldAlert, MessageSquare, Star, X, ChevronRight, 
  Fuel, Settings, Users 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // ⚡ ADDED useNavigate
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Define the shape of a vehicle based on your Prisma model
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  fuelType: string;
  transmission: string;
  rentalRate: number;
  imageUrl: string | null;
  type: 'TWO_WHEELER' | 'FOUR_SEATER' | 'FIVE_SEATER' | 'SEVEN_SEATER' | 'LUXURY';
  seatingCapacity: number;
  status: string;
}

// Mapping from backend enum to UI-friendly labels and icons
const vehicleTypeMap = {
  TWO_WHEELER: { label: '2 Wheeler', icon: Bike, categoryId: 'Bike' },
  FOUR_SEATER: { label: '4 Seater', icon: Car, categoryId: 'Mini' },
  FIVE_SEATER: { label: '5 Seater', icon: Car, categoryId: 'Sedan' },
  SEVEN_SEATER: { label: '7 Seater', icon: CarFront, categoryId: 'SUV' },
  LUXURY: { label: 'Luxury', icon: CarFront, categoryId: 'Luxury' },
};

// UI categories (visible to the user) mapped to backend type values
const categories = [
  { id: 'All', label: 'All Rides', icon: LayoutGrid },
  { id: 'Bike', label: 'Bikes', icon: Bike, types: ['TWO_WHEELER'] },
  { id: 'Mini', label: 'Mini Cars', icon: Car, types: ['FOUR_SEATER'] },
  { id: 'Sedan', label: 'Sedans', icon: Car, types: ['FIVE_SEATER'] },
  { id: 'SUV', label: 'SUVs', icon: CarFront, types: ['SEVEN_SEATER'] },
  { id: 'Luxury', label: 'Luxury', icon: CarFront, types: ['LUXURY'] },
];

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate(); // ⚡ ADDED
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  // ⚡ ADDED: States for Vehicle Details Modal & Reviews
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch KYC status from backend or use auth context
  useEffect(() => {
    const fetchKycStatus = async () => {
      if (user?.kycStatus) {
        setKycStatus(user.kycStatus);
        return;
      }
      try {
        const res = await api.get('/kyc/status');
        setKycStatus(res.data.status);
      } catch (err) {
        setKycStatus(null);
      }
    };
    fetchKycStatus();
  }, [user]);

  // Fetch available vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vehicles/');
        // Filter only vehicles with status 'available'
        const availableVehicles = res.data.filter((v: Vehicle) => v.status === 'Available');
        setVehicles(availableVehicles);
        console.log('Fetched vehicles:', availableVehicles);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setError('Could not load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // ⚡ ADDED: Fetch Reviews when a vehicle is selected for viewing
  useEffect(() => {
    if (viewingVehicle) {
      const fetchReviews = async () => {
        try {
          setLoadingReviews(true);
          // Assuming your backend route for getting a vehicle's reviews is GET /reviews/:vehicleId
          const res = await api.get(`/reviews/${viewingVehicle.id}`);
          setReviews(res.data);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [viewingVehicle]);

  // Filter vehicles based on selected category
  const filteredVehicles = vehicles.filter(vehicle => {
    if (selectedCategory === 'All') return true;
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return false;
    // Check if vehicle's type is in the category's allowed types
    return category.types?.includes(vehicle.type);
  });

  const isBookingAllowed = kycStatus === 'APPROVED';

  // Helper to get vehicle display details
  const getVehicleDisplay = (type: Vehicle['type']) => {
    return vehicleTypeMap[type] || { label: type, icon: Car, categoryId: 'Other' };
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl px-4 text-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
          <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Vehicle Fleet</h1>
        <p className="text-gray-400 mt-2">
          Select a category to browse our currently available vehicles.
        </p>
      </div>

      {/* Category Buttons */}
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
              <div
                className={`p-4 rounded-full mb-3 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                }`}
              >
                <category.icon size={28} strokeWidth={1.5} />
              </div>
              <span className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white">
          {selectedCategory === 'All'
            ? 'All Available Vehicles'
            : `${categories.find(c => c.id === selectedCategory)?.label || selectedCategory}`}
        </h2>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => {
            const display = getVehicleDisplay(vehicle.type);
            const Icon = display.icon;
            return (
              <div
                key={vehicle.id}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Image Area */}
                <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                  <img
                    src={vehicle.imageUrl || '/placeholder-car.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 flex items-center gap-1">
                    <Icon size={12} />
                    <span>{display.label}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs rounded-full">
                    {vehicle.seatingCapacity} seats
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">
                        {vehicle.year} • {vehicle.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-400 tracking-tight flex items-center justify-end">
                        <IndianRupee size={16} />
                        {vehicle.rentalRate}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        per day
                      </p>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-white/5 rounded-full">{vehicle.fuelType}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-full">{vehicle.transmission}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-full">{vehicle.licensePlate}</span>
                  </div>

                  {/* Manager Info (placeholder) */}
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 text-xs text-gray-400">
                    <UserCircle size={14} className="text-gray-500" />
                    <span>
                      Managed by: <span className="text-gray-300 font-medium">Fleet Team</span>
                    </span>
                  </div>

                  {/* Booking Action */}
                  {isBookingAllowed ? (
                    // ⚡ CHANGED: Instead of a Link straight to checkout, open the details modal
                    <button
                      onClick={() => setViewingVehicle(vehicle)}
                      className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      View Details & Book
                    </button>
                  ) : (
                    // ⚡ CHANGED: Give non-KYC users the ability to at least view details too!
                    <button
                      onClick={() => setViewingVehicle(vehicle)}
                      className="mt-4 w-full py-3 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                    >
                      View Details (KYC Required to Book)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
          <Car size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No vehicles available in this category
          </h3>
          <p className="text-gray-400 max-w-md">
            Try selecting a different category or check back later.
          </p>
        </div>
      )}

      {/* ⚡ ADDED: VEHICLE DETAIL MODAL */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            
            <button 
              onClick={() => setViewingVehicle(null)} 
              className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition"
            >
              <X size={20} />
            </button>

            {/* Left Column: Media */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-black relative">
              <img 
                src={viewingVehicle.imageUrl || '/placeholder-car.jpg'} 
                className="w-full h-full object-cover" 
                alt={`${viewingVehicle.make} ${viewingVehicle.model}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>

            {/* Right Column: Details, Specs, Reviews, & Checkout Action */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {viewingVehicle.status}
                </span>
                <h2 className="text-3xl font-black text-white mt-4">
                  {viewingVehicle.make} {viewingVehicle.model}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {viewingVehicle.year} Edition • {viewingVehicle.color} • Plate: {viewingVehicle.licensePlate}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                  <Fuel size={16} className="text-gray-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Fuel</p>
                  <p className="text-xs text-white font-bold">{viewingVehicle.fuelType}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                  <Settings size={16} className="text-gray-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Trans</p>
                  <p className="text-xs text-white font-bold">{viewingVehicle.transmission}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                  <Users size={16} className="text-gray-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Capacity</p>
                  <p className="text-xs text-white font-bold">{viewingVehicle.seatingCapacity} Ppl</p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="flex-1 mb-8">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <MessageSquare size={16} className="text-blue-400" /> User Reviews
                </h3>
                
                {loadingReviews ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {reviews.map((rev: any) => (
                      <div key={rev.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">{rev.user?.name || 'Verified Renter'}</span>
                          <div className="flex gap-0.5 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                    No reviews yet. Be the first to rent and review this vehicle!
                  </p>
                )}
              </div>

              {/* Final Action Bar */}
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rental Rate</p>
                  <p className="text-2xl font-black text-white flex items-center">
                    <IndianRupee size={20}/>{viewingVehicle.rentalRate}
                    <span className="text-xs text-gray-500 ml-1 font-normal">/day</span>
                  </p>
                </div>
                
                {isBookingAllowed ? (
                  // Navigate to Checkout!
                  <button 
                    onClick={() => navigate(`/checkout/${viewingVehicle.id}`)}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => { 
                      setViewingVehicle(null); 
                      toast.error("Please complete KYC verification before booking."); 
                    }}
                    className="flex-1 py-4 bg-gray-600/50 text-gray-300 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={18} /> Complete KYC
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}