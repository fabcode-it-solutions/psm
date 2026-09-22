/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/libs/redux/store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnectAttempts: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  reconnectAttempts: 0,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const { data: session, status } = useSession();
  const user = useSelector((state: RootState) => state.user.user)?.user;

  useEffect(() => {
    // Only connect if user is authenticated
    if (status === 'authenticated' && session?.user && user?.id) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          token: session?.accessToken || session?.user?.email,
          userId: user.id,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000        
      });

      // Connection events
      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected:', socketInstance.id);
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
        setError(error.message);
        setReconnectAttempts(prev => prev + 1);
      });

      socketInstance.on('reconnect', (attempt) => {
        console.log('🔌 Socket reconnected after', attempt, 'attempts');
        setError(null);
        setReconnectAttempts(0);
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('🔌 Socket reconnection error:', error);
        setError(error.message);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('🔌 Socket failed to reconnect');
        setError('Failed to reconnect to server');
      });

      // Authentication events
      socketInstance.on('authenticated', (data) => {
        console.log('🔐 Socket authenticated:', data);
      });

      socketInstance.on('unauthorized', (error) => {
        console.error('🔐 Socket authentication failed:', error);
        setError('Authentication failed');
        socketInstance.disconnect();
      });

      setSocket(socketInstance);

      return () => {
        console.log('🔌 Disconnecting socket...');
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [status, session, user]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    error,
    reconnectAttempts,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}