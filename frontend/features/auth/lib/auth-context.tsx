import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';
import { signIn, signUp, signOut as signOutApi, getSession, refreshSession } from '../api/auth-api';
import { AuthContextValue, AuthState, SignInCredentials, SignUpCredentials } from '../model/types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const session = await getSession();
        if (mounted) {
          setState({
            user: session?.user ?? null,
            session,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback(async (credentials: SignInCredentials) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const session = await signIn(credentials);
      setState({
        user: session.user,
        session,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const handleSignUp = useCallback(async (credentials: SignUpCredentials) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await signUp(credentials);
      setState({
        user: result.user,
        session: result.session,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await signOutApi();
      setState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const handleRefreshSession = useCallback(async () => {
    try {
      const session = await refreshSession();
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

