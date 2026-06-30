import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if that email is registered.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 mb-4">
            <Mail size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Forgot Password</h2>
          <p className="text-gray-400 mt-2 text-sm">Enter your email and we'll send a reset link.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-green-500/20 text-green-400">
              <ShieldCheck size={32} />
            </div>
            <p className="text-white font-semibold">Check your inbox!</p>
            <p className="text-gray-400 text-sm">
              If <span className="text-blue-400">{email}</span> is registered, a password reset link has been sent. Check your spam folder if you don't see it.
            </p>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <Link to="/login" className="text-gray-400 text-sm hover:text-white transition flex items-center justify-center gap-1">
            <ChevronLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
