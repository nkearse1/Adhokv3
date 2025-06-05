import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'admin' | 'client' | 'talent' | null;

interface AuthState {
  authUser: any | null;
  userId: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const USE_MOCK_SESSION = true;

// Change these values to simulate different user roles
const MOCK_USER_ROLE: UserRole = 'client'; // 'talent' | 'client' | 'admin'
const MOCK_EXPERTISE_LEVEL: 'Specialist' | 'Pro Talent' | 'Expert' = 'Expert';

function getMockUser(
  level: 'Specialist' | 'Pro Talent' | 'Expert' = 'Expert',
  role: UserRole = 'talent'
) {
  if (role === 'client') {
    return {
      id: 'mock-client-id',
      email: 'client@adhok.dev',
      user_metadata: {
        full_name: 'Mock Client User',
        user_role: 'client',
      }
    };
  }

  return {
    id: 'mock-talent-id',
    email: 'talent@adhok.dev',
    user_metadata: {
      full_name: `Mock ${level} User`,
      user_role: 'talent',
      marketing: {
        expertiseLevel: level
      }
    }
  };
}

export function useAuth(): AuthState {
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    setLoading(true);

    if (USE_MOCK_SESSION) {
      const stored = localStorage.getItem('mockUser');
      const user = stored ? JSON.parse(stored) : getMockUser(MOCK_EXPERTISE_LEVEL, MOCK_USER_ROLE);
      if (!stored) {
        localStorage.setItem('mockUser', JSON.stringify(user));
      }

      setAuthUser(user);
      setUserId(user.id);
      const role = user.user_metadata?.user_role as UserRole;
      setUserRole(role);
      setIsAuthenticated(true);
      setIsAdmin(role === 'admin');
      setLoading(false);
      return;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      setAuthUser(null);
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const user = session.user;
    setAuthUser(user);
    setUserId(user.id);
    const role = user.user_metadata?.user_role as UserRole;
    setUserRole(role);
    setIsAuthenticated(true);
    setIsAdmin(role === 'admin');
    setLoading(false);
  };

  useEffect(() => {
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!USE_MOCK_SESSION && session?.user) {
        loadSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    authUser,
    userId,
    userRole,
    isAuthenticated,
    isAdmin,
    loading,
  };
}
