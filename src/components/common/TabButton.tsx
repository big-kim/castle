import React from 'react';
import { cn } from '../../lib/utils';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'rounded';
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  active, 
  onClick, 
  children, 
  className,
  variant = 'default'
}) => {
  const baseClasses = 'flex-1 py-3 px-4 text-sm font-medium transition-all duration-200';
  
  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl'
  };
  
  const stateClasses = active
    ? 'bg-primary text-white shadow-md'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        stateClasses,
        className
      )}
    >
      {children}
    </button>
  );
};