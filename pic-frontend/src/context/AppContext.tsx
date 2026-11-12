import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AvatarGender, User } from '@/types';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { getToken, clearToken } from '@/lib/api';

const USER_KEY = 'pic_user_email'; // store email only — sensitive data stays server-side

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  currentUser: User | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
    gender: AvatarGender;
  }) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (data: Partial<User>) => void;
  unreadNotifications: number;
  refreshNotifications: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // On mount: if a token exists, restore the session from the API
  useEffect(() => {
    const token = getToken();
    const email = localStorage.getItem(USER_KEY) ?? '';

    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    authService
      .getCurrentUser(email)
      .then(user => {
        setCurrentUser({ ...user, email });
      })
      .catch(() => {
        // Token expired or invalid — clear everything
        clearToken();
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const refreshNotifications = useCallback(() => {
    if (!getToken()) return;
    notificationService.getUnreadCount().then(setUnreadNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser) refreshNotifications();
  }, [currentUser, refreshNotifications]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    // token is stored inside authService.login via setToken()
    localStorage.setItem(USER_KEY, email);
    setCurrentUser({ ...result, email });
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
    gender: AvatarGender;
  }) => {
    const result = await authService.register(data);
    localStorage.setItem(USER_KEY, data.email);
    setCurrentUser({ ...result, email: data.email });
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {}); // fire-and-forget
    clearToken();
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    setUnreadNotifications(0);
  }, []);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(u => (u ? { ...u, ...data } : u));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `t_${Date.now()}_${Math.random()}`;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateCurrentUser,
        unreadNotifications,
        refreshNotifications,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
