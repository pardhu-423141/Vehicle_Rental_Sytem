import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, IndianRupee, ShieldCheck, 
  CheckCircle2, Loader2, Gift, X, Ticket, Sparkles 
} from 'lucide-react';
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

// --- Wheel Rewards Configuration ---
const REWARDS = [
  { id: 1, label: '10% OFF', desc: 'Valid 3 Months', code: 'SAVE10', color: '#BFA071' }, // Gold
  { id: 2, label: 'No Luck', desc: 'Better luck next time', code: null, color: '#2A2D34' }, // Dark Gray
  { id: 3, label: '5% OFF', desc: 'Valid 1 Month', code: 'TAKE5', color: '#00796B' }, // Teal
  { id: 4, label: '7% OFF', desc: 'Valid 2 Months', code: 'DRIVE7', color: '#6A4C93' }, // Purple
  { id: 5, label: 'No Luck', desc: 'Maybe next trip', code: null, color: '#2A2D34' }, // Dark Gray
  { id: 6, label: '10% OFF', desc: 'Valid 3 Months', code: 'RENT10', color: '#BFA071' }, // Gold
  { id: 7, label: '3% OFF', desc: 'Valid 1 Month', code: 'SAVE3', color: '#1A237E' }, // Navy
  { id: 8, label: '5% OFF', desc: 'Valid 2 Months', code: 'RIDE5', color: '#6A4C93' }, // Purple
];

