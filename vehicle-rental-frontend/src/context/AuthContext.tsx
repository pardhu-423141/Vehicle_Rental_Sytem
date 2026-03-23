import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  kycStatus?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // 1. Efficient Check: If no hint of a user exists locally, 
      // skip the server call and go straight to "Not Logged In"
      const hint = localStorage.getItem('fleet_user');
      
      if (!hint) {
        setLoading(false);
        return; 
      }

      try {
        // 2. Verified Check: If a hint exists, verify it with the server
        const res = await api.get('/user/profile'); 
        setUser(res.data);
        localStorage.setItem('fleet_user', JSON.stringify(res.data)); // Keep it synced
      } catch (err) {
        // 3. Cleanup: If the cookie is dead, wipe the local hint
        setUser(null);
        localStorage.removeItem('fleet_user');
      } finally {
        setLoading(false); 
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fleet_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (err) {
      console.error("Logout Uplink Failed");
    } finally {
      setUser(null);
      localStorage.removeItem('fleet_user');
      // No window.location.href here to prevent forced reloads
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* 4. Smooth Loading: Don't show the app until the check is done */}
      {!loading ? children : (
        <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Synchronizing Session...</p>
           </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};