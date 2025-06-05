import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Medal, ArrowLeft } from 'lucide-react';

export function Header() {
  const { isAuthenticated, authUser, userRole } = useAuth();
  const location = useLocation();

  const expertiseLevel = authUser?.user_metadata?.marketing?.expertiseLevel;
  const fullName = authUser?.user_metadata?.full_name;

  // Determine if we should show the dashboard button
  const shouldShowDashboard = () => {
    if (!isAuthenticated) return false;
    
    const dashboardPaths = {
      client: '/client/dashboard',
      talent: '/talent/dashboard',
      admin: '/admin/dashboard'
    };
    
    const currentDashboard = dashboardPaths[userRole];
    return currentDashboard && location.pathname !== currentDashboard;
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    switch (userRole) {
      case 'client':
        return '/client/dashboard';
      case 'talent':
        return '/talent/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getBadgeContent = () => {
    switch (expertiseLevel) {
      case 'Expert':
        return (
          <Badge className="bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" />
            Expert
          </Badge>
        );
      case 'Pro Talent':
        return (
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Medal className="h-3.5 w-3.5" />
            Pro Talent
          </Badge>
        );
      case 'Specialist':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            Specialist
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/adhok_logo_icon_teal_brand_precise3.png" alt="Adhok logo" className="h-6 w-6" />
            <span className="text-2xl font-bold text-[#2E3A8C]">Adhok</span>
          </Link>
          {shouldShowDashboard() && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#2E3A8C] hover:text-[#1B276F]"
            >
              <Link to={getDashboardPath()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          )}
        </div>

        {isAuthenticated && fullName && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{fullName}</span>
            {getBadgeContent()}
          </div>
        )}
      </div>
    </header>
  );
}