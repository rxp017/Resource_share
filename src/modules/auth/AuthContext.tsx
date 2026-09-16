// src/modules/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../shared/api-client/supabase';
import type { AuthContextValue, MembershipInfo } from './types';

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  onSignOutCleanup?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onSignOutCleanup }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMembership = useCallback(async (): Promise<MembershipInfo | null> => {
    try {
      const { data, error } = await supabase.rpc('ensure_membership');
      if (error) {
        console.error('Error in ensure_membership RPC:', error);
        return null;
      }
      const info = data as MembershipInfo;
      setMembership(info);
      return info;
    } catch (err) {
      console.error('Failed calling ensure_membership:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
        }
        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchMembership();
        } else {
          setMembership(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchMembership();
      } else {
        setMembership(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchMembership]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setMembership(null);
      // Clear cookie mirror
      document.cookie = 'rs_theme=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      if (onSignOutCleanup) {
        onSignOutCleanup();
      }
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onSignOutCleanup]);

  const refreshMembership = useCallback(async () => {
    return await fetchMembership();
  }, [fetchMembership]);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    membership,
    signInWithGoogle,
    signOut,
    refreshMembership,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
