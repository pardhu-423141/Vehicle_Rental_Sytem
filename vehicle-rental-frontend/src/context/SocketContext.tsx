import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  type: 'issue' | 'handover' | 'kyc' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  meta?: Record<string, string>;
}

interface SocketContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const SocketContext = createContext<SocketContextType>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  clearAll: () => {}
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', user.id);
    });

    const addNotification = (data: any) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        isRead: false,
        meta: data
      };
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // keep max 50
    };

    socket.on('issue:assigned', addNotification);
    socket.on('handover:required', addNotification);
    socket.on('kyc:submitted', addNotification);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  const markRead = (id: string) =>
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );

  const clearAll = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
