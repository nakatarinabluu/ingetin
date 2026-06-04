import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Role } from '@ingetin/types';

import { setAuthToken } from '@/shared/api/client';

/**
 * Minimal session data stored in localStorage for UI state.
 * JWT Token is managed by HttpOnly cookies in production, or memory/axios interceptors.
 * Full profile is managed by React Query (useProfile).
 */
export interface Session {
  id: string;
  role: Role;
  username: string;
  isActivated: boolean;
  token?: string; // Added for in-memory access by hooks
}

// Session data that comes from login payload
export interface AuthPayload extends Session {
  token: string; 
}

const SESSION_KEY = 'wa_session';

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  login: (payload: AuthPayload) => void;
  updateSession: (partialData: Partial<Session>) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession({
          id: parsed.id,
          username: parsed.username,
          role: (parsed.role?.toUpperCase() as Role) || Role.USER,
          isActivated: !!parsed.isActivated,
          token: parsed.token // Restored for frontend functionality until HttpOnly cookies are implemented
        });

        if (parsed.token) {
            setAuthToken(parsed.token);
        }
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((payload: AuthPayload) => {
    const sessionData: Session = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      isActivated: payload.isActivated,
      token: payload.token // Keep in memory state
    };
    
    // Sync with API Client
    setAuthToken(payload.token);

    // Persist all session data including token for now
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

    setSession(sessionData);
    }, []);

    const updateSession = useCallback((partialData: Partial<Session>) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...partialData };
      // Persist all session data
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
    }, []);
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setAuthToken(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    // This can be used to trigger a profile re-fetch if needed
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      isAuthenticated: !!session, 
      login, 
      updateSession, 
      logout, 
      refreshUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
