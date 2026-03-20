import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Camera, Car, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UserKYC() {
  // SIMULATED USER STATE: Change this to 'Incomplete', 'Pending', or 'Approved' to see the UI change!
  const [kycStatus, setKycStatus] = useState<'Incomplete' | 'Pending' | 'Approved'>('Pending');

  // Mock details to display when approved
  const verifiedDetails = {
    name: "Hruthwik Jayanth",
    aadhaar: "XXXX-XXXX-9012",
    dl: "AP-XX-XXXXXXX",
    verifiedOn: "March 18, 2026"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycStatus('Pending');
    toast.success("Documents submitted! Awaiting User Manager review.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Identity Verification</h1>
        <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
          {kycStatus === 'Approved' 
            ? "Your identity has been successfully verified. You have full access to our fleet."
            : "Complete your KYC to unlock vehicle bookings. Our User Managers will review your details."}
        </p>
      </div>

      {/* --- STATE 1: APPROVED --- */}
      {kycStatus === 'Approved' && (
        <div className="bg-white/5 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shrink-0">
              <ShieldCheck className="text-green-400" size={48} />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">KYC Verified Successfully</h2>
              <p className="text-gray-400 mb-6">Your account is fully secured and ready for bookings.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Aadhaar / National ID</p>
                  <p className="text-sm text-gray-200 font-mono">{verifiedDetails.aadhaar}</p>
                </div>
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Driving License</p>
                  <p className="text-sm text-gray-200 font-mono">{verifiedDetails.dl}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                <CheckCircle2 size={14} className="text-green-500"/> Verified by User Manager on {verifiedDetails.verifiedOn}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
            <Link to="/marketplace" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition transform hover:-translate-y-1 flex items-center gap-2">
              <Car size={20} /> Browse Fleet
            </Link>
          </div>
        </div>
      )}

      {/* --- STATE 2: PENDING --- */}
      {kycStatus === 'Pending' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
            <ShieldAlert className="text-yellow-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification in Progress</h2>
          <p className="text-gray-400 mb-8">Your documents are currently being reviewed by our team.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs text-gray-400">
            <AlertCircle size={14} /> Expected resolution: 2-4 hours
          </div>
        </div>
      )}

      {/* --- STATE 3: INCOMPLETE (Submission Form) --- */}
      {kycStatus === 'Incomplete' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ID Proof Upload */}
            <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-white text-lg">National ID / Aadhaar</h3>
              </div>
              <div className="relative aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer group-hover:bg-white/5 transition-colors overflow-hidden">
                <Upload className="text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" />
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Upload Front & Back</span>
                <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* Driving License Upload */}
            <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-600/20 rounded-2xl text-green-400">
                  <Camera size={24} />
                </div>
                <h3 className="font-bold text-white text-lg">Driving License</h3>
              </div>
              <div className="relative aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer group-hover:bg-white/5 transition-colors overflow-hidden">
                <Upload className="text-gray-500 group-hover:text-green-400 mb-2 transition-colors" />
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Upload License Image</span>
                <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600/10 border border-blue-400/20 rounded-2xl flex gap-4">
             <CheckCircle2 size={24} className="text-blue-400 shrink-0 mt-0.5" />
             <div>
               <p className="text-sm text-white font-bold mb-1 tracking-tight">Requirement Policy</p>
               <p className="text-xs text-gray-400 leading-relaxed">
                 Ensure all text is clearly legible and the document is valid. Approval is mandatory before you can proceed to the vehicle selection stage.
               </p>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/40 transition transform hover:scale-[1.01] active:scale-95"
          >
            Submit for Manual Verification
          </button>
        </form>
      )}
    </div>
  );
}