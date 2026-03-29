import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, ShieldCheck, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
  type: string;
  seatingCapacity: number;
  status: string;
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const kycStatus = user?.kycStatus || null;
  const isKycApproved = kycStatus === 'APPROVED';

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/vehicles/${id}`);
        setVehicle(res.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch vehicle:', err);
        setError(err.response?.data?.message || 'Vehicle not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  // Redirect if not logged in or KYC not approved
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please log in to continue.');
        navigate('/login');
      } else if (!isKycApproved) {
        toast.error('Please complete KYC verification to access checkout.');
        navigate('/kyc');
      }
    }
  }, [authLoading, user, isKycApproved, navigate]);

  // Calculate total days
  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const start = new Date(pickupDate).getTime();
      const end = new Date(dropoffDate).getTime();
      if (end > start) {
        const diffMs = end - start;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setTotalDays(diffDays > 0 ? diffDays : 1);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [pickupDate, dropoffDate]);

  const baseCost = vehicle ? totalDays * vehicle.rentalRate : 0;
  const taxes = Math.round(baseCost * 0.18);
  const finalTotal = baseCost + taxes;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKycApproved) {
      toast.error('KYC not approved.');
      return;
    }
    if (!pickupDate || !dropoffDate || totalDays <= 0) {
      toast.error('Please select valid pickup and dropoff dates.');
      return;
    }

    setSubmitting(true);
    try {
      const startISO = new Date(pickupDate).toISOString();
      const endISO = new Date(dropoffDate).toISOString();
      await api.post('/bookings/', {
        vehicleId: id,
        startDate: startISO,
        endDate: endISO,
      });
      toast.success('Booking confirmed! Vehicle manager has been notified.');
      setTimeout(() => navigate('/Userdashboard'), 2000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="w-full max-w-6xl px-4 text-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
          <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Vehicle Unavailable</h2>
          <p className="text-gray-400">{error || 'Vehicle not found.'}</p>
          <Link to="/marketplace" className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Browse Vehicles
          </Link>
        </div>
      </div>
    );
  }

  if (!isKycApproved) {
    return (
      <div className="w-full max-w-6xl px-4 text-center py-20">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8">
          <ShieldAlert className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">KYC Required</h2>
          <p className="text-gray-400">You need to complete KYC verification before booking a vehicle.</p>
          <Link to="/kyc" className="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Complete KYC
          </Link>
        </div>
      </div>
    );
  }

  const vehicleName = `${vehicle.make} ${vehicle.model}`;

  return (
    <div className="w-full max-w-6xl px-4 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Complete your Booking</h1>
        <p className="text-gray-400 mt-2">Step 4: Select your duration and confirm.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-blue-400" size={20} /> Rental Duration
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pick-up Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Drop-off Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="datetime-local"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-4">
            <ShieldCheck className="text-green-400 shrink-0" size={28} />
            <div>
              <p className="text-sm font-bold text-white">Verified Account (KYC Approved)</p>
              <p className="text-xs text-green-200/70">You are eligible to complete this booking.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>

            <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt={vehicleName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No image</div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">{vehicleName}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {vehicle.type} • {vehicle.year} • {vehicle.color}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-white/10 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Rate per day</span>
                <span className="flex items-center"><IndianRupee size={12}/>{vehicle.rentalRate}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Number of days</span>
                <span>{totalDays}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Base cost</span>
                <span className="flex items-center"><IndianRupee size={12}/>{baseCost}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Taxes (18%)</span>
                <span className="flex items-center"><IndianRupee size={12}/>{taxes}</span>
              </div>
              <div className="flex justify-between text-white font-medium mt-2 pt-2">
                <span>Total Amount</span>
                <span className="flex items-center text-xl text-blue-400 font-bold">
                  <IndianRupee size={18}/>{totalDays > 0 ? finalTotal : '0'}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={totalDays <= 0 || submitting}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                totalDays > 0 && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40 active:scale-95'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
              {submitting ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}