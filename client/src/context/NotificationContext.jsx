import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeAdvisory, setActiveAdvisory] = useState({
    id: 'adv-01',
    message: 'Somnath Evening Aarti digital slots now open | Dwarka queue smooth: <15 min wait',
    type: 'info',
    active: true,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('divyatra_jwt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchNotifications = useCallback(async () => {
    // When not logged in, notifications must be empty
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      // Local fallback
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    if (!user) return;
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    } catch (err) {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    } catch (err) {}

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const showToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateAdvisory = (message, type = 'info') => {
    setActiveAdvisory({ id: `adv-${Date.now()}`, message, type, active: true });
  };

  const unreadCount = user ? notifications.filter((n) => !n.read).length : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications: user ? notifications : [],
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
        toasts,
        showToast,
        removeToast,
        activeAdvisory,
        updateAdvisory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
