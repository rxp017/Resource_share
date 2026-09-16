// src/shared/theme/types.ts
export type ThemeStyle = 'pulse' | 'calm';
export type ThemeAppearance = 'system' | 'light' | 'dark';
export type ThemeMotion = 'system' | 'reduced';
export type ThemeDensity = 'comfortable' | 'compact';

export interface UserPreferences {
  style: ThemeStyle;
  appearance: ThemeAppearance;
  motion: ThemeMotion;
  density: ThemeDensity;
  onboardingCompleted: boolean;
}

export interface ThemeContextValue extends UserPreferences {
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
  saveOnboardingChoice: (style: ThemeStyle, appearance: ThemeAppearance) => Promise<boolean>;
  isSaving: boolean;
  isLoadingPreferences: boolean;
}
