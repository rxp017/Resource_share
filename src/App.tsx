// src/App.tsx
import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AuthProvider,
  RequireAuth,
  RequireActiveMembership,
  RequireModerator,
  LoginPage,
  VerifyPendingPage,
} from './modules/auth';
import { ThemeProvider } from './shared/theme';
import { AppLayout } from './shared/layout/AppLayout';
import { OnboardingPage, SettingsPage, OnboardingGuard } from './modules/preferences';
import {
  ExplorePage,
  CreateListingPage,
  ListingDetailPage,
  MyListingsPage,
  ModerationQueuePage,
} from './modules/listings';
import {
  RequestExchangePage,
  ExchangesListPage,
  ExchangeDetailPage,
} from './modules/exchanges';
import { PublicLandingPage } from './modules/landing/PublicLandingPage';
import { UnavailableState } from './shared/components/UnavailableState';

export const App: React.FC = () => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 30,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider onSignOutCleanup={() => queryClient.clear()}>
          <ThemeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Authenticated user routes (Pending or Active) */}
              <Route element={<RequireAuth />}>
                <Route path="/verify" element={<VerifyPendingPage />} />

                {/* Active Campus Members Only */}
                <Route element={<RequireActiveMembership />}>
                  {/* Onboarding Guard: routes un-onboarded members to /onboarding */}
                  <Route element={<OnboardingGuard />}>
                    <Route element={<AppLayout />}>
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/settings" element={<SettingsPage />} />

                      {/* Explore & Listings Feed */}
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/listings/new" element={<CreateListingPage />} />
                      <Route path="/listings/:id" element={<ListingDetailPage />} />
                      <Route path="/listings/:id/request" element={<RequestExchangePage />} />
                      <Route path="/my/listings" element={<MyListingsPage />} />
                      <Route path="/exchanges" element={<ExchangesListPage />} />
                      <Route path="/exchanges/:id" element={<ExchangeDetailPage />} />
                      <Route
                        path="/profile"
                        element={
                          <div style={{ padding: '24px' }}>
                            <h2>My Profile</h2>
                          </div>
                        }
                      />
                      <Route
                        path="/profile/:userId"
                        element={
                          <div style={{ padding: '24px' }}>
                            <h2>Trust Profile</h2>
                          </div>
                        }
                      />
                      <Route
                        path="/help"
                        element={
                          <div style={{ padding: '24px' }}>
                            <h2>Help & Support</h2>
                          </div>
                        }
                      />

                      {/* Deferred preview routes per ROUTES.md */}
                      <Route
                        path="/inbox"
                        element={
                          <UnavailableState
                            featureName="Inbox & Chat"
                            reason="Real-time messaging is deferred to milestone P10."
                          />
                        }
                      />
                      <Route
                        path="/inbox/:id"
                        element={
                          <UnavailableState
                            featureName="Inbox Conversation"
                            reason="Real-time messaging is deferred to milestone P10."
                          />
                        }
                      />
                      <Route
                        path="/notifications"
                        element={
                          <UnavailableState
                            featureName="Notifications"
                            reason="Notification service is deferred to milestone P10."
                          />
                        }
                      />
                      <Route
                        path="/feedback"
                        element={
                          <UnavailableState
                            featureName="Feedback & Reviews"
                            reason="User ratings and reviews are deferred to milestone P11."
                          />
                        }
                      />
                      <Route
                        path="/exchanges/:id/handoff"
                        element={
                          <UnavailableState
                            featureName="QR Pickup & Handoff"
                            reason="In-person QR token confirmation is deferred to milestone P09."
                          />
                        }
                      />

                      {/* Operator / Moderator Queue */}
                      <Route element={<RequireModerator />}>
                        <Route path="/admin/moderation" element={<ModerationQueuePage />} />
                        <Route
                          path="/admin/members"
                          element={
                            <div style={{ padding: '24px' }}>
                              <h2>Member Verification</h2>
                            </div>
                          }
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
              </Route>

              {/* 404 catch-all */}
              <Route
                path="*"
                element={
                  <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center', padding: '24px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>404</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>Page not found</p>
                    <Navigate to="/" replace />
                  </div>
                }
              />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;