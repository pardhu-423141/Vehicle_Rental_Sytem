import React, { useState, useEffect } from 'react';
import { 
  Car, Calendar, Clock, MapPin, IndianRupee, CheckCircle2, 
  FileText, AlertCircle, History, Loader2, XCircle, Star, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  vehicleId: string;
  vehicle: {
    id: string;
    name: string;
    type: string;
    image: string;
    managerName?: string;
  };
  review?: { id: string }; // ⚡ Tells TypeScript a review might be attached
}

export default function RideHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Modal States
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  
  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/cancel/${bookingId}`); 
      toast.success("Booking cancelled successfully.");
      await fetchBookings(); 
    } catch (error: any) {
      console.error("Cancel failed:", error);
      toast.error(error.response?.data?.message || "Could not cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    if (comment.trim().length < 5) {
      toast.error("Please leave a slightly longer review (min 5 characters).");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        vehicleId: reviewBooking.vehicleId || reviewBooking.vehicle.id,
        bookingId: reviewBooking.id,
        rating,
        comment
      });
      
      toast.success("Review submitted successfully! Thank you.");
      
      // ⚡ Instantly update the UI to hide the review button
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === reviewBooking.id ? { ...b, review: { id: 'new' } } : b
        )
      );

      setReviewBooking(null);
      setRating(5);
      setComment('');
    } catch (error: any) {
      console.error("Review failed:", error);
      toast.error(error.response?.data?.error || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredRides = bookings.filter(ride => {
    if (filter === 'Active') return ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED';
    if (filter === 'Completed') return ride.status === 'COMPLETED';
    return true;
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="text-xs font-bold uppercase tracking-widest mt-2">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-700 pt-8 pb-12">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">My Trips</h1>
          <p className="text-gray-400 mt-2">Track your upcoming, active, and past rentals.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-black/20 border border-white/10 rounded-2xl w-fit">
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tab 
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => {
            const isActive = ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED';
            const isCancelled = ride.status === 'CANCELLED';
            return (
              <div key={ride.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 flex flex-col md:flex-row gap-6 lg:gap-8 group shadow-xl">
                <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 relative bg-black/40">
                  <img src={ride.vehicle.image} alt={ride.vehicle.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 ${
                      ride.status === 'ONGOING' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      ride.status === 'PENDING' || ride.status === 'CONFIRMED' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      ride.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30' // COMPLETED
                    }`}>
                      {ride.status === 'ONGOING' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                      {ride.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{ride.vehicle.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-1" title={ride.id}>Booking ID: {ride.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xl font-bold text-white flex items-center md:justify-end">
                          <IndianRupee size={18} />{ride.totalPrice}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Amount</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Calendar size={16} /></div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Pick-up</p>
                          <p className="text-sm text-gray-200">{new Date(ride.startDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Clock size={16} /></div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Drop-off</p>
                          <p className="text-sm text-gray-200">{new Date(ride.endDate).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                    {ride.status === 'COMPLETED' ? (
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                          onClick={() => setReceiptBooking(ride)}
                          className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition border border-white/10 flex"
                        >
                          <FileText size={16} /> Receipt
                        </button>
                        
                        {/* ⚡ Hide the button if the review exists */}
                        {!ride.review && (
                          <button 
                            onClick={() => setReviewBooking(ride)}
                            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-xl transition border border-yellow-500/20 flex shadow-lg shadow-yellow-900/20"
                          >
                            <Star size={16} className="fill-current" /> Review
                          </button>
                        )}
                      </div>
                    ) : isActive && !isCancelled ? (
                      <button
                        onClick={() => cancelBooking(ride.id)}
                        disabled={cancellingId === ride.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition border border-red-500/20 disabled:opacity-50 w-full sm:w-auto"
                      >
                        {cancellingId === ride.id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                        Cancel Booking
                      </button>
                    ) : null}

                    {ride.vehicle.managerName && (
                      <span className="ml-auto text-xs text-gray-500 flex items-center gap-1 hidden sm:flex">
                        <CheckCircle2 size={12} /> Managed by {ride.vehicle.managerName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
            <History size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No rides found</h3>
            <p className="text-gray-400 max-w-md mb-6">
              You don't have any {filter.toLowerCase()} rides right now.
            </p>
            <Link to="/marketplace" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/30">
              Book a Vehicle
            </Link>
          </div>
        )}
      </div>

      {/* --- RECEIPT MODAL --- */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setReceiptBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8 border-b border-white/5 text-center">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Receipt</h2>
              <p className="text-sm text-gray-400 mt-1 font-mono">ID: {receiptBooking.id}</p>
            </div>
            <div className="p-8 space-y-4 bg-black/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Vehicle</span>
                <span className="text-white font-bold">{receiptBooking.vehicle.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Pick-up</span>
                <span className="text-white text-right">{new Date(receiptBooking.startDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Drop-off</span>
                <span className="text-white text-right">{new Date(receiptBooking.endDate).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                <span className="text-gray-300 font-bold">Total Paid</span>
                <span className="text-2xl font-black text-green-400 flex items-center">
                  <IndianRupee size={20} />{receiptBooking.totalPrice}
                </span>
              </div>
            </div>
            <div className="p-4 bg-white/5 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Thank you for riding with us!</p>
            </div>
          </div>
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative p-8">
            <button 
              onClick={() => { setReviewBooking(null); setRating(5); setComment(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h2>
            <p className="text-sm text-gray-400 mb-6">How was your trip with the {reviewBooking.vehicle.name}?</p>
            
            <form onSubmit={submitReview}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={40} 
                      className={star <= rating ? "text-yellow-400 fill-current" : "text-gray-600"} 
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1 mb-2 block">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/40"
              >
                {isSubmittingReview ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}