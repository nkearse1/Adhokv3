import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import RoleRoute from './components/routing/RoleRoute';

import { ProjectUploadFlow } from './components/ProjectUploadFlow';
import { AdminTalentList } from './components/AdminTalentList';

import TalentSignUpPage from './pages/talent/SignUp';
import SignInPage from './pages/SignIn';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import TalentProjectsPage from './pages/talent/projects';
import TalentDashboard from './pages/talent/dashboard';
import AdminDashboard from './pages/admin/dashboard';
import ClientProjectDetail from './pages/client/projects/ClientProjectDetail';
import ClientProjectWorkspace from './pages/client/projects/ClientProjectWorkspace'; // ✅ Added
import AdminProjectDetail from './pages/admin/projects/AdminProjectDetail';
import ProjectWorkspace from './pages/talent/projects/ProjectWorkspace';
import TalentProjectDetail from './pages/talent/projects/TalentProjectDetail';
import WaitlistPage from './pages/waitlist';
import Home from './pages/Home';
import ClientDashboard from './pages/client/dashboard';
import TalentPortfolioPage from './pages/talent/[user_id]/portfolio.tsx';
import { Header } from '@/components/Header';
import MockRoleToggle from '@/components/MockRoleToggle';

function AppRoutes() {
  const { isAuthenticated, isAdmin, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    if (!loading && isAuthenticated && userRole) {
      const loginRoutes = ['/signin', '/talent/signup'];
      const alreadyRedirected =
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/client') ||
        location.pathname.startsWith('/talent');

      if (loginRoutes.includes(location.pathname) && !alreadyRedirected) {
        requestAnimationFrame(() => {
          switch (userRole) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'client':
              navigate('/client/dashboard');
              break;
            case 'talent':
            default:
              navigate('/talent/dashboard');
              break;
          }
        });
      }
    }
  }, [isAuthenticated, loading, userRole, location.pathname, navigate]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/talent/signup" element={<TalentSignUpPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />

        <Route path="/admin/*" element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects/:id" element={<AdminProjectDetail />} />
          <Route path="talent" element={<AdminTalentList />} />
        </Route>

        <Route path="/client/*" element={<RoleRoute user_role="client" />}>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="projects/:id/details" element={<ClientProjectDetail />} />
          <Route path="projects/:id/workspace" element={<ClientProjectWorkspace />} /> {/* ✅ Workspace route */}
        </Route>

        <Route path="/talent/*" element={<RoleRoute user_role="talent" />}>
          <Route path="dashboard" element={<TalentDashboard />} />
          <Route path="projects" element={<TalentProjectsPage />} />
          <Route path="projects/:id/workspace" element={<ProjectWorkspace />} />
          <Route path="projects/:id/details" element={<TalentProjectDetail />} />
          <Route path=":username/portfolio" element={<TalentPortfolioPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/upload" element={<ProjectUploadFlow />} />
        </Route>

        <Route
          path="*"
          element={
            loading ? (
              <div>Loading...</div>
            ) : isAuthenticated && userRole ? (
              <Navigate to={`/${userRole}/dashboard`} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>

      {import.meta.env.MODE !== 'production' && <MockRoleToggle />}
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
