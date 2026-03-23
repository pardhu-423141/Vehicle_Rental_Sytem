import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react/jsx-dev-runtime';

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  // 1. Wait for the server handshake to finish
  if (loading) return null; 

  // 2. If a user is already logged in, send them to the Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3. If no user, allow them to see the Login/Register page
  return children;
};