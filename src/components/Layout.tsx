import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GlobalHeader } from './GlobalHeader';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Determine if we should show the back button based on the current route
  const shouldShowBackButton = () => {
    const mainRoutes = ['/', '/p2p', '/mining', '/finance', '/gift', '/mypage'];
    return !mainRoutes.includes(location.pathname);
  };

  // Determine if we should show the bottom navigation
  const shouldShowBottomNav = () => {
    // Hide bottom navigation on certain pages like login, signup, etc.
    const hideNavRoutes = ['/login', '/signup', '/forgot-password'];
    return !hideNavRoutes.some(route => location.pathname.startsWith(route));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header */}
      <GlobalHeader 
        showBackButton={shouldShowBackButton()}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children || <Outlet />}
      </main>
      
      {/* Bottom Navigation */}
      {shouldShowBottomNav() && <BottomNavigation />}
    </div>
  );
};