import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. While the app is still checking the cookie/token
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/50">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // 2. If no user is logged in, redirect to login page
  if (!user) {
    // We save the 'from' location so we can send them back after they log in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If everything is good, show the page
  return children;
};