import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  History,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Define the Status type based on your Prisma Schema
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  vehicle: {
    name: string;
    type: string;
    image: string;
    managerName?: string; // Adjust based on your Vehicle schema
  };
}

export default function RideHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredRides = bookings.filter(ride => {
    if (filter === 'Active') return ride.status === 'PENDING' || ride.status === 'CONFIRMED' || ride.status === 'IN_PROGRESS';
    if (filter === 'Completed') return ride.status === 'COMPLETED';
    return true;
  });

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-700">
      
      {/* 1. Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">My Trips</h1>
          <p className="text-gray-400 mt-2">Track your upcoming, active, and past rentals.</p>
        </div>

        {/* 2. Filter Tabs */}
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

      {/* 3. Ride List */}
      <div className="space-y-6">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <div key={ride.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 flex flex-col md:flex-row gap-6 lg:gap-8 group">
              
              {/* Vehicle Image */}
              <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 relative bg-black/40">
                <img src={ride.vehicle.image} alt={ride.vehicle.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                
                {/* Dynamic Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md flex items-center gap-1.5 ${
                    ride.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    (ride.status === 'PENDING' || ride.status === 'CONFIRMED') ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {ride.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
                    {ride.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Ride Details */}
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{ride.vehicle.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">Booking ID: {ride.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-white flex items-center md:justify-end">
                        <IndianRupee size={18} />{ride.totalPrice}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Amount</p>
                    </div>
                  </div>

                  {/* Time & Location Grid */}
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

                {/* Actions based on Status */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                  {ride.status === 'COMPLETED' ? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition border border-white/10">
                      <FileText size={16} /> View Receipt
                    </button>
                  ) : (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition border border-white/10">
                        <MapPin size={16} /> Get Directions to Hub
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition border border-red-500/20">
                        <AlertCircle size={16} /> Help / Support
                      </button>
                    </>
                  )}
                  {ride.vehicle.managerName && (
                    <span className="ml-auto text-xs text-gray-500 flex items-center gap-1 hidden sm:flex">
                      <CheckCircle2 size={12} /> Managed by {ride.vehicle.managerName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="w-full py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
            <History size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No rides found</h3>
            <p className="text-gray-400 max-w-md mb-6">
              You don't have any {filter.toLowerCase()} rides right now.
            </p>
            <Link to="/marketplace" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
              Book a Vehicle
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}