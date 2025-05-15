import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notifications as notificationAPI } from '../services/api';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced socket connection
  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Join user-specific room
        newSocket.emit('join', `user-${user._id}`);
        // Join company-specific room
        if (user.company) {
          newSocket.emit('join', `company-${user.company}`);
        }
      });

      // Enhanced notification handler
      newSocket.on('notification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/path/to/notification-icon.png'
          });
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to notification service. Will retry automatically.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching notifications...');
      const response = await notificationAPI.getAll();
      console.log('Notifications response:', response);
      
      // Check the structure of the response and extract notifications accordingly
      let notificationsList = [];
      if (response.data && response.data.notifications) {
        // If the API returns { notifications: [...] }
        notificationsList = response.data.notifications;
      } else if (Array.isArray(response.data)) {
        // If the API directly returns an array
        notificationsList = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
      }
      
      console.log('Processed notifications:', notificationsList);
      setNotifications(notificationsList);
      updateUnreadCount(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (notificationsList) => {
    if (!Array.isArray(notificationsList)) {
      console.error('Expected array for notifications list');
      return;
    }
    const count = notificationsList.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};