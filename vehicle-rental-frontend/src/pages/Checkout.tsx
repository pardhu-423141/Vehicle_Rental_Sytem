import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, IndianRupee, ShieldCheck, CheckCircle2,
  Loader2, X, Ticket, Tag, ChevronDown, AlertCircle, Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingRange { startDate: string; endDate: string; }
interface Vehicle {
  id: string; make: string; model: string; year: number;
  rentalRate: number; imageUrl: string | null; type: string;
  bookings?: BookingRange[];
}
interface UserCoupon {
  id: string; code: string; couponType: string;
  discountType: 'PERCENT' | 'FIXED'; discountValue: number;
  maxDiscount: number | null; minBookingAmount: number | null;
  conditions: string | null; expiresAt: string | null;
  status: string; savings?: number;
}

const discountLabel = (c: UserCoupon, amount?: number) => {
  if (c.discountType === 'FIXED') return `₹${c.discountValue} OFF`;
  const pct = `${c.discountValue}%${c.maxDiscount ? ` (up to ₹${c.maxDiscount})` : ''}`;
  if (amount && amount > 0) {
    const raw = (amount * c.discountValue) / 100;
    const savings = c.maxDiscount ? Math.min(raw, c.maxDiscount) : raw;
    return `${pct}  •  saves ₹${Math.round(savings)}`;
  }
  return pct;
};

