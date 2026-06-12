import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';   // ← Task 14: use shared api instance, not hardcoded axios

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' }); // ← add phone
  const [otp, setOtp] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);   // ← Task 14: no hardcoded URL
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });  // ← Task 14
      toast.success('Account verified! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 mb-4">
            {step === 'register' ? <User size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {step === 'register' ? 'Join the Fleet' : 'Secure Verification'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {step === 'register'
              ? 'Create your account to start your journey'
              : `Check your inbox at ${formData.email}`}
          </p>
        </div>

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <GlassInput
              icon={<User size={18} />}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(v: string) => setFormData({ ...formData, name: v })}
            />
            <GlassInput
              icon={<Mail size={18} />}
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(v: string) => setFormData({ ...formData, email: v })}
            />
            <GlassInput
              icon={<Phone size={18} />}
              label="Phone Number"       
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(v: string) => setFormData({ ...formData, phone: v })}
              required={false}
            />
            <GlassInput
              icon={<Lock size={18} />}
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v: string) => setFormData({ ...formData, password: v })}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Account'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-8">
            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 text-center text-4xl tracking-[0.75rem] font-black py-5 rounded-2xl text-white focus:border-blue-500 outline-none transition-all"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/20"
              >
                {loading ? 'Verifying...' : 'Complete Verification'}
              </button>
              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full py-2 text-xs text-gray-500 hover:text-white transition flex items-center justify-center gap-1"
              >
                <ChevronLeft size={14} /> Edit Email or Go Back
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm font-medium">
            Already a member?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Access Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GlassInput({ icon, label, type, placeholder, value, onChange, required = true }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  );
}