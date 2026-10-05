'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Share, Plus, Download } from 'lucide-react';

// Extend the Window type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISSED_KEY = 'aurafit_pwa_dismissed';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS standalone check
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode()) return;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      // iOS can't use beforeinstallprompt — show manual instructions
      setShowIOSInstructions(true);
      setVisible(true);
      return;
    }

    // Android / Chrome / Edge
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install AuraFit"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-emerald-950/60 ring-1 ring-white/5 animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400">
          <img
            src="/icon-192.jpg"
            alt="AuraFit"
            className="h-10 w-10 rounded-lg object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Add AuraFit to Home Screen</p>

          {showIOSInstructions ? (
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Tap{' '}
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                <Share className="h-3 w-3" />
                Share
              </span>{' '}
              then{' '}
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                <Plus className="h-3 w-3" />
                Add to Home Screen
              </span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Install for the full app experience — works offline too.
            </p>
          )}

          {!showIOSInstructions && (
            <button
              id="pwa-install-btn"
              onClick={handleInstall}
              className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Install App
            </button>
          )}
        </div>

        {/* Close */}
        <button
          id="pwa-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="shrink-0 rounded-lg p-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
