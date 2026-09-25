'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Sparkles, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { user, isAuthReady, signIn, signUp, isSupabaseConfigured } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already signed in
  useEffect(() => {
    if (isAuthReady && user) {
      router.replace('/');
    }
  }, [isAuthReady, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        const { error: err, needsEmailConfirm } = await signUp(email, password, fullName.trim());
        if (err) {
          setError(err.message);
        } else if (needsEmailConfirm) {
          // Email confirmation required — tell user clearly
          setSuccess(
            `✉️ Confirmation email sent to ${email}. Open it and click the link, then come back to sign in.\n\nIf you don't see it, check your spam folder.`
          );
          setMode('signin');
        } else {
          // Auto-confirmed — go straight to onboarding
          router.replace('/onboarding');
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message);
        } else {
          router.replace('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/30 mb-4">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            AuraFit <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Intelligent Personal Fitness Coach
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-slate-950/70 p-1 mb-6 border border-white/5">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                  mode === m
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 mb-5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Supabase not configured warning */}
          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-5 text-xs text-amber-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Supabase is not configured. Add your credentials to <code className="font-mono">.env.local</code> to enable authentication.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name (sign up only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'signup' ? 'Creating Account…' : 'Signing In…'}</>
              ) : (
                mode === 'signup' ? 'Create My Account' : 'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null); }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Your data is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
