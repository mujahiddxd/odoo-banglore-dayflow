'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface EmployeeCardProps {
  id: string;
  name: string;
  avatar?: string;
  status: 'present' | 'leave' | 'absent';
  index?: number;
}

export default function EmployeeCard({ id, name, avatar, status, index = 0 }: EmployeeCardProps) {
  const router = useRouter();

  const statusClass = {
    present: 'status-dot-present',
    leave: 'status-dot-leave',
    absent: 'status-dot-absent',
  }[status];

  const statusLabel = {
    present: 'Present',
    leave: 'On Leave',
    absent: 'Absent',
  }[status];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={() => router.push(`/dashboard/employees/${id}`)}
      className={`sketchy-card p-4 cursor-pointer group animate-fade-in stagger-${index + 1}`}
      style={{ opacity: 0 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/employees/${id}`); }}
    >
      {/* Status dot */}
      <div className="absolute top-3 right-3">
        <div className={`status-dot ${statusClass}`} title={statusLabel} />
      </div>

      {/* Avatar */}
      <div className="w-full aspect-square bg-[var(--uxsg-paper)] sketchy-border mb-3 flex items-center justify-center overflow-hidden relative">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-ink)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[var(--uxsg-ink)]/0 group-hover:bg-[var(--uxsg-ink)]/5 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-body font-semibold text-[var(--uxsg-ink)] bg-white/90 px-2 py-1 sketchy-border-sm">
            View Profile →
          </span>
        </div>
      </div>

      {/* Name */}
      <p className="font-headline text-sm font-bold text-center truncate text-[var(--uxsg-ink)]">
        [{name}]
      </p>
    </div>
  );
}
