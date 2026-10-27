// src/modules/auth/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';

export const LoginPage: React.FC = () => {
  const { user, membership, isLoading, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const nextParam = searchParams.get('next');

  useEffect(() => {
    // If nextParam is provided and safe (starts with / and not //), save it
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      sessionStorage.setItem('rs_redirect_after_login', nextParam);
    }
  }, [nextParam]);

  useEffect(() => {
    if (!isLoading && user && membership) {
      if (!membership.eligible) {
        // Will be rendered as not eligible
        return;
      }
      if (membership.status === 'pending') {
        navigate('/verify', { replace: true });
        return;
      }
      if (membership.status === 'active') {
        const savedRedirect = sessionStorage.getItem('rs_redirect_after_login');
        if (savedRedirect && savedRedirect.startsWith('/') && !savedRedirect.startsWith('//')) {
          sessionStorage.removeItem('rs_redirect_after_login');
          navigate(savedRedirect, { replace: true });
        } else {
          navigate('/explore', { replace: true });
        }
      }
    }
  }, [user, membership, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg('');
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      setIsSigningIn(false);
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img
            src="/hitam-logo.png"
            alt="HITAM Logo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '2px solid var(--color-border)',
            }}
          />
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 28%, transparent)',
            color: 'var(--color-accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          🔒 HITAM Campus Network · Verified Student Access
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text)' }}>
          Resource Share
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Campus peer-to-peer exchange for textbooks, tools, and academic gear.
        </p>
      </header>

      <div
        className="glass-panel magic-glow"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '36px 28px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text)' }}>
          Sign in to your account
        </h2>

        {errorMsg && (
          <div
            role="alert"
            style={{
              background: 'color-mix(in srgb, #ef4444 15%, transparent)',
              color: '#b91c1c',
              border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          id="google-signin-button"
          onClick={handleGoogleLogin}
          disabled={isSigningIn || isLoading}
          className="interactive-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '48px',
            padding: '12px 20px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isSigningIn || isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            marginBottom: '24px',
          }}
        >
          <svg style={{ width: '22px', height: '22px', marginRight: '12px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {isSigningIn ? 'Connecting to College Domain...' : 'Sign in with @hitam.org'}
        </button>

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '18px',
            textAlign: 'left',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            lineHeight: '1.45',
          }}
        >
          <strong style={{ color: 'var(--color-text)' }}>Campus Domain Requirement:</strong> Access is restricted strictly to accounts ending in <code>@hitam.org</code>. External accounts are denied entry to preserve campus safety and direct peer accountability.
        </div>
      </div>
    </div>
  );
};
