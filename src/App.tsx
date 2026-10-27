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
  EditListingPage,
  MyListingsPage,
  ModerationQueuePage,
} from './modules/listings';
import {
  RequestExchangePage,
  ExchangesListPage,
  ExchangeDetailPage,
} from './modules/exchanges';
import { HandoffPage } from './modules/handoff';
import { InboxPage } from './modules/chat';
import { NotificationsPage } from './modules/notifications';
import { FeedbackPage, TrustProfilePage } from './modules/reviews';
import { MembersManagementPage } from './modules/admin/MembersManagementPage';
import { PublicLandingPage } from './modules/landing/PublicLandingPage';

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
                      <Route path="/listings/:id/edit" element={<EditListingPage />} />
                      <Route path="/listings/:id/request" element={<RequestExchangePage />} />
                      <Route path="/my/listings" element={<MyListingsPage />} />
                      <Route path="/exchanges" element={<ExchangesListPage />} />
                      <Route path="/exchanges/:id" element={<ExchangeDetailPage />} />
                      <Route path="/exchanges/:id/handoff" element={<HandoffPage />} />

                      {/* Messaging, Notifications & Reviews */}
                      <Route path="/inbox" element={<InboxPage />} />
                      <Route path="/inbox/:id" element={<InboxPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/profile" element={<TrustProfilePage />} />
                      <Route path="/profile/:userId" element={<TrustProfilePage />} />

                      <Route
                        path="/help"
                        element={
                          <div style={{ padding: '32px 16px', maxWidth: '680px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>HITAM Campus Help & Guidelines</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                              HITAM Resource Share operates strictly peer-to-peer for verified @hitam.org students.
                              Always meet at designated campus pickup zones (Library Entrance, Canteen Plaza, Main Gate).
                              Never exchange prohibited items or transfer off-campus funds without verifying receipt in your own UPI app.
                            </p>
                          </div>
                        }
                      />

                      {/* Operator / Moderator Queue */}
                      <Route element={<RequireModerator />}>
                        <Route path="/admin/moderation" element={<ModerationQueuePage />} />
                        <Route path="/admin/members" element={<MembersManagementPage />} />
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