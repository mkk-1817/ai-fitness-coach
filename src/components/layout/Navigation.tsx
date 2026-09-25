'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  MessageSquare, 
  Library, 
  History, 
  Home, 
  Flame, 
  Bell, 
  ShieldCheck, 
  Menu, 
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { useAuth } from '@/lib/auth/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Navigation() {
  const pathname = usePathname();
  const { profile, activeSession, notifications, resetToDemo } = useFitnessStore();
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Display name: prefer stored profile name, fall back to auth user metadata or email
  const displayName =
    profile.name ||
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split('@')[0] ||
    'Me';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Workouts', href: '/workout', icon: Dumbbell },
    { label: 'Nutrition', href: '/nutrition', icon: Utensils },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'AI Coach', href: '/coach', icon: MessageSquare },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <>
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AuraFit <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AI</span>
                </span>
                <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent Personal Fitness Coach</p>
              </div>
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {/* STREAK PILL */}
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>4 Day Streak</span>
            </div>

            {/* ACTIVE WORKOUT QUICK RESUME BANNER */}
            {activeSession && pathname !== '/workout/player' && (
              <Link 
                href="/workout/player"
                className="flex items-center gap-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold px-3 py-1 text-xs shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition animate-pulse"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Resume Workout</span>
              </Link>
            )}

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}
            </div>

            {/* ONBOARDING LINK & DEMO RESET */}
            <Link
              href="/onboarding"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition"
              title="Re-run Assessment"
            >
              Assessment
            </Link>

            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition"
              title="Admin & Seed DB"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>

            {/* SIGN OUT / DEMO RESET */}
            {isSupabaseConfigured && user ? (
              <button
                onClick={async () => {
                  if (confirm('Sign out of AuraFit?')) {
                    await signOut();
                  }
                }}
                title="Sign Out"
                className="hidden sm:flex items-center text-xs text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-800/50 transition gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm('Reset store to default demo state?')) {
                    resetToDemo();
                  }
                }}
                title="Reset Demo Data"
                className="hidden sm:flex items-center text-xs text-slate-500 hover:text-slate-300 p-1.5 rounded-md hover:bg-slate-800/50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            {/* USER AVATAR */}
            <Link href="/onboarding" className="flex items-center gap-2 pl-2 border-l border-white/10" title={`Profile: ${displayName}`}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {displayInitial}
              </div>
              <span className="hidden xl:block text-xs text-slate-300 font-medium max-w-[100px] truncate">{displayName}</span>
            </Link>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-3">
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>Fitness Profile</Link>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
            </div>
          </div>
        )}
      </header>

      {/* DESKTOP SUB-NAVBAR */}
      <nav className="hidden md:block border-b border-white/5 bg-slate-950/60 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl px-2 py-2">
        <div className="flex items-center justify-around">
          {[
            { label: 'Home', href: '/', icon: Home },
            { label: 'Workouts', href: '/workout', icon: Dumbbell },
            { label: 'Coach', href: '/coach', icon: MessageSquare },
            { label: 'Meals', href: '/nutrition', icon: Utensils },
            { label: 'Progress', href: '/progress', icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
