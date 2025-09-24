import React from 'react';
import { Home, Users, Pickaxe, TrendingUp, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'p2p',
    label: 'P2P',
    icon: Users,
    path: '/p2p',
  },
  {
    id: 'mining',
    label: 'Mining',
    icon: Pickaxe,
    path: '/mining',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: TrendingUp,
    path: '/finance',
  },
  {
    id: 'gift',
    label: 'Gift',
    icon: Gift,
    path: '/gift',
  },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-t border-gray-100 px-4 py-2 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[60px]',
                active
                  ? 'bg-primary text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              )}
              aria-label={item.label}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-colors',
                  active ? 'text-white' : 'text-current'
                )} 
              />
              <span 
                className={cn(
                  'text-xs font-medium transition-colors',
                  active ? 'text-white' : 'text-current'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};