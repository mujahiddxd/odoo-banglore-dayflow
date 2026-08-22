'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';
import StickyNote from '@/components/StickyNote';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      setGeneratedId(data.generatedId);

      // Small delay to show the generated ID before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex items-center justify-center p-4 py-8">
      {/* Decorative doodles */}
      <svg className="doodle-arrow" style={{ top: '10%', right: '5%', opacity: 0.12 }} width="100" height="100" viewBox="0 0 100 100">
        <path d="M10,90 C30,10 70,10 90,90" fill="none" stroke="var(--uxsg-teal)" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
      <svg className="doodle-arrow" style={{ bottom: '10%', left: '5%', opacity: 0.12 }} width="80" height="80" viewBox="0 0 100 100">
        <path d="M50,10 L50,90 M50,90 L35,75 M50,90 L65,75" fill="none" stroke="var(--uxsg-yellow)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start animate-slide-up">
        {/* Sign Up Card */}
        <div className="flex-1 w-full">
          <div className="sketchy-card p-8 relative">
            <div className="tape-corner tape-corner-tl" />
            <div className="tape-corner tape-corner-br" />

            {/* Logo */}
            <div className="text-center mb-7">
              <div className="inline-block sketchy-border px-6 py-2.5 bg-[var(--uxsg-paper)]">
                <span className="font-headline text-xl font-bold text-[var(--uxsg-ink)]">
                  Odoo
                </span>
              </div>
            </div>

            {/* Success message */}
            {generatedId && (
              <div className="sticky-note sticky-note-yellow p-4 mb-5 animate-fade-in">
                <p className="text-sm font-bold mb-1">🎉 Account Created!</p>
                <p className="text-sm">Your Employee ID: <strong>{generatedId}</strong></p>
                <p className="text-xs mt-1 opacity-70">Redirecting to dashboard...</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">


              <SketchyInput
                label="Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />

              <SketchyInput
                label="Email"
                type="email"
                placeholder="john@odoo.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />

              <SketchyInput
                label="Phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange('phone')}
              />

              <SketchyInput
                label="Password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange('password')}
                showPasswordToggle
                required
              />

              <SketchyInput
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
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
                disabled={loading || !!generatedId}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
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
        </div>

        {/* Info Section */}
        <div className="lg:w-80 w-full space-y-5">
          {/* ID Format explanation */}
          <div className="sketchy-card p-5 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <h3 className="font-headline text-base font-bold mb-3 wavy-underline pb-1">
              Employee ID Format
            </h3>
            <p className="font-body text-xs text-gray-700 leading-relaxed mb-2">
              The Login ID is automatically generated in the following format:
            </p>
            <div className="bg-[var(--uxsg-paper)] sketchy-border-sm p-2 text-center mb-2">
              <code className="font-headline text-sm font-bold">OIJODO20220001</code>
            </div>
            <ul className="font-body text-xs text-gray-600 space-y-0.5">
              <li>• <strong>OI</strong> → Odoo India (Company)</li>
              <li>• <strong>JO</strong> → First name initials</li>
              <li>• <strong>DO</strong> → Last name initials</li>
              <li>• <strong>2022</strong> → Year of Joining</li>
              <li>• <strong>0001</strong> → Serial Number</li>
            </ul>
          </div>

          {/* Note sticky */}
          <StickyNote title="Note" color="blue" className="animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
            <ul className="space-y-2 text-sm">
              <li>- Normal user cannot register, so when the HR officer or Admin creates a new user/employee, their ID should also be created with this method.</li>
              <li>- Their password should be auto generated for the first time by the system.</li>
              <li>- They can login and change the system generated password.</li>
            </ul>
          </StickyNote>
        </div>
      </div>
    </div>
  );
}
