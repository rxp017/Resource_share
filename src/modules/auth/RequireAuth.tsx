// src/modules/auth/RequireAuth.tsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { NotEligiblePage } from './NotEligiblePage';

export const RequireAuth: React.FC = () => {
  const { user, membership, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary, #666)' }}>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    // Preserve same-origin deep link path
    const nextPath = location.pathname + location.search;
    if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
      sessionStorage.setItem('rs_redirect_after_login', nextPath);
    }
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  if (membership && !membership.eligible) {
    return <NotEligiblePage />;
  }

  return <Outlet />;
};
