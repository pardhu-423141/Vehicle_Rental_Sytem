import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, ShieldCheck, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingRange {
  startDate: string;
  endDate: string;
}

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
  bookings?: BookingRange[];
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const kycStatus = user?.kycStatus || null;
  const isKycApproved = kycStatus === 'APPROVED';

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

  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const start = pickupDate.getTime();
      const end = dropoffDate.getTime();
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

  // ⚡ Foolproof method to block dates accurately
  const isDateAvailable = (date: Date) => {
    if (!vehicle?.bookings || vehicle.bookings.length === 0) return true;

    return !vehicle.bookings.some(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      // Strip time to exactly midnight so calendar comparison works flawlessly
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999); 

      return date >= start && date <= end;
    });
  };

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
      await api.post('/bookings/', {
        vehicleId: id,
        startDate: pickupDate.toISOString(),
        endDate: dropoffDate.toISOString(),
      });
      toast.success('Booking confirmed! Vehicle manager has been notified.');
      setTimeout(() => navigate('/Userdashboard'), 2000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (error || !vehicle) return <div className="text-center text-white py-20">Vehicle not found.</div>;
  if (!isKycApproved) return <div className="text-center text-white py-20">KYC Required.</div>;

  return (
    <div className="w-full max-w-6xl px-4 animate-in fade-in duration-700">
      {/* ⚡ Injecting Global CSS to force time column side-by-side */}
      <style>{`
        .react-datepicker {
          display: flex !important;
          flex-direction: row !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .react-datepicker-popper {
          z-index: 50 !important;
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Complete your Booking</h1>
        <p className="text-gray-400 mt-2">Step 4: Select your duration and confirm.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-blue-400" size={20} /> Rental Duration
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pick-up Date & Time</label>
                  <div className="relative w-full">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date) => setPickupDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()} 
                      filterDate={isDateAvailable} // ⚡ Ensures dates are blocked
                      placeholderText="Select pickup time"
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [color-scheme:dark]"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Drop-off Date & Time</label>
                  <div className="relative w-full">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                    <DatePicker
                      selected={dropoffDate}
                      onChange={(date) => setDropoffDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={pickupDate || new Date()} 
                      filterDate={isDateAvailable} // ⚡ Ensures dates are blocked
                      placeholderText="Select dropoff time"
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [color-scheme:dark]"
                      wrapperClassName="w-full"
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

        <div className="w-full lg:w-[400px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            <div className="space-y-4 mb-6 pb-6 border-b border-white/10 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Number of days</span>
                <span>{totalDays}</span>
              </div>
              <div className="flex justify-between text-white font-medium mt-2 pt-2 border-t border-white/10">
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
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {submitting ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}