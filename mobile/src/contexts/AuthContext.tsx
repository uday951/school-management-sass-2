import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureTokenStorage } from '../storage/secure-store';
import apiClient from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  school: any | null;
  activeYear: any | null;
  roles: string[];
  activeRole: string | null;
  unreadNotificationsCount: number;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: string) => void;
  bootstrapSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [school, setSchool] = useState<any | null>(null);
  const [activeYear, setActiveYear] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const bootstrapSession = async () => {
    try {
      const accessToken = await secureTokenStorage.getAccessToken();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      const res = await apiClient.get('/mobile/bootstrap');
      const { user: userProfile, school: schoolProfile, activeYear: ay, roles: userRoles, unreadNotificationsCount: count } = res.data.data;

      setUser(userProfile);
      setSchool(schoolProfile);
      setActiveYear(ay);
      setRoles(userRoles);
      setUnreadNotificationsCount(count);

      if (userRoles.length > 0) {
        setActiveRole(userRoles[0]);
      }
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Session bootstrap failed:', err);
      await secureTokenStorage.clearTokens();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password: pass });
      const { accessToken, refreshToken } = res.data.data;

      await secureTokenStorage.saveAccessToken(accessToken);
      await secureTokenStorage.saveRefreshToken(refreshToken);

      await bootstrapSession();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = await secureTokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Backend logout call failed, cleaning up locally anyway:', err);
    } finally {
      await secureTokenStorage.clearTokens();
      setUser(null);
      setSchool(null);
      setActiveYear(null);
      setRoles([]);
      setActiveRole(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const switchRole = (role: string) => {
    if (roles.includes(role)) {
      setActiveRole(role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        school,
        activeYear,
        roles,
        activeRole,
        unreadNotificationsCount,
        login,
        logout,
        switchRole,
        bootstrapSession,
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
