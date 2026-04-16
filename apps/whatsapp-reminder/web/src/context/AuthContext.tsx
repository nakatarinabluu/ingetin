import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role } from '@ingetin/types';

/**
 * Minimal session data stored in localStorage.
 * Full profile is managed by React Query (useProfile).
 */
export interface Session {
  id: string;
  role: Role;
  username: string;
  isActivated: boolean;
}

const SESSION_KEY = 'wa_session';

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  login: (sessionData: Session) => void;
  updateSession: (partialData: Partial<Session>) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    // 🧸 MOCK BYPASS: Auto-login for UI development
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      setSession({
        id: 'mock-user-id',
        username: 'budisatria',
        role: Role.USER, // Changed to USER focus
        isActivated: true
      });
      setLoading(false);
      return;
    }

    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession({
          id: parsed.id,
          username: parsed.username,
          role: (parsed.role?.toUpperCase() as Role) || Role.USER,
          isActivated: !!parsed.isActivated
        });
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((sessionData: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  }, []);

  const updateSession = useCallback((partialData: Partial<Session>) => {
    setSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...partialData };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    // Note: Redirection is handled by the 'auth-required' event listener in App.tsx
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      isAuthenticated: !!session, 
      login, 
      updateSession, 
      logout, 
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
