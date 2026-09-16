// src/modules/preferences/OnboardingGuard.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../shared/theme';

export const OnboardingGuard: React.FC = () => {
  const { onboardingCompleted, isLoadingPreferences } = useTheme();
  const location = useLocation();

  if (isLoadingPreferences) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading preferences...</p>
      </div>
    );
  }

  // If onboarding is not completed, redirect to /onboarding unless already on /onboarding or /settings
  if (!onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/settings') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
