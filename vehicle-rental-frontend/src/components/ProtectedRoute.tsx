
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  // We make this optional so we can protect routes for ALL logged-in users, 
  // or restrict them to specific roles like ['ADMIN', 'VEHICLE_MANAGER']
  allowedRoles?: string[]; 
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // 1. Wait for AuthContext to finish checking localStorage/backend
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // 2. Not logged in? Kick them to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logged in, but wrong role? Kick them to the home page.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error("Access Denied: You do not have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  // 4. They passed the security check! Render the page they asked for.
  return <Outlet />;
}