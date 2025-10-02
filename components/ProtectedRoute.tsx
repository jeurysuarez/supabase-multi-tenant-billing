import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(profile.rol)) {
    return <Navigate to="/" replace />; // Or a specific 'Unauthorized' page
  }

  return <Outlet />;
};

export default ProtectedRoute;
