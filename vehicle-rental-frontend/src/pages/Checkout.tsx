import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, ShieldCheck, CheckCircle2, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_VEHICLES = [
  { id: 'V-001', name: 'Honda Activa 6G', type: 'Bike', price: 40, image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800' },
  { id: 'V-003', name: 'Tata Nexon EV', type: 'SUV', price: 350, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800' },
];

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = MOCK_VEHICLES.find(v => v.id === id) || MOCK_VEHICLES[0];

  // SIMULATED USER STATE: Change this to 'Approved' to see the booking button unlock.
  const currentUser = {
    kycStatus: 'Approved' // Can be 'Incomplete', 'Pending', or 'Approved'
  };

  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const start = new Date(pickupDate).getTime();
      const end = new Date(dropoffDate).getTime();
      const diffInMs = end - start;
      if (diffInMs > 0) setTotalHours(Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60))));
      else setTotalHours(0);
    }
  }, [pickupDate, dropoffDate]);

  const baseCost = totalHours * vehicle.price;
  const taxes = Math.round(baseCost * 0.18);
  const finalTotal = baseCost + taxes;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.kycStatus !== 'Approved') return;
    toast.success("Booking Confirmed! Vehicle Manager has been notified.");
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  return (
    <div className="w-full max-w-6xl px-4 animate-in fade-in duration-700">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Complete your Booking</h1>
        <p className="text-gray-400 mt-2">Step 4: Select your duration and confirm.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form Details */}
        <div className="flex-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* If KYC is NOT approved, we put a slight overlay on the form to indicate it's disabled */}
            {currentUser.kycStatus !== 'Approved' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 rounded-3xl" />
            )}

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-blue-400" size={20} /> Rental Duration
            </h2>
            
            <form className="space-y-6 relative z-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pick-up Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="datetime-local" 
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      disabled={currentUser.kycStatus !== 'Approved'}
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Drop-off Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="datetime-local" 
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      disabled={currentUser.kycStatus !== 'Approved'}
                      className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Dynamic Security Box based on KYC */}
          {currentUser.kycStatus === 'Approved' ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-4">
              <ShieldCheck className="text-green-400 shrink-0" size={28} />
              <div>
                <p className="text-sm font-bold text-white">Verified Account (KYC Approved)</p>
                <p className="text-xs text-green-200/70">You are eligible to complete this booking.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
              <ShieldAlert className="text-red-400 shrink-0" size={28} />
              <div>
                <p className="text-sm font-bold text-white">Action Required: KYC Incomplete</p>
                <p className="text-xs text-red-200/70">You must upload your Driving License and ID to unlock booking.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">{vehicle.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{vehicle.type} • ID: {vehicle.id}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-white/10 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Rate per hour</span>
                <span className="flex items-center"><IndianRupee size={12}/>{vehicle.price}</span>
              </div>
              <div className="flex justify-between text-white font-medium mt-2 pt-2">
                <span>Total Amount</span>
                <span className="flex items-center text-xl text-blue-400 font-bold"><IndianRupee size={18}/>{totalHours > 0 ? finalTotal : '0'}</span>
              </div>
            </div>

            {/* Dynamic CTA Button based on KYC */}
            {currentUser.kycStatus === 'Approved' ? (
              <button 
                onClick={handleConfirmBooking}
                disabled={totalHours <= 0}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  totalHours > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40 active:scale-95' : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <CheckCircle2 size={20} /> Confirm & Pay
              </button>
            ) : (
              <Link 
                to="/kyc"
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 active:scale-95"
              >
                <ShieldCheck size={20} /> Complete KYC to Book
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}