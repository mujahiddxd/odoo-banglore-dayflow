'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AvatarDropdownProps {
  userName: string;
  userAvatar?: string;
}

export default function AvatarDropdown({ userName, userAvatar }: AvatarDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/signin');
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-[var(--uxsg-cta-pink)] flex items-center justify-center text-white font-bold text-sm border-2 border-white/30 hover:border-[var(--uxsg-teal)] transition-colors cursor-pointer overflow-hidden"
      >
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span className="font-headline">{initials}</span>
        )}
        {/* Status dot */}
        <div className="absolute -bottom-0.5 -right-0.5 status-dot status-dot-absent" style={{ width: '10px', height: '10px' }} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 sketchy-card p-1 animate-fade-in z-50" style={{ borderRadius: '12px' }}>
          <div className="px-4 py-3 border-b border-[var(--uxsg-border-light)]">
            <p className="font-headline text-sm font-bold truncate">{userName}</p>
          </div>
          <button
            onClick={() => { setOpen(false); router.push('/profile/me'); }}
            className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-[var(--uxsg-paper)] transition-colors flex items-center gap-2 rounded-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-red-50 text-[var(--status-absent)] transition-colors flex items-center gap-2 rounded-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
