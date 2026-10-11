import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (role: Role) => Promise<void>;
  isLoading: boolean;
}

const DEMO_USERS: Record<Role, { username: string; fullName: string; role: Role }> = {
  PROJECT_MANAGER: { username: 'pm_sharma', fullName: 'Rajesh Sharma', role: 'PROJECT_MANAGER' },
  ADMIN: { username: 'admin', fullName: 'Vikramaditya Rao', role: 'ADMIN' },
  SITE_ENGINEER: { username: 'eng_patel', fullName: 'Aakash Patel', role: 'SITE_ENGINEER' },
  SAFETY_OFFICER: { username: 'safety_singh', fullName: 'Harpreet Singh', role: 'SAFETY_OFFICER' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nirman_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nirman_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
          localStorage.setItem('nirman_user', JSON.stringify(u));
        } catch {
          // If token expired, fall back to default demo user
          await switchDemoUser('PROJECT_MANAGER');
        }
      } else {
        // Set default demo session
        await switchDemoUser('PROJECT_MANAGER');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password = 'password123'): Promise<boolean> => {
    try {
      const data = await api.login({ username, password });
      setToken(data.token);
      localStorage.setItem('nirman_token', data.token);

      const u: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        active: true,
      };
      setUser(u);
      localStorage.setItem('nirman_user', JSON.stringify(u));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nirman_token');
    localStorage.removeItem('nirman_user');
  };

  const switchDemoUser = async (role: Role) => {
    const demo = DEMO_USERS[role];
    const success = await login(demo.username, 'password123');
    if (!success) {
      // In offline/mock fallback: set local user directly
      const mockUser: User = {
        id: 1,
        username: demo.username,
        email: `${demo.username}@nirman.build`,
        fullName: demo.fullName,
        role: demo.role,
        active: true,
      };
      setUser(mockUser);
      localStorage.setItem('nirman_user', JSON.stringify(mockUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        switchDemoUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
