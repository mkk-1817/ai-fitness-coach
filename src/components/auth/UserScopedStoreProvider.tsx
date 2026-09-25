'use client';

import React from 'react';
import { FitnessStoreProvider } from '@/lib/store/fitness-store';
import { useAuth } from '@/lib/auth/AuthContext';

/**
 * Thin client wrapper that reads the current auth user and passes
 * their ID to the FitnessStoreProvider for user-scoped data isolation.
 */
export function UserScopedStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // user?.id is undefined in demo mode → store falls back to 'demo' namespace
  return (
    <FitnessStoreProvider userId={user?.id}>
      {children}
    </FitnessStoreProvider>
  );
}
