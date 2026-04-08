import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActivated: boolean;
  token?: string; // Optional or removed entirely
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  refreshUser: (partialData: Partial<User>) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wa_session');
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        // Sanitize: ensure role and activation are exactly as expected
        const sanitized = {
          ...parsedUser,
          role: parsedUser.role?.toUpperCase() || 'USER',
          isActivated: !!parsedUser.isActivated
        };
        setUser(sanitized);
      } catch (err) {
        console.error("Failed to parse saved session", err);
        localStorage.removeItem('wa_session');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    const sanitized = {
      ...userData,
      role: userData.role?.toUpperCase() || 'USER',
      isActivated: !!userData.isActivated
    };
    localStorage.setItem('wa_session', JSON.stringify(sanitized));
    setUser(sanitized);
  };

  const refreshUser = (partialData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...partialData };
    const sanitized = {
      ...updated,
      role: updated.role?.toUpperCase() || 'USER',
      isActivated: !!updated.isActivated
    };
    localStorage.setItem('wa_session', JSON.stringify(sanitized));
    setUser(sanitized);
  };

  const logout = () => {
    localStorage.removeItem('wa_session');
    setUser(null);
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, login, refreshUser, logout, loading }}>
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
