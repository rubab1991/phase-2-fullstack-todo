'use client';

import { useState, useEffect, useRef } from 'react';
import { UserSession } from '@/types';
import { signIn as customSignIn, signUp as customSignUp, signOut as customSignOut, getSession } from '@/lib/auth-client';

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const isInitializedRef = useRef(false); // Track if initial session check is complete

  // Check for existing session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const currentSession = await getSession();
        if (currentSession) {
          // Safely handle session data
          const userId = currentSession.user?.id;
          const userEmail = currentSession.user?.email;

          if (userId) {
            const userSession: UserSession = {
              id: userId,
              email: userEmail || '',
              token: currentSession.token,
              isLoggedIn: true,
              isLoading: false
            };

            setSession(userSession);
            setAuthStatus('authenticated');
          } else {
            // No valid user ID found, set as logged out
            setSession(null);
            setAuthStatus('unauthenticated');
          }
        } else {
          // No session exists
          setSession(null);
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null); // Ensure we don't leave session in an inconsistent state
        setAuthStatus('unauthenticated');
      } finally {
        setLoading(false);
        isInitializedRef.current = true;
      }
    };

    fetchSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await customSignIn(email, password);  // Use the renamed import

      if (result.success && result.user) {
        const userSession: UserSession = {
          id: result.user.id,
          email: result.user.email,
          token: result.token,
          isLoggedIn: true,
          isLoading: false
        };

        setSession(userSession);
        setAuthStatus('authenticated');
        return { success: true, user: userSession };
      } else {
        return { success: false, error: result.error || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      await customSignOut();  // Use the renamed import
      setSession(null);
      setAuthStatus('unauthenticated');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await customSignUp(email, password);  // Use the renamed import

      if (result.success && result.user) {
        const userSession: UserSession = {
          id: result.user.id,
          email: result.user.email,
          token: result.token,
          isLoggedIn: true,
          isLoading: false
        };

        setSession(userSession);
        setAuthStatus('authenticated');
        return { success: true, user: userSession };
      } else {
        return { success: false, error: result.error || 'Sign up failed' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    session,
    loading,
    authStatus,
    signIn,
    signOut,
    signUp,
    isAuthenticated: authStatus === 'authenticated'
  };
}