
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'admin' | 'client' | 'talent' | null;

interface AuthContextType {
  userId: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USE_MOCK_SESSION = true;

const mockSession = {
  user: {
    id: "mock-user-id",
    email: "talent@adhok.dev",
    user_metadata: {
      full_name: "Mock User",
      user_role: "talent"
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserSession = async () => {
    try {
      if (USE_MOCK_SESSION) {
        setIsAuthenticated(true);
        setUserId(mockSession.user.id);
        const role = mockSession.user.user_metadata.user_role as UserRole;
        setUserRole(role);
        setIsAdmin(role === 'admin');
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { user } = session;

      setIsAuthenticated(true);
      setUserId(user.id);
      const role = user.user_metadata?.user_role as UserRole;
      setUserRole(role);
      setIsAdmin(role === 'admin');
      setLoading(false);
    } catch (error) {
      console.error('Error loading user session:', error);
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserSession();
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    userId,
    userRole,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};