// src/shared/theme/ThemeProvider.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../api-client/supabase';
import { useAuth } from '../../modules/auth/useAuth';
import { ThemeContext } from './context';
import type {
  ThemeStyle,
  ThemeAppearance,
  ThemeMotion,
  ThemeDensity,
  UserPreferences,
  ThemeContextValue,
} from './types';

const defaultPreferences: UserPreferences = {
  style: 'calm',
  appearance: 'system',
  motion: 'system',
  density: 'comfortable',
  onboardingCompleted: false,
};

function resolveSystemAppearance(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyDomTokens(prefs: UserPreferences) {
  const root = document.documentElement;
  const resolvedAppearance = prefs.appearance === 'system' ? resolveSystemAppearance() : prefs.appearance;

  root.setAttribute('data-style', prefs.style);
  root.setAttribute('data-appearance', resolvedAppearance);
  root.setAttribute('data-user-appearance', prefs.appearance);
  root.setAttribute('data-motion', prefs.motion);
  root.setAttribute('data-density', prefs.density);

  // Update mirror cookie: rs_theme=style|appearance
  document.cookie = `rs_theme=${prefs.style}|${prefs.appearance}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Read from DOM data attributes set by no-flash bootstrap
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const s = root.getAttribute('data-style') as ThemeStyle;
      const a = root.getAttribute('data-user-appearance') as ThemeAppearance;
      return {
        ...defaultPreferences,
        style: s === 'pulse' || s === 'calm' ? s : 'calm',
        appearance: a === 'light' || a === 'dark' || a === 'system' ? a : 'system',
      };
    }
    return defaultPreferences;
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(!!user);

  // Fetch preferences from Supabase when user is authenticated
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadServerPreferences() {
      try {
        const { data, error } = await supabase
          .from('preferences')
          .select('style, appearance, motion, density, onboarding_completed_at')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (error) {
          console.error('Failed fetching preferences:', error);
          return;
        }

        if (data && isMounted) {
          const loaded: UserPreferences = {
            style: data.style as ThemeStyle,
            appearance: data.appearance as ThemeAppearance,
            motion: data.motion as ThemeMotion,
            density: data.density as ThemeDensity,
            onboardingCompleted: !!data.onboarding_completed_at,
          };
          setPreferences(loaded);
          applyDomTokens(loaded);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    }

    loadServerPreferences();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Listen to OS color scheme changes when appearance is 'system'
  useEffect(() => {
    if (preferences.appearance !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyDomTokens(preferences);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        const next = { ...preferences, ...updates };
        setPreferences(next);
        applyDomTokens(next);
        return { success: true };
      }

      setIsSaving(true);
      const next: UserPreferences = { ...preferences, ...updates };
      applyDomTokens(next);

      try {
        const payload: Record<string, unknown> = {
          user_id: user.id,
          style: next.style,
          appearance: next.appearance,
          motion: next.motion,
          density: next.density,
        };
        if (updates.onboardingCompleted !== undefined) {
          payload.onboarding_completed_at = updates.onboardingCompleted ? new Date().toISOString() : null;
        }

        const { error } = await supabase.from('preferences').upsert(payload, { onConflict: 'user_id' });

        if (error) {
          // Revert to confirmed value
          applyDomTokens(preferences);
          return { success: false, error: error.message };
        }

        setPreferences(next);
        return { success: true };
      } catch (err: unknown) {
        applyDomTokens(preferences);
        const msg = err instanceof Error ? err.message : 'Failed saving preferences';
        return { success: false, error: msg };
      } finally {
        setIsSaving(false);
      }
    },
    [preferences, user]
  );

  const saveOnboardingChoice = useCallback(
    async (style: ThemeStyle, appearance: ThemeAppearance): Promise<boolean> => {
      const result = await updatePreferences({
        style,
        appearance,
        onboardingCompleted: true,
      });
      return result.success;
    },
    [updatePreferences]
  );

  const value: ThemeContextValue = {
    ...preferences,
    updatePreferences,
    saveOnboardingChoice,
    isSaving,
    isLoadingPreferences,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