const formatExpiry = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const couponModalRef = useRef<HTMLDivElement>(null);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Booking confirmed modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  const kycApproved = user?.kycStatus === 'APPROVED';

  // Fetch vehicle
  useEffect(() => {
    if (!id) return;
    api.get(`/vehicles/${id}`)
      .then(r => { setVehicle(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.message || 'Vehicle not found.'); setLoading(false); });
  }, [id]);

  // Auth / KYC guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) { toast.error('Please log in.'); navigate('/login'); }
    else if (!kycApproved) { toast.error('KYC approval required.'); navigate('/kyc'); }
  }, [authLoading, user, kycApproved, navigate]);

  // Days calculation
  useEffect(() => {
    if (pickupDate && dropoffDate && dropoffDate > pickupDate) {
      const days = Math.ceil(Math.abs(dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      setTotalDays(Math.max(days, 1));
    } else setTotalDays(0);
  }, [pickupDate, dropoffDate]);

  const isDateAvailable = (date: Date) => {
    if (!vehicle?.bookings?.length) return true;
    return !vehicle.bookings.some(b => {
      const s = new Date(b.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(b.endDate); e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    });
  };

  const baseCost = totalDays * (vehicle?.rentalRate || 0);
  const taxes = Math.round(baseCost * 0.18);
  const grossTotal = baseCost + taxes;
  const discountAmt = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, grossTotal - discountAmt);

  // Refetch eligible coupons when amount changes
  useEffect(() => {
    if (grossTotal > 0 && showCouponModal) fetchCoupons();
  }, [grossTotal, showCouponModal]);

  // Close modal on outside click (use currentTarget-safe check)
  useEffect(() => {
    if (!showCouponModal) return;

    const handler = (e: MouseEvent) => {
      const el = couponModalRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setShowCouponModal(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCouponModal]);









  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await api.get(`/coupons/eligible?amount=${grossTotal}`);
      setAvailableCoupons(res.data || []);
    } catch {
      setAvailableCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const openCouponModal = async () => {
    setShowCouponModal(true);
    await fetchCoupons();
  };

  const handleApplyCoupon = async (code?: string) => {
    const codeToUse = (code || couponInput).trim().toUpperCase();
    if (!codeToUse) return;
    setCouponError(null);
    setValidating(true);
    try {
      const res = await api.post('/coupons/validate', { code: codeToUse, amount: grossTotal });
      if (res.data.valid) {
        setAppliedCoupon({ code: res.data.coupon.code, discount: res.data.discount });
        setCouponInput(res.data.coupon.code);
        setShowCouponModal(false);
        toast.success(`Coupon applied! You save ₹${res.data.discount}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code.';
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !dropoffDate || totalDays <= 0) {
      toast.error('Please select valid dates.');
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create booking as PENDING
      const bookingRes = await api.post('/bookings/', {
        vehicleId: id,
        startDate: pickupDate.toISOString(),
        endDate: dropoffDate.toISOString(),
        couponCode: appliedCoupon?.code
      });

      const booking = bookingRes.data;
      setSavedAmount(booking.discount || 0);

      // 2) Create Razorpay order
      const payRes = await api.post('/payments/razorpay/create-order', {
        bookingId: booking.id,
        amount: booking.totalPrice
      });

      const { key_id, order_id, amount } = payRes.data;

      // 3) Open Razorpay checkout popup
      const options = {
        key: key_id,
        amount,
        currency: 'INR',
        name: 'Vehicle Rental System',
        description: 'Vehicle booking payment',
        order_id,
        handler: function () {
          // Webhook is source of truth; just show user a pending message.
          setShowConfirmModal(true);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        notes: { bookingId: booking.id },
        theme: { color: '#2563eb' }
      };

      // Load Razorpay script dynamically to avoid cross-origin runtime issues.
      const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.body.appendChild(s);
      });

      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayCtor = (window as any).Razorpay;
      if (!RazorpayCtor) {
        toast.error('Razorpay failed to load.');
        return;
      }

      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (error || !vehicle) return <div className="text-center text-white py-20">Vehicle not found.</div>;
  if (!kycApproved) return null;

  return (
    <div className="w-full max-w-6xl px-4 pb-20 pt-8">
<style>{`
.react-datepicker{display:flex!important;flex-direction:row!important;}
.react-datepicker-popper{z-index:2147483647!important;}
.react-datepicker__portal{z-index:2147483647!important;}
`}</style>

      {/* ── BOOKING CONFIRMED MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={36} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 text-sm mb-2">Your vehicle has been reserved.</p>

            {savedAmount > 0 && (
              <div className="my-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-green-400 font-bold text-lg">🎉 You saved ₹{savedAmount}!</p>
                <p className="text-green-300/70 text-xs mt-1">Coupon discount applied successfully</p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => { setShowConfirmModal(false); navigate('/UserDashboard'); }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); navigate('/history'); }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition text-sm"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COUPON MODAL ── */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div ref={couponModalRef} className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="text-amber-400" size={18} /> Available Coupons
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
              {loadingCoupons ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-400" size={28} /></div>
              ) : availableCoupons.length === 0 ? (
                <div className="py-14 text-center">
                  <Gift size={40} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 font-semibold">No eligible coupons</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {grossTotal === 0 ? 'Select dates first to see eligible coupons.' : 'No active coupons match this booking.'}
                  </p>
                </div>
              ) : (
                availableCoupons.map(c => {
                  const expiry = formatExpiry(c.expiresAt);
                  const isWelcome = c.couponType === 'WELCOME';
                  return (
                    <div key={c.id} className={`p-5 rounded-2xl border transition-all ${
                      isWelcome
                        ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-500/50'
                        : 'bg-purple-500/5 border-purple-500/25 hover:border-purple-500/50'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Code + badge */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <code className={`text-lg font-mono font-black ${isWelcome ? 'text-amber-300' : 'text-purple-300'}`}>
                              {c.code}
                            </code>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                              isWelcome ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            }`}>
                              {isWelcome ? '🎉 Welcome' : '⭐ Loyalty'}
                            </span>
                          </div>

                          {/* Discount */}
                          <p className="text-white font-bold text-base">
                            {discountLabel(c, grossTotal)}
                          </p>

                          {/* Details grid */}
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            {expiry && <p>📅 Expires: {expiry}</p>}
                            {c.minBookingAmount && <p>💰 Min. booking: ₹{c.minBookingAmount}</p>}
                            {c.conditions && <p className="text-gray-500 leading-relaxed mt-1.5 italic">"{c.conditions}"</p>}
                          </div>
                        </div>

                        {/* Savings badge */}
                        {c.savings != null && c.savings > 0 && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-green-400 font-black text-lg">-₹{c.savings}</p>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">savings</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleApplyCoupon(c.code)}
                        disabled={validating}
                        className={`mt-4 w-full py-2.5 font-bold text-sm rounded-xl transition ${
                          isWelcome
                            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30'
                        } disabled:opacity-50`}
                      >
                        {validating ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Apply Coupon'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Complete your Booking</h1>
        <p className="text-gray-400 mt-1 text-sm">Select your rental dates and apply any discount coupons.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left */}
        <div className="flex-1 space-y-6">

          {/* Date picker */}
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
    <Clock className="text-blue-400" size={20} /> Rental Duration
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      { label: 'Pick-up Date & Time', val: pickupDate, set: setPickupDate, min: new Date() },
      { label: 'Drop-off Date & Time', val: dropoffDate, set: setDropoffDate, min: pickupDate || new Date() }
    ].map(({ label, val, set, min }) => (
      <div key={label} className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-3.5 text-gray-500 z-10" size={16} />
          <DatePicker
            selected={val}
            onChange={(d: any) => set(d)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={min}
            filterDate={isDateAvailable}
            placeholderText="Select date & time"
            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            wrapperClassName="w-full"
            // Highlighted Changes:
            portalId="root-datepicker-portal" 
          />
        </div>
      </div>
    ))}
  </div>
</div>

          {/* ── COUPON INPUT SECTION ── */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <Tag className="text-amber-400" size={17} /> Discount Coupon
            </h2>

            {!appliedCoupon ? (
              <div className="space-y-4">
                {/* Input row */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Ticket className="absolute left-3.5 top-3.5 text-gray-500" size={15} />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className={`w-full pl-9 pr-4 py-3 bg-black/20 border rounded-xl text-white placeholder:text-gray-600 outline-none focus:ring-2 text-sm font-mono uppercase transition ${
                        couponError ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/10 focus:ring-amber-500/40'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={!couponInput.trim() || validating}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold rounded-xl transition text-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {validating ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>

                {/* Error */}
                {couponError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    <span>{couponError}</span>
                  </div>
                )}

                {/* View available coupons link */}
                <button
                  onClick={openCouponModal}
                  disabled={totalDays === 0}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Gift size={14} />
                  View Available Coupons
                  <ChevronDown size={14} />
                </button>
                {totalDays === 0 && (
                  <p className="text-[11px] text-gray-500">Select dates first to view eligible coupons.</p>
                )}
              </div>
            ) : (
              /* Applied state */
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/25 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="text-green-400" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono font-bold">{appliedCoupon.code}</code>
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-bold uppercase">Applied</span>
                    </div>
                    <p className="text-green-400 text-xs mt-0.5 font-semibold">You save ₹{appliedCoupon.discount}!</p>
                  </div>
                </div>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* KYC badge */}
          <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4">
            <ShieldCheck className="text-green-400 shrink-0" size={22} />
            <div>
              <p className="text-sm font-bold text-white">Verified Account (KYC Approved)</p>
              <p className="text-xs text-green-200/60">You're eligible to complete this booking.</p>
            </div>
          </div>
        </div>

        {/* Right — Summary */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>

            {vehicle.imageUrl && (
              <div className="w-full h-36 rounded-2xl overflow-hidden mb-5">
                <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3 text-sm pb-4 border-b border-white/10">
              <div className="flex justify-between text-gray-300">
                <span>Vehicle</span>
                <span className="font-semibold text-white">{vehicle.make} {vehicle.model}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rate</span>
                <span>₹{vehicle.rentalRate}/day</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Days</span>
                <span>{totalDays || '—'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Base amount</span>
                <span>₹{baseCost.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>GST (18%)</span>
                <span>₹{taxes}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Ticket size={12} /> Coupon Discount
                  </span>
                  <span>-₹{appliedCoupon.discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end mt-4 mb-6">
              <span className="text-white font-bold">Total Amount</span>
              <span className="text-2xl font-black text-blue-400 flex items-center gap-0.5">
                <IndianRupee size={18} />{grandTotal > 0 ? grandTotal.toFixed(0) : '0'}
              </span>
            </div>

            {/* Original vs final if coupon */}
            {appliedCoupon && grossTotal > grandTotal && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/15 rounded-xl text-center space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Original Price</span>
                  <span className="text-gray-400 line-through">₹{grossTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-green-400">You Save</span>
                  <span className="text-green-400">₹{appliedCoupon.discount}</span>
                </div>
                <div className="flex justify-between font-black">
                  <span className="text-white">Final Amount</span>
                  <span className="text-white">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>
            )}

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
