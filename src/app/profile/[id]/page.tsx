'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SketchyButton from '@/components/SketchyButton';

interface EmployeeData {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  created_at: string;
  companyName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/signin');
          return;
        }
        setError('Employee not found');
        return;
      }
      const data = await res.json();
      setEmployee(data.employee);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="font-headline text-2xl font-bold animate-wobble">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <div className="sketchy-card p-8 text-center max-w-md animate-fade-in">
          <p className="font-headline text-xl font-bold mb-3">😕 {error || 'Not Found'}</p>
          <SketchyButton variant="secondary" onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </SketchyButton>
        </div>
      </div>
    );
  }

  const joinDate = new Date(employee.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadge = {
    admin: { bg: 'bg-[var(--uxsg-cta-pink)]', text: 'text-white', label: 'Admin' },
    hr: { bg: 'bg-[var(--uxsg-teal)]', text: 'text-[var(--uxsg-ink)]', label: 'HR Officer' },
    employee: { bg: 'bg-[var(--uxsg-yellow)]', text: 'text-[var(--uxsg-ink)]', label: 'Employee' },
  }[employee.role] || { bg: 'bg-gray-200', text: 'text-gray-700', label: employee.role };

  return (
    <div className="min-h-screen paper-bg p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="font-body text-sm text-gray-500 hover:text-[var(--uxsg-ink)] transition-colors flex items-center gap-1.5 mb-6 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="group-hover:-translate-x-1 transition-transform">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="sketchy-card p-8 relative animate-slide-up">
          <div className="tape-corner tape-corner-tl" />
          <div className="tape-corner tape-corner-br" />

          {/* View only badge */}
          <div className="absolute top-4 right-4">
            <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
              View Only
            </span>
          </div>

          {/* Avatar + Name Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-[var(--uxsg-border-light)]">
            <div className="w-24 h-24 rounded-full bg-[var(--uxsg-paper)] sketchy-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-headline text-3xl font-bold text-[var(--uxsg-ink)] opacity-40">
                  {initials}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)]">
                {employee.name}
              </h1>
              <p className="font-body text-sm text-gray-500 mt-1">{employee.email}</p>
              <div className="mt-3 inline-flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full sketchy-border-sm ${roleBadge.bg} ${roleBadge.text}`}>
                  {roleBadge.label}
                </span>
                <span className="font-body text-xs text-gray-400 sketchy-border-sm px-2 py-0.5 bg-[var(--uxsg-paper)]">
                  {employee.employee_id}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-5">
            <ProfileField label="Full Name" value={employee.name} />
            <ProfileField label="Employee ID" value={employee.employee_id} />
            <ProfileField label="Email" value={employee.email} />
            <ProfileField label="Phone" value={employee.phone || 'Not provided'} />
            <ProfileField label="Company" value={employee.companyName || '—'} />
            <ProfileField label="Role" value={roleBadge.label} />
            <ProfileField label="Joined" value={joinDate} />
          </div>
        </div>

        {/* Decorative element */}
        <div className="sticky-note sticky-note-blue mt-6 max-w-xs mx-auto animate-float" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-center">
            📋 This profile is in view-only mode. Contact HR to update your details.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
      <span className="font-body text-sm font-medium text-gray-500 sm:w-40 flex-shrink-0">
        {label} :-
      </span>
      <div className="flex-1 bg-[var(--uxsg-paper)] sketchy-border-sm px-3 py-2">
        <span className="font-body text-sm text-[var(--uxsg-ink)]">{value}</span>
      </div>
    </div>
  );
}
