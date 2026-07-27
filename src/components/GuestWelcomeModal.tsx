'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

const STORAGE_KEY = 'showGuestWelcome';
const EVENT_NAME = 'guest-welcome';
const AUTO_DISMISS_MS = 5500;

export function markGuestWelcomePending() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

export function GuestWelcomeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setLeaving(true);
    window.setTimeout(() => {
      setOpen(false);
      setLeaving(false);
    }, 350);
  };

  useEffect(() => {
    const check = () => {
      try {
        if (sessionStorage.getItem(STORAGE_KEY) === '1') {
          setOpen(true);
          setLeaving(false);
        }
      } catch {
        // ignore
      }
    };

    check();
    window.addEventListener(EVENT_NAME, check);
    return () => window.removeEventListener(EVENT_NAME, check);
  }, [pathname]);

  useEffect(() => {
    if (!open || pathname === '/login' || leaving) return;

    const timer = window.setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [open, pathname, leaving]);

  if (!open || pathname === '/login') return null;

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-5 sm:p-8 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-welcome-title"
    >
      <div
        className={`w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          leaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="px-8 sm:px-12 pt-12 pb-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[#1E2024]" strokeWidth={1.75} />
          </div>
          <h2
            id="guest-welcome-title"
            className="text-3xl sm:text-4xl font-light tracking-wide text-[#1E2024]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            You&apos;re in Guest Mode
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-md">
            You&apos;re viewing{' '}
            <span className="font-semibold text-slate-800">mock demo data</span> so real client
            information stays private and secure.
          </p>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-md">
            Nothing you change here will be saved.
          </p>
        </div>
      </div>
    </div>
  );
}
