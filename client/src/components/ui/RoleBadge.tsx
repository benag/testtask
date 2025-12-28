import React from 'react';
import { Shield, User } from 'lucide-react';

interface RoleBadgeProps {
  role: 'admin' | 'user';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const isAdmin = role === 'admin';
  
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isAdmin
          ? 'bg-purple-100 text-purple-800 border border-purple-200'
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      } ${className}`}
    >
      {isAdmin ? (
        <Shield className="h-3 w-3 mr-1" />
      ) : (
        <User className="h-3 w-3 mr-1" />
      )}
      {isAdmin ? 'Admin' : 'User'}
    </span>
  );
};