// Generate conic-gradient string dynamically for the wheel background
const wheelGradient = `conic-gradient(
  ${REWARDS.map((r, i) => `${r.color} ${i * 45}deg ${(i + 1) * 45}deg`).join(', ')}
)`;

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

  // --- Spinner State ---
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<typeof REWARDS[0] | null>(null);

  const kycStatus = user?.kycStatus || null;
  const isKycApproved = kycStatus === 'APPROVED';

  // Fetch Vehicle
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

  // Auth Protection
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

  // Calculate Days
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

  // Block unavailable dates
  const isDateAvailable = (date: Date) => {
    if (!vehicle?.bookings || vehicle.bookings.length === 0) return true;
    return !vehicle.bookings.some(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999); 
      return date >= start && date <= end;
    });
  };

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
      // Trigger Spinner Modal instead of instant redirect
      setShowSpinnerModal(true);
    } catch (err: any) {
      console.error('Booking failed:', err);
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Wheel Spin Logic ---
  const handleStartSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1. Pick a random winner
    const winningIndex = Math.floor(Math.random() * REWARDS.length);
    const winner = REWARDS[winningIndex];

    // 2. Calculate rotation required to land on the winner.
    // Each slice is 45 degrees. We want the center of the winning slice to face top (0 deg).
    const sliceAngle = 360 / REWARDS.length;
    const centerOffset = sliceAngle / 2;
    const targetAngle = 360 - (winningIndex * sliceAngle + centerOffset);

    // Add 5 extra full rotations for visual effect
    const extraSpins = 360 * 5;
    const finalRotation = rotation + extraSpins + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    // 3. Wait for the CSS transition to finish (5 seconds) before showing result
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winner);
    }, 5000); 
  };

  const closeAndNavigate = () => {
    setShowSpinnerModal(false);
    navigate('/Userdashboard');
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (error || !vehicle) return <div className="text-center text-white py-20">Vehicle not found.</div>;
  if (!isKycApproved) return <div className="text-center text-white py-20">KYC Required.</div>;

  const baseCost = totalDays * vehicle.rentalRate;
  const taxes = Math.round(baseCost * 0.18);
  const finalTotal = baseCost + taxes;

  return (
    <div className="w-full max-w-6xl px-4 animate-in fade-in duration-700 relative pb-20">
      {/* ⚡ Global CSS for DatePicker & Wheel Transition */}
      <style>{`
        .react-datepicker { display: flex !important; flex-direction: row !important; }
        .react-datepicker__time-container { border-left: 1px solid rgba(255, 255, 255, 0.1) !important; }
        .react-datepicker-popper { z-index: 40 !important; }
        .wheel-spin { transition: transform 5s cubic-bezier(0.2, 0.8, 0.2, 1); }
      `}</style>

      {/* --- Spinner Modal Overlay --- */}
      {showSpinnerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1D21]/90 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 overflow-hidden">
            
            {/* Close Button */}
            {!isSpinning && spinResult && (
              <button onClick={closeAndNavigate} className="absolute top-6 right-6 text-gray-500 hover:text-white transition bg-white/5 rounded-full p-2">
                <X size={20} />
              </button>
            )}
            
            <div className="text-center mb-8 relative z-10">
              <Gift className="mx-auto text-[#BFA071] mb-3 drop-shadow-[0_0_15px_rgba(191,160,113,0.5)] animate-bounce" size={48} />
              <h2 className="text-3xl font-black text-white tracking-tight">Booking Confirmed!</h2>
              <p className="text-gray-400 mt-2 font-medium">Spin the wheel for a special discount on your next ride.</p>
            </div>

            {/* View State: Spinner OR Result Card */}
            {!spinResult ? (
              <div className="relative z-10">
                {/* The Wheel Container */}
                <div className="relative w-64 h-64 mx-auto mb-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  {/* Wheel Pointer */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-white"></div>
                  </div>
                  
                  {/* The Wheel */}
                  <div 
                    className="w-full h-full rounded-full border-4 border-white/20 shadow-inner relative overflow-hidden wheel-spin"
                    style={{ transform: `rotate(${rotation}deg)`, background: wheelGradient }}
                  >
                    {/* Render Text Labels inside the wheel */}
                    {REWARDS.map((reward, i) => {
                      const angle = i * 45 + 22.5; // Center of each slice
                      return (
                        <div 
                          key={i} 
                          className="absolute inset-0 flex items-start justify-center pt-3"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md max-w-[60px] text-center leading-tight">
                            {reward.label}
                          </span>
                        </div>
                      );
                    })}
                    {/* Center Peg */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-800 shadow-xl z-10"></div>
                  </div>
                </div>

                <button 
                  onClick={handleStartSpin} 
                  disabled={isSpinning}
                  className="w-full py-4 bg-gradient-to-r from-[#BFA071] to-[#e6c185] hover:opacity-90 text-black font-black text-lg rounded-2xl transition-all shadow-[0_0_20px_rgba(191,160,113,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={24} /> Spinning...
                    </span>
                  ) : (
                    'SPIN TO WIN'
                  )}
                </button>
              </div>
            ) : (
              // Result Card
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center animate-in zoom-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BFA071] to-transparent opacity-50"></div>
                
                {spinResult.code ? (
                  <>
                    <Sparkles className="mx-auto text-[#BFA071] mb-4" size={32} />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">You Won</p>
                    <p className="text-4xl font-black text-white mt-2 mb-1">{spinResult.label}</p>
                    <p className="text-sm text-[#BFA071] font-medium">{spinResult.desc}</p>
                    
                    <div className="mt-6 bg-black/40 p-4 rounded-xl border border-dashed border-white/20 relative group cursor-pointer hover:bg-black/60 transition">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Coupon Code</p>
                      <div className="flex items-center justify-center gap-3">
                        <Ticket size={20} className="text-[#BFA071]" />
                        <span className="text-2xl font-mono font-bold text-white tracking-widest">{spinResult.code}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Aww, snap!</p>
                    <p className="text-3xl font-black text-white mt-2 mb-2">No luck this time</p>
                    <p className="text-gray-400">We still have great standard rates for you!</p>
                  </>
                )}
                
                <button 
                  onClick={closeAndNavigate}
                  className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Main Checkout UI --- */}
      <div className="mb-8 pt-8">
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
                      onChange={(date:any) => setPickupDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()} 
                      filterDate={isDateAvailable}
                      placeholderText="Select pickup time"
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                      onChange={(date:any) => setDropoffDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={pickupDate || new Date()} 
                      filterDate={isDateAvailable}
                      placeholderText="Select dropoff time"
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                <span>Vehicle</span>
                <span className="font-medium text-white">{vehicle.make} {vehicle.model}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Number of days</span>
                <span>{totalDays}</span>
              </div>
              <div className="flex justify-between text-white font-medium mt-2 pt-4 border-t border-white/10">
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