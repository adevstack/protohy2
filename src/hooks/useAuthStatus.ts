
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export function useAuthStatus() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const fetchAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        throw new Error(`Failed to fetch auth status: ${response.statusText} (Status: ${response.status})`);
      }
      const data = await response.json();
      setAuthState({
        user: data.user || null,
        isAuthenticated: data.isAuthenticated || false,
        loading: false,
        error: data.error || null,
      });
    } catch (err) {
      console.error('useAuthStatus: API call to /api/auth/status failed:', err);
      // Provide a more specific message if the error is the generic "Failed to fetch"
      const specificMessage = (err instanceof Error && err.message === 'Failed to fetch')
        ? 'Failed to fetch. Please check your network connection or ensure the server is running and accessible.'
        : (err instanceof Error ? err.message : 'An unknown error occurred while checking authentication status.');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: specificMessage,
      });
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();

    // Optional: Listen for custom events to re-fetch status if needed from other parts of the app
    // For example, after a successful action that should change auth state but doesn't navigate.
    const handleAuthChange = () => fetchAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [fetchAuthStatus]);

  return { ...authState, refreshAuthStatus: fetchAuthStatus };
}
