import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user || !token) return;

    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL, {
      auth: {
        token
      },
      transports: ['websocket']
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Online status tracking
    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketInstance.on('users:online', ({ users }) => {
      setOnlineUsers(new Set(users));
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user, token]);

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return React.createElement(
    SocketContext.Provider,
    { value: { socket, isConnected, isUserOnline, onlineUsers: Array.from(onlineUsers) } },
    children
  );
};

export default SocketContext;
