'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';

export default function SignUpPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogo(result);
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, name, email, phone, password, confirmPassword, logo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      router.push('/signin?registered=true');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex items-center justify-center p-4">
      {/* Decorative doodles */}
      <svg className="doodle-arrow" style={{ top: '10%', left: '5%', opacity: 0.12 }} width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--uxsg-yellow)" strokeWidth="2" strokeDasharray="6,4" />
      </svg>
      <svg className="doodle-arrow" style={{ bottom: '15%', right: '8%', opacity: 0.12 }} width="70" height="70" viewBox="0 0 100 100">
        <path d="M20,80 L80,20 M80,20 L60,25 M80,20 L75,40" fill="none" stroke="var(--uxsg-teal)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="w-full max-w-md animate-slide-up">
        <div className="sketchy-card p-8 relative">
          {/* Tape corners */}
          <div className="tape-corner tape-corner-tl" />
          <div className="tape-corner tape-corner-br" />

          {/* Logo / Header */}
          <div className="text-center mb-7">
            {/* Company logo preview */}
            {logoPreview ? (
              <div className="inline-block mb-3">
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain rounded-xl sketchy-border mx-auto"
                />
              </div>
            ) : (
              <div className="inline-block sketchy-border px-6 py-2.5 bg-[var(--uxsg-paper)] mb-3">
                <span className="font-headline text-xl font-bold text-[var(--uxsg-ink)]">Dayflow</span>
              </div>
            )}
            <p className="font-handwritten text-sm text-gray-500">Create your company workspace ✦</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name + Logo upload */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SketchyInput
                  label="Company Name"
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              {/* Upload Logo Button */}
              <div className="pb-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Company Logo"
                  className="flex items-center justify-center w-11 h-11 rounded-xl sketchy-border bg-[var(--uxsg-yellow)] hover:bg-[var(--uxsg-paper)] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-1 font-handwritten">Logo</p>
              </div>
            </div>

            <SketchyInput
              label="Your Name"
              type="text"
              placeholder="Admin full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <SketchyInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <SketchyInput
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

            <SketchyInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPasswordToggle
              required
            />

            {error && (
              <div
                className="sticky-note sticky-note-yellow p-3 text-sm animate-fade-in"
                style={{ transform: 'rotate(-0.5deg)' }}
              >
                <span className="font-handwritten">⚠️ {error}</span>
              </div>
            )}

            <SketchyButton type="submit" variant="cta" fullWidth disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  Registering...
                </span>
              ) : (
                'SIGN UP'
              )}
            </SketchyButton>
          </form>

          {/* Sign in link */}
          <p className="text-center mt-5 font-body text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-semibold text-[var(--uxsg-ink)] wavy-underline-yellow hover:text-[var(--uxsg-teal)] transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Info sticky note */}
        <div
          className="sticky-note sticky-note-teal mt-5 max-w-xs mx-auto animate-float"
          style={{ animationDelay: '0.4s' }}
        >
          <p className="text-sm text-center">
            📧 A welcome email with your login link will be sent after sign up!
          </p>
        </div>
      </div>
    </div>
  );
}
