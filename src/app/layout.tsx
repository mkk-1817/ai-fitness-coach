import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { FitnessStoreProvider } from '@/lib/store/fitness-store';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AuthGate } from '@/components/auth/AuthGate';
import { UserScopedStoreProvider } from '@/components/auth/UserScopedStoreProvider';
import { Navigation } from '@/components/layout/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AuraFit AI Coach | Personalized Workout & Nutrition System',
  description:
    'Production-ready AI-powered fitness coach that dynamically generates and continuously adapts personalized workout and diet plans based on your profile, equipment, and progress.',
  keywords: [
    'AI Fitness Coach',
    'Personalized Workout Plan',
    'Diet Plan',
    'Exercise Demonstrations',
    'Progressive Overload',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
        <AuthProvider>
          <AuthGate>
            <UserScopedStoreProvider>
              <Navigation />
              <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
                {children}
              </main>
            </UserScopedStoreProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
