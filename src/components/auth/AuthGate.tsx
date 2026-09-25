'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Dumbbell } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

/** Routes that are accessible without being signed in. */
const PUBLIC_ROUTES = ['/auth'];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady, isSupabaseConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // Only enforce auth when Supabase is configured and the check is done
    if (!isAuthReady || !isSupabaseConfigured) return;

    if (!user && !isPublicRoute) {
      router.replace('/auth');
    }

    if (user && isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthReady, isSupabaseConfigured, user, isPublicRoute, router]);

  // While checking auth, show a full-screen loader
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/30">
          <Dumbbell className="h-7 w-7" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <p className="text-slate-400 text-sm font-medium">Loading your profile…</p>
      </div>
    );
  }

  // If Supabase isn't set up, run in demo mode (allow everything)
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Redirect guard: show nothing while router.replace is in flight
  if (!user && !isPublicRoute) return null;
  if (user && isPublicRoute) return null;

  return <>{children}</>;
}
