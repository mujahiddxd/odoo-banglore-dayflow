'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign in failed');
        return;
      }

      if (data.user?.firstLogin) {
        router.push('/dashboard/setup-profile');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex items-center justify-center p-4">
      {/* Decorative doodles */}
      <svg className="doodle-arrow" style={{ top: '15%', left: '8%', opacity: 0.15 }} width="80" height="80" viewBox="0 0 100 100">
        <path d="M10,50 Q50,10 90,50 Q50,90 10,50" fill="none" stroke="var(--uxsg-yellow)" strokeWidth="2" strokeDasharray="4,4" />
      </svg>
      <svg className="doodle-arrow" style={{ bottom: '20%', right: '10%', opacity: 0.15 }} width="60" height="60" viewBox="0 0 100 100">
        <path d="M20,80 L80,20 M80,20 L60,25 M80,20 L75,40" fill="none" stroke="var(--uxsg-teal)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="sketchy-card p-8 relative">
          {/* Tape corners */}
          <div className="tape-corner tape-corner-tl" />
          <div className="tape-corner tape-corner-br" />

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block sketchy-border px-6 py-2.5 bg-[var(--uxsg-paper)]">
              <span className="font-headline text-xl font-bold text-[var(--uxsg-ink)]">
                Odoo
              </span>
            </div>
            <p className="font-handwritten text-sm text-gray-500 mt-3">
              Every workday, perfectly aligned ✦
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <SketchyInput
              label="Login Id/Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <SketchyInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle
              required
            />

            {error && (
              <div className="sticky-note sticky-note-yellow p-3 text-sm animate-fade-in" style={{ transform: 'rotate(-0.5deg)' }}>
                <span className="font-handwritten">{error}</span>
              </div>
            )}

            <SketchyButton
              type="submit"
              variant="cta"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'SIGN IN'
              )}
            </SketchyButton>
          </form>

          {/* Sign up link */}
          <p className="text-center mt-6 font-body text-sm text-gray-600">
            Don&apos;t have an Account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-[var(--uxsg-ink)] wavy-underline-yellow hover:text-[var(--uxsg-teal)] transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Decorative sticky note */}
        <div className="sticky-note sticky-note-blue mt-6 max-w-xs mx-auto animate-float" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-center">
            ✏️ Enter your company email and password to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
