import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { FitnessStoreProvider } from '@/lib/store/fitness-store';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AuthGate } from '@/components/auth/AuthGate';
import { UserScopedStoreProvider } from '@/components/auth/UserScopedStoreProvider';
import { Navigation } from '@/components/layout/Navigation';
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AuraFit',
    startupImage: '/icon-512.jpg',
  },
  icons: {
    apple: '/icon-192.jpg',
  },
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
              <PWAInstallBanner />
            </UserScopedStoreProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
