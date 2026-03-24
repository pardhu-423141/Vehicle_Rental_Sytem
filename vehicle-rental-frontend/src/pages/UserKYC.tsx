import React, { useState } from 'react';
import { ShieldCheck, Trash2, Camera, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';          // <-- import your axios instance
import { useAuth } from '../context/AuthContext';

export default function UserKYC() {
  const { user } = useAuth();            // only need user for status checks
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    idType: 'Driving License',
    idNumber: '',
  });

  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  });
  const [previews, setPreviews] = useState({ front: '', back: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: Validate file type and size
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

    // Prepare FormData
    const data = new FormData();
    data.append('idType', formData.idType);
    data.append('idNumber', formData.idNumber);
    data.append('idImageFront', files.front);
    data.append('idImageBack', files.back);

    setIsSubmitting(true);

    try {
      // Send to your backend endpoint – adjust the URL as needed
      await api.post('/kyc/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('KYC documents submitted for review!');

      // Optional: Reload the page to refresh user data (so KYC status updates)
      // This avoids needing to modify the context or other files.
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render based on KYC status
  if (user?.kycStatus === 'PENDING') return <PendingUI />;
  if (user?.kycStatus === 'APPROVED') return <ApprovedUI />;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
        <p className="text-gray-400">Upload your government-issued ID to start renting.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
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
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Front Upload */}
            <UploadBox
              label="Front Side"
              preview={previews.front}
              onFileChange={(e) => handleFileChange(e, 'front')}
              onRemove={() => removeFile('front')}
              icon={<FileText size={20} />}
              isUploading={false} // No per‑side loading indicator needed because we use one submit button
            />
            {/* Back Upload */}
            <UploadBox
              label="Back Side"
              preview={previews.back}
              onFileChange={(e) => handleFileChange(e, 'back')}
              onRemove={() => removeFile('back')}
              icon={<Camera size={20} />}
              isUploading={false}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
          {isSubmitting ? 'Uploading Documents...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}

// Upload box component (unchanged except for optional loading state)
function UploadBox({
  label,
  preview,
  onFileChange,
  onRemove,
  icon,
  isUploading,
}: {
  label: string;
  preview: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  icon: React.ReactNode;
  isUploading: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">{label}</p>
      <div className="relative aspect-video bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden group">
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
            <span className="text-xs text-gray-400">Uploading...</span>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center p-6 text-center">
            <div className="p-3 bg-white/5 rounded-full text-gray-500 mb-2 group-hover:text-blue-500 transition-colors">
              {icon}
            </div>
            <span className="text-xs text-gray-500 font-bold">Click to Upload</span>
            <input type="file" hidden accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}

function PendingUI() {
  return (
    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
      <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
      <h2 className="text-xl font-bold text-white">Verification in Progress</h2>
      <p className="text-gray-400 mt-2">Our managers are reviewing your documents. Check back in 2-4 hours.</p>
    </div>
  );
}

function ApprovedUI() {
  return (
    <div className="text-center py-20 bg-green-500/10 border border-green-500/20 rounded-3xl">
      <ShieldCheck className="text-green-500 mx-auto mb-4" size={48} />
      <h2 className="text-xl font-bold text-white">Verified Account</h2>
      <p className="text-gray-400 mt-2">You're all set! You can now book any vehicle in the fleet.</p>
    </div>
  );
}