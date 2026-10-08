import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { LoadingState } from '../ui/state-feedback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verificando sessão segura..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 bg-danger-subtle/40 border border-danger-line rounded-xl">
          <h2 className="text-lg font-bold text-danger-text">Acesso Restrito</h2>
          <p className="text-sm text-danger-text mt-2">
            Esta funcionalidade requer privilégios de <strong>{requiredRole}</strong>. Seu papel atual é <strong>{user?.role}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
