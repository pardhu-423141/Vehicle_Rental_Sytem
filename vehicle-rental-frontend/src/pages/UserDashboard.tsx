import React, { useEffect, useState, useRef } from 'react';
import {
  ShieldCheck, ShieldAlert, Car, Clock, Activity,
  ArrowRight, Loader2, FileWarning, Calendar, MapPin,
  Ticket, ChevronLeft, ChevronRight, Gift, Copy, Check,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserCoupon {
  id: string;
  code: string;
  couponType: 'WELCOME' | 'MILESTONE';
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
  minBookingAmount: number | null;
  conditions: string | null;
  expiresAt: string | null;
  status: 'Active' | 'Used' | 'Expired';
  createdAt: string;
}

// ─── Coupon config ────────────────────────────────────────────────────────────
const COUPON_META = {
  WELCOME: {
    label: 'Welcome Offer', icon: '🎉',
    gradient: 'from-amber-500/15 to-orange-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    code: 'text-amber-300',
    accent: 'text-amber-400'
  },
  MILESTONE: {
    label: 'Loyalty Reward', icon: '⭐',
    gradient: 'from-purple-500/15 to-blue-500/10',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    code: 'text-purple-300',
    accent: 'text-purple-400'
  }
};

const formatDiscount = (c: UserCoupon) =>
  c.discountType === 'FIXED'
    ? `₹${c.discountValue} OFF`
    : `${c.discountValue}% OFF${c.maxDiscount ? ` (up to ₹${c.maxDiscount})` : ''}`;

const formatExpiry = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  const today = new Date();
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expired';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) { navigate('/login', { replace: true }); return; }

    const load = async () => {
      try {
        const [profile, bookings, activeCoupons] = await Promise.all([
          api.get('/user/profile'),
          api.get('/bookings/my-bookings').catch(() => ({ data: [] })),
          api.get('/coupons/active').catch(() => ({ data: [] }))
        ]);
        setUserData(profile.data);
        setActiveRides(
          (bookings.data || []).filter((b: any) =>
            ['PENDING', 'CONFIRMED', 'ONGOING'].includes((b.status || '').toUpperCase())
          )
        );
        setCoupons(activeCoupons.data || []);
      } catch (err: any) {
        if (err.response?.status === 401) { logout?.(); navigate('/login', { replace: true }); }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });

  const actualUser = userData?.user || userData?.data || userData;

  const kycUI = () => {
    const s = (actualUser?.kycStatus || '').toUpperCase();
    const base = { APPROVED: { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'bg-green-500/10', title: 'Identity Verified', desc: 'Fully verified — ready to book.', btn: { text: 'Book a Ride', to: '/marketplace', cls: 'bg-blue-600 hover:bg-blue-700 text-white', Icon: Car } }, PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'bg-yellow-500/10', title: 'Verification Pending', desc: 'Documents are under review.', btn: { text: 'View Status', to: '/kyc', cls: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20', Icon: ArrowRight } }, REJECTED: { icon: FileWarning, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'bg-red-500/10', title: 'Verification Rejected', desc: 'Please re-submit your documents.', btn: { text: 'Re-Submit KYC', to: '/kyc', cls: 'bg-red-600 hover:bg-red-700 text-white', Icon: ArrowRight } } };
    return base[s as keyof typeof base] || { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'bg-orange-500/10', title: 'Action Required', desc: 'Upload your ID to unlock bookings.', btn: { text: 'Complete KYC', to: '/kyc', cls: 'bg-orange-600 hover:bg-orange-700 text-white', Icon: ArrowRight } };
  };

  if (loading) return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-blue-400 gap-4">
      <Loader2 size={40} className="animate-spin" />
      <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Loading Dashboard...</p>
    </div>
  );

  const kyc = kycUI();
  const KycIcon = kyc.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-16 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter">
          Welcome back, <span className="text-blue-400">{actualUser?.name || 'Explorer'}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Manage your trips, coupons and account.</p>
      </div>

      {/* ── YOUR ACTIVE COUPONS (hidden if none) ───────────────────────────────── */}
      {coupons.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Ticket className="text-amber-400" size={16} />
              Your Active Coupons
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                {coupons.length}
              </span>
            </h2>
            {coupons.length > 2 && (
              <div className="flex gap-1.5">
                <button onClick={() => scroll('left')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition border border-white/5">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => scroll('right')} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition border border-white/5">
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable coupon row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {coupons.map(c => {
              const meta = COUPON_META[c.couponType] || COUPON_META.MILESTONE;
              const expiry = formatExpiry(c.expiresAt);
              const soonExpiry = c.expiresAt && new Date(c.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={c.id}
                  className={`relative flex-shrink-0 w-72 bg-gradient-to-br ${meta.gradient} border ${meta.border} rounded-2xl overflow-hidden`}
                >
                  {/* Tear notch left */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-slate-950 rounded-full z-10" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-slate-950 rounded-full z-10" />

                  {/* Top half */}
                  <div className="px-6 pt-5 pb-4 border-b border-dashed border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${meta.badge}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <p className="text-3xl font-black text-white mt-3 leading-none">
                          {formatDiscount(c)}
                        </p>
                        {c.minBookingAmount && (
                          <p className="text-xs text-gray-400 mt-1">
                            Min. booking ₹{c.minBookingAmount}
                          </p>
                        )}
                      </div>
                      <Gift size={36} className={`${meta.accent} opacity-20`} />
                    </div>
                  </div>

                  {/* Bottom half */}
                  <div className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-widest">Code</p>
                      <code className={`text-base font-mono font-black ${meta.code} tracking-widest`}>
                        {c.code}
                      </code>
                      {expiry && (
                        <p className={`text-[10px] mt-1 font-semibold ${soonExpiry ? 'text-red-400 flex items-center gap-1' : 'text-gray-500'}`}>
                          {soonExpiry && <AlertCircle size={10} />}
                          {expiry}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copyCode(c.id, c.code)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl border transition flex-shrink-0 ${
                        copiedId === c.id
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : `${meta.gradient} ${meta.border} ${meta.accent} hover:opacity-80`
                      }`}
                    >
                      {copiedId === c.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>

                  {/* Conditions strip at bottom */}
                  {c.conditions && (
                    <div className="px-6 pb-4">
                      <p className="text-[10px] text-gray-500 leading-relaxed border-t border-white/5 pt-3">
                        {c.conditions}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── KYC Card ── */}
      <div className={`p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden`}>
        <div className={`absolute -right-20 -top-20 w-56 h-56 blur-[80px] rounded-full pointer-events-none ${kyc.glow}`} />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl border ${kyc.bg} ${kyc.border}`}>
              <KycIcon size={32} className={kyc.color} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{kyc.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{kyc.desc}</p>
            </div>
          </div>
          <Link
            to={kyc.btn.to}
            className={`px-6 py-4 font-black rounded-2xl transition-all flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap ${kyc.btn.cls}`}
          >
            {kyc.btn.text} <kyc.btn.Icon size={16} />
          </Link>
        </div>
      </div>

      {/* ── Active Rides ── */}
      <div>
        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
          <Activity className="text-blue-500" size={14} /> Active Trips
        </h3>

        {activeRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRides.map(ride => (
              <div key={ride.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col">
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-5 bg-black/40">
                  <img
                    src={ride.vehicle?.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'}
                    alt={ride.vehicle?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute top-5 left-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${
                      ride.status === 'ONGOING' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                      ride.status === 'CONFIRMED' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                      'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {ride.status === 'ONGOING' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                      {ride.status}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-1">
                  <h3 className="text-xl font-bold text-white truncate">{ride.vehicle?.name}</h3>

                  <div className="space-y-2.5 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar size={14} className="text-gray-500" />
                      <span>From {new Date(ride.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin size={14} className="text-gray-500" />
                      <span>Until {new Date(ride.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    {ride.discount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-400 font-semibold">
                        <Ticket size={14} />
                        <span>Coupon saved ₹{ride.discount}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-blue-300 font-bold">₹{ride.totalPrice?.toFixed(0)}</span>
                    <Link to="/history" className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                      Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center text-center">
            <Car size={48} className="text-gray-700 mb-4" />
            <h4 className="text-2xl font-black text-white mb-2">No active trips</h4>
            <p className="text-gray-400 mb-8 text-sm max-w-sm">Browse our fleet and book the perfect vehicle for your next journey.</p>
            {(actualUser?.kycStatus || '').toUpperCase() === 'APPROVED' ? (
              <Link to="/marketplace" className="px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition flex items-center gap-2">
                Explore Fleet <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/kyc" className="px-8 py-4 bg-orange-600/20 text-orange-400 border border-orange-500/30 text-sm font-bold rounded-2xl hover:bg-orange-600/30 transition flex items-center gap-2">
                <ShieldAlert size={16} /> Complete KYC First
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
