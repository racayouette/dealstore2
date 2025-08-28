import { useState, useEffect } from 'react';
import { getUserSession, setUserSession, clearUserSession, type UserSession } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and setup listener for storage changes
  useEffect(() => {
    const checkAuth = () => {
      const session = getUserSession();
      setUser(session);
      setIsLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_session') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData: { id: string; username: string; email: string }) => {
    setUserSession(userData);
    const session = getUserSession();
    setUser(session);
  };

  const logout = () => {
    clearUserSession();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}