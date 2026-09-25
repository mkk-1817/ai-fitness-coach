'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// ==============================================================================
// TYPES
// ==============================================================================
interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** true while the initial auth check is running */
  isAuthLoading: boolean;
  /** true once the first session check has completed */
  isAuthReady: boolean;
  isSupabaseConfigured: boolean;

  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsEmailConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ==============================================================================
// PROVIDER
// ==============================================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ─── Bootstrap: check existing session ────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode — treat as "logged-in" local demo user
      setUser(null);
      setSession(null);
      setIsAuthLoading(false);
      setIsAuthReady(true);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch {
        // swallow — user just won't be logged in
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
          setIsAuthReady(true);
        }
      }
    };

    bootstrap();

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return {
          error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError,
          needsEmailConfirm: false,
        };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      // If session is null after sign-up, Supabase requires email confirmation
      const needsEmailConfirm = !error && !data.session;
      return { error, needsEmailConfirm };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthLoading,
        isAuthReady,
        isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==============================================================================
// HOOK
// ==============================================================================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
