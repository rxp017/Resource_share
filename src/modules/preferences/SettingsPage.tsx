// src/modules/preferences/SettingsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../../shared/theme';
import type {
  ThemeStyle,
  ThemeAppearance,
  ThemeMotion,
  ThemeDensity,
} from '../../shared/theme';

export const SettingsPage: React.FC = () => {
  const { user, membership, signOut } = useAuth();
  const {
    style,
    appearance,
    motion,
    density,
    updatePreferences,
    isSaving,
  } = useTheme();

  const [formStyle, setFormStyle] = useState<ThemeStyle>(style);
  const [formAppearance, setFormAppearance] = useState<ThemeAppearance>(appearance);
  const [formMotion, setFormMotion] = useState<ThemeMotion>(motion);
  const [formDensity, setFormDensity] = useState<ThemeDensity>(density);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = await updatePreferences({
      style: formStyle,
      appearance: formAppearance,
      motion: formMotion,
      density: formDensity,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Preferences saved and synced to your account.' });
    } else {
      // Revert local form to confirmed context values
      setFormStyle(style);
      setFormAppearance(appearance);
      setFormMotion(motion);
      setFormDensity(density);
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to save preferences. Reverted to previous settings.',
      });
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Preferences & Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage your visual display, accessibility preferences, and campus session.
        </p>
      </header>

      {/* Account Info Card */}
      <section
        aria-labelledby="account-heading"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 8px)',
          padding: '20px',
          marginBottom: '28px',
        }}
      >
        <h2 id="account-heading" style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
          Campus Identity
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Verified Email</span>
            <strong>{user?.email || 'Unknown'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Institution</span>
            <strong>HITAM (Hyderabad)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Membership Status</span>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: membership?.status === 'active' ? '#DCFCE7' : '#FEF3C7',
                color: membership?.status === 'active' ? '#166534' : '#92400E',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'capitalize',
              }}
            >
              {membership?.status || 'Unknown'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Role</span>
            <span style={{ textTransform: 'capitalize' }}>{membership?.role || 'Member'}</span>
          </div>
        </div>
      </section>

      {/* Preferences Form */}
      <form onSubmit={handleSave}>
        {feedback && (
          <div
            role="status"
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-btn, 6px)',
              marginBottom: '20px',
              fontSize: '0.95rem',
              backgroundColor: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: feedback.type === 'success' ? '#166534' : '#B91C1C',
              border: `1px solid ${feedback.type === 'success' ? '#BBF7D0' : '#FCA5A5'}`,
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* 1. Visual Style */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '16px 20px',
            marginBottom: '20px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>Visual Style</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="style"
                value="pulse"
                checked={formStyle === 'pulse'}
                onChange={() => setFormStyle('pulse')}
                style={{ marginTop: '3px', width: '18px', height: '18px' }}
              />
              <div>
                <strong>Pulse Style</strong>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Expressive campus editorial design with bold display typography and vibrant accents.
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="style"
                value="calm"
                checked={formStyle === 'calm'}
                onChange={() => setFormStyle('calm')}
                style={{ marginTop: '3px', width: '18px', height: '18px' }}
              />
              <div>
                <strong>Calm Style</strong>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Restrained, serene surfaces with consistent readable typography and minimal decoration.
                </p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* 2. Color Appearance */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '16px 20px',
            marginBottom: '20px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>Appearance</legend>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {(['system', 'light', 'dark'] as ThemeAppearance[]).map((mode) => (
              <label
                key={mode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: '44px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-btn, 6px)',
                  backgroundColor: formAppearance === mode ? 'var(--color-bg)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="appearance"
                  value={mode}
                  checked={formAppearance === mode}
                  onChange={() => setFormAppearance(mode)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ textTransform: 'capitalize', fontWeight: formAppearance === mode ? 700 : 500 }}>
                  {mode === 'system' ? 'System (Automatic)' : mode}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 3. Motion Preferences */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '16px 20px',
            marginBottom: '20px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>Motion</legend>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="motion"
                value="system"
                checked={formMotion === 'system'}
                onChange={() => setFormMotion('system')}
                style={{ width: '18px', height: '18px' }}
              />
              <span>System (Default)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="motion"
                value="reduced"
                checked={formMotion === 'reduced'}
                onChange={() => setFormMotion('reduced')}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Reduced Motion (Disables animations)</span>
            </label>
          </div>
        </fieldset>

        {/* 4. Display Density */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '16px 20px',
            marginBottom: '28px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>Display Density</legend>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="density"
                value="comfortable"
                checked={formDensity === 'comfortable'}
                onChange={() => setFormDensity('comfortable')}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Comfortable (Default)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="radio"
                name="density"
                value="compact"
                checked={formDensity === 'compact'}
                onChange={() => setFormDensity('compact')}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Compact</span>
            </label>
          </div>
        </fieldset>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--radius-btn, 6px)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isSaving ? 'wait' : 'pointer',
              minHeight: '44px',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>

          <button
            type="button"
            onClick={signOut}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'var(--color-danger, #B91C1C)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn, 6px)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              minHeight: '44px',
              marginLeft: 'auto',
            }}
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
};
