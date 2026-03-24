import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData, {
        withCredentials: true // Important for cookies
      });

      // --- THE FIX STARTS HERE ---
      // 1. Extract the token from the response
      const { token, user } = res.data;

      // 2. Save the token to localStorage for our Axios interceptors
      if (token) {
        localStorage.setItem('token', token);
      }
      // --- THE FIX ENDS HERE ---

      toast.success('Access Granted. Welcome back!');
      
      // Update your Auth Context
      login(user);

      // Navigate based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/Userdashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center  p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Blobs - Identical to Register */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 mb-4">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Access Terminal</h2>
          <p className="text-gray-400 mt-2 text-sm">Enter your credentials to initialize session</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <GlassInput 
            icon={<Mail size={18} />} 
            label="Fleet Email" 
            type="email" 
            placeholder="operator@nitap.ac.in" 
            value={formData.email}
            onChange={(v: string) => setFormData({...formData, email: v})}
          />
          
          <div className="relative">
            <GlassInput 
              icon={<Lock size={18} />} 
              label="Access Key" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(v: string) => setFormData({...formData, password: v})}
            />
            <button 
              type="button" 
              className="absolute right-1 bottom-4 text-[10px] font-bold text-blue-400 uppercase tracking-tighter hover:text-blue-300 transition"
            >
              Forgot?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Initialize Login'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm font-medium">
            New to the Fleet?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Create Identity
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-using your exact GlassInput helper component structure
function GlassInput({ icon, label, type, placeholder, value, onChange }: any) {
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
          required
        />
      </div>
    </div>
  );
}