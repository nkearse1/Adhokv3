
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

// Mock session for development
const mockSession = {
  user: {
    id: "mock-user-id",
    email: "test@adhok.dev",
    user_metadata: {
      full_name: "Test User",
      user_role: "talent" // Can be changed to test different roles
    }
  }
};

// Mock projects for testing
const mockProjects = [
  {
    id: "proj-1",
    title: "SEO Optimization Campaign",
    description: "Improve search rankings for e-commerce website",
    status: "open",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 2000,
    metadata: {
      marketing: { expertiseLevel: "mid" }
    }
  },
  {
    id: "proj-2",
    title: "Social Media Strategy",
    description: "Develop comprehensive social media plan",
    status: "in_progress",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 3000,
    metadata: {
      marketing: { expertiseLevel: "expert" }
    }
  },
  {
    id: "proj-3",
    title: "Content Marketing Plan",
    description: "Create monthly blog content strategy",
    status: "open",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 1500,
    metadata: {
      marketing: { expertiseLevel: "entry" }
    }
  }
];

const USE_MOCK_SESSION = true; // Toggle this to use mock session

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserSession = async () => {
    try {
      if (USE_MOCK_SESSION) {
        // Use mock session
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

      // Get role from user metadata
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

  const value = {
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