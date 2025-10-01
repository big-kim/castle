import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  children, 
  className,
  variant = 'default'
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        text: '판매중',
        color: variant === 'gradient' 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          : 'text-green-600 bg-green-50',
        icon: '🏷️'
      },
      completed: {
        text: '판매완료',
        color: variant === 'gradient'
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
          : 'text-blue-600 bg-blue-50',
        icon: '✅'
      },
      cancelled: {
        text: '취소됨',
        color: variant === 'gradient'
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          : 'text-red-600 bg-red-50',
        icon: '🔒'
      },
      pending: {
        text: '대기중',
        color: variant === 'gradient'
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
          : 'text-yellow-600 bg-yellow-50',
        icon: '⏳'
      }
    };
    
    return configs[status] || configs.active;
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={cn(
      'px-3 py-2 rounded-full text-sm font-semibold',
      variant === 'gradient' ? 'shadow-sm' : '',
      config.color,
      className
    )}>
      {children || config.text}
    </span>
  );
};