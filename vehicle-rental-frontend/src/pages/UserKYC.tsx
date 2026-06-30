import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Trash2, Camera, Loader2, FileText, 
  Clock, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
const API_URL = import.meta.env.VITE_API_URL;
export default function UserKYC() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new uploads
  const [formData, setFormData] = useState({
    idType: 'Driving License',
    idNumber: '',
  });

  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  });
  const [previews, setPreviews] = useState({ front: '', back: '' });

  // 1. Fetch user profile to get the uploaded KYC images and exact status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/user/profile');
        // Handle nested data structures gracefully
        setUserData(res.data?.user || res.data?.data || res.data);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        toast.error('Could not load KYC status.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }
      setFiles(prev => ({ ...prev, [side]: file }));
      setPreviews(prev => ({ ...prev, [side]: URL.createObjectURL(file) }));
    }
  };

  const removeFile = (side: 'front' | 'back') => {
    setFiles(prev => ({ ...prev, [side]: null }));
    setPreviews(prev => ({ ...prev, [side]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.front || !files.back || !formData.idNumber) {
      toast.error('Please provide ID number and both images.');
      return;
    }

    const data = new FormData();
    data.append('idType', formData.idType);
    data.append('idNumber', formData.idNumber);
    data.append('idImageFront', files.front);
    data.append('idImageBack', files.back);

    setIsSubmitting(true);

    try {
      await api.post('/kyc/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('KYC documents submitted for review!');
      window.location.reload(); // Refresh to fetch the newly uploaded images
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to construct image URLs if backend sends relative paths
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading Status...</p>
      </div>
    );
  }

  const kycStatus = userData?.kycStatus?.toUpperCase() || 'INCOMPLETE';
  const kycData = userData?.kycData;

  // 2. Render Submitted Documents (For Pending & Approved)
  if ((kycStatus === 'PENDING' || kycStatus === 'APPROVED') && kycData) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Dynamic Header based on Status */}
        {kycStatus === 'APPROVED' ? (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full text-green-400 shrink-0">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Identity Verified</h1>
              <p className="text-gray-400 mt-1">Your documents have been approved. You are ready to ride.</p>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center gap-4">
            <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-400 shrink-0">
              <Clock size={32} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Verification in Progress</h1>
              <p className="text-gray-400 mt-1">Your submitted documents are currently under review by our managers.</p>
            </div>
          </div>
        )}

        {/* Read-Only Document Viewer */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">Submitted Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Document Type</p>
              <p className="text-white font-medium">{kycData.idType}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Document Number</p>
              <p className="text-white font-mono">{kycData.idNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Front Side</p>
              <div className="aspect-video bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-inner">
                <img src={getImageUrl(kycData.idImageFront)} alt="ID Front" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Back Side</p>
              <div className="aspect-video bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-inner">
                <img src={getImageUrl(kycData.idImageBack)} alt="ID Back" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Upload Form (For Incomplete or Rejected)
  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
      
      {kycStatus === 'REJECTED' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={24} />
          <p className="text-sm text-red-200">
            <strong>Your previous submission was rejected.</strong> Please ensure the images are clear, well-lit, and match the entered ID number.
          </p>
          {userData?.kycStatus === 'REJECTED' && (
  <div className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="text-red-400" size={20} />
      <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest">KYC Rejected</h3>
    </div>
    <p className="text-gray-300 text-sm">
      Your KYC was rejected. Please review the reason below and re-submit corrected documents.
    </p>
    {userData?.kycData?.rejectionReason && (
      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Reason</p>
        <p className="text-red-300 text-sm font-medium">{userData.kycData.rejectionReason}</p>
      </div>
    )}
  </div>
)}
        </div>
        
      )}

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
        <p className="text-gray-400">Upload your government-issued ID to unlock vehicle bookings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition shadow-inner"
              >
                <option value="Driving License">Driving License</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">ID Number</label>
              <input
                type="text"
                placeholder="Ex: DL-123456789"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <UploadBox
              label="Front Side"
              preview={previews.front}
              onFileChange={(e: React.ChangeEvent<HTMLInputElement, Element>) => handleFileChange(e, 'front')}
              onRemove={() => removeFile('front')}
              icon={<FileText size={20} />}
            />
            <UploadBox
              label="Back Side"
              preview={previews.back}
              onFileChange={(e: React.ChangeEvent<HTMLInputElement, Element>) => handleFileChange(e, 'back')}
              onRemove={() => removeFile('back')}
              icon={<Camera size={20} />}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/40"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
          {isSubmitting ? 'Uploading Documents...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}

// Upload box component
function UploadBox({ label, preview, onFileChange, onRemove, icon }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">{label}</p>
      <div className="relative aspect-video bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden group hover:border-blue-500/50 transition-colors">
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-3 right-3 p-2 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6 text-center">
            <div className="p-4 bg-white/5 rounded-full text-gray-400 mb-3 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
              {icon}
            </div>
            <span className="text-xs text-gray-400 font-bold">Click to Browse</span>
            <input type="file" hidden accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}