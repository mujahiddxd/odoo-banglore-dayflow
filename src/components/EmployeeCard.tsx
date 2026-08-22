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
      {/* Status indicator */}
      <div className="absolute top-3 right-3 z-10" title={statusLabel}>
        {status === 'present' && (
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-[1.5px] border-[var(--uxsg-ink)] shadow-[1.5px_1.5px_0px_var(--uxsg-ink)]" />
        )}
        {status === 'absent' && (
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--uxsg-yellow)] border-[1.5px] border-[var(--uxsg-ink)] shadow-[1.5px_1.5px_0px_var(--uxsg-ink)]" />
        )}
        {status === 'leave' && (
          <div style={{ filter: 'drop-shadow(1.5px 1.5px 0px var(--uxsg-ink))' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5-2.5-.5-1.5 1.5 2.5 2.5 2.5 2.5 1.5-1.5-.5-2.5 3.5-3.5 5 6l1.2-.7c.4-.2.7-.6.6-1.1z"/>
            </svg>
          </div>
        )}
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
