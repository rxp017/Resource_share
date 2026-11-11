import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const { useThemeMock } = vi.hoisted(() => ({ useThemeMock: vi.fn() }));
vi.mock('../src/shared/theme', () => ({
  useTheme: () => useThemeMock(),
}));

import { OnboardingGuard } from '../src/modules/preferences/OnboardingGuard';

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/explore']}>
      <Routes>
        <Route element={<OnboardingGuard />}>
          <Route path="/explore" element={<div>protected-content</div>} />
        </Route>
        <Route path="/onboarding" element={<div>onboarding-page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OnboardingGuard', () => {
  it('never redirects while preferences are still loading', () => {
    useThemeMock.mockReturnValue({ onboardingCompleted: false, isLoadingPreferences: true });
    renderGuard();
    expect(screen.queryByText('protected-content')).toBeNull();
    expect(screen.queryByText('onboarding-page')).toBeNull();
    expect(screen.getByText(/loading preferences/i)).toBeTruthy();
  });

  it('redirects incomplete onboarding once preferences are loaded', () => {
    useThemeMock.mockReturnValue({ onboardingCompleted: false, isLoadingPreferences: false });
    renderGuard();
    expect(screen.getByText('onboarding-page')).toBeTruthy();
    expect(screen.queryByText('protected-content')).toBeNull();
  });

  it('renders protected content for completed onboarding', () => {
    useThemeMock.mockReturnValue({ onboardingCompleted: true, isLoadingPreferences: false });
    renderGuard();
    expect(screen.getByText('protected-content')).toBeTruthy();
  });
});
