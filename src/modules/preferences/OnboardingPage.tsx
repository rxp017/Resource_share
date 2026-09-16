// src/modules/preferences/OnboardingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../shared/theme';
import type { ThemeStyle, ThemeAppearance } from '../../shared/theme';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { style, appearance, saveOnboardingChoice, isSaving } = useTheme();

  const [selectedStyle, setSelectedStyle] = useState<ThemeStyle>(style || 'calm');
  const [selectedAppearance, setSelectedAppearance] = useState<ThemeAppearance>(appearance || 'system');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContinue = async () => {
    setErrorMessage(null);
    const success = await saveOnboardingChoice(selectedStyle, selectedAppearance);
    if (success) {
      navigate('/explore', { replace: true });
    } else {
      setErrorMessage('Could not save your style preference. Please try again.');
    }
  };

  const handleSkip = async () => {
    setErrorMessage(null);
    // Default if skipped: Calm with System appearance per planning contract
    const success = await saveOnboardingChoice('calm', 'system');
    if (success) {
      navigate('/explore', { replace: true });
    } else {
      navigate('/explore', { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Make it feel like you</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto' }}>
          Choose your visual experience for HITAM Resource Share. You can change this anytime in Settings.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-btn, 6px)',
            color: '#B91C1C',
            marginBottom: '24px',
            fontSize: '0.95rem',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Appearance Selector */}
      <fieldset
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 8px)',
          padding: '16px 20px',
          marginBottom: '28px',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>
          Color Appearance
        </legend>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
          {(['system', 'light', 'dark'] as ThemeAppearance[]).map((appMode) => (
            <label
              key={appMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                minHeight: '44px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-btn, 6px)',
                backgroundColor: selectedAppearance === appMode ? 'var(--color-bg)' : 'transparent',
                fontWeight: selectedAppearance === appMode ? 700 : 500,
              }}
            >
              <input
                type="radio"
                name="appearance"
                value={appMode}
                checked={selectedAppearance === appMode}
                onChange={() => setSelectedAppearance(appMode)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ textTransform: 'capitalize' }}>
                {appMode === 'system' ? 'System (Automatic)' : appMode}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Style Comparison (Equal content previews) */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', textAlign: 'center' }}>
          Choose your visual style
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Option A: Pulse */}
          <div
            onClick={() => setSelectedStyle('pulse')}
            style={{
              border: selectedStyle === 'pulse' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              backgroundColor: 'var(--color-surface)',
              boxShadow: selectedStyle === 'pulse' ? '0 0 0 3px rgba(15, 118, 110, 0.15)' : 'none',
              transition: 'border-color 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>
                <input
                  type="radio"
                  name="themeStyle"
                  value="pulse"
                  checked={selectedStyle === 'pulse'}
                  onChange={() => setSelectedStyle('pulse')}
                  style={{ width: '20px', height: '20px' }}
                />
                Pulse Style
              </label>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Expressive
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Editorial noticeboard aesthetic with bold typography, expressive headings, and energetic accents.
            </p>

            {/* Preview Card (Pulse) */}
            <div
              style={{
                border: '1px solid #E7DFD3',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#FAF6EF',
                color: '#201A17',
                marginTop: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0F766E',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Calculators &bull; Academic
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>
                  Available Now
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: '#201A17',
                }}
              >
                TI-84 Plus CE Graphing Calculator
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B6259', marginBottom: '12px' }}>
                Mechanical Block &bull; Verified Student Owner
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid #E7DFD3',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F766E' }}>₹1,200</span>
                  <span style={{ fontSize: '0.75rem', color: '#6B6259' }}>or ₹50/day</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#201A17' }}>Sale &bull; Rent</span>
              </div>
            </div>
          </div>

          {/* Option B: Calm */}
          <div
            onClick={() => setSelectedStyle('calm')}
            style={{
              border: selectedStyle === 'calm' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              backgroundColor: 'var(--color-surface)',
              boxShadow: selectedStyle === 'calm' ? '0 0 0 3px rgba(15, 118, 110, 0.15)' : 'none',
              transition: 'border-color 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>
                <input
                  type="radio"
                  name="themeStyle"
                  value="calm"
                  checked={selectedStyle === 'calm'}
                  onChange={() => setSelectedStyle('calm')}
                  style={{ width: '20px', height: '20px' }}
                />
                Calm Style
              </label>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#DFE3E8',
                  color: '#2F3A45',
                }}
              >
                Serene
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Clean, quiet surfaces with consistent readable typography and minimal decorative noise.
            </p>

            {/* Preview Card (Calm) */}
            <div
              style={{
                border: '1px solid #DFE3E8',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#F5F6F7',
                color: '#2F3A45',
                marginTop: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5D6B7A' }}>
                  Calculators &bull; Academic
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803D' }}>
                  Available Now
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: '#2F3A45',
                }}
              >
                TI-84 Plus CE Graphing Calculator
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5D6B7A', marginBottom: '12px' }}>
                Mechanical Block &bull; Verified Student Owner
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid #DFE3E8',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F766E' }}>₹1,200</span>
                  <span style={{ fontSize: '0.75rem', color: '#5D6B7A' }}>or ₹50/day</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5D6B7A' }}>Sale &bull; Rent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '40px',
        }}
      >
        <button
          type="button"
          onClick={handleContinue}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: 'var(--radius-btn, 8px)',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: isSaving ? 'wait' : 'pointer',
            minHeight: '48px',
            minWidth: '220px',
            transition: 'opacity 0.15s ease',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Saving preference...' : `Continue with ${selectedStyle === 'pulse' ? 'Pulse' : 'Calm'}`}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isSaving}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '0.95rem',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '8px 16px',
            minHeight: '44px',
          }}
        >
          Skip for now (use Calm default)
        </button>
      </div>
    </div>
  );
};
