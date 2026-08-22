'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarDropdown from './AvatarDropdown';

interface NavbarProps {
  userName: string;
  userAvatar?: string;
  companyName?: string;
}

const TABS = [
  { label: 'Employees', href: '/dashboard' },
  { label: 'Attendance', href: '/dashboard/attendance' },
  { label: 'Time Off', href: '/dashboard/timeoff' },
];

export default function Navbar({ userName, userAvatar, companyName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  return (
    <nav className="w-full bg-[var(--uxsg-ink)] px-4 py-3 flex items-center gap-4 sticky top-0 z-50"
      style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
    >
      {/* Company Logo / Name */}
      <div className="flex items-center gap-3 mr-2">
        <div className="w-9 h-9 rounded-full bg-[var(--uxsg-teal)] flex items-center justify-center sketchy-border-white overflow-hidden">
          <span className="font-headline text-sm font-bold text-[var(--uxsg-ink)]">
            {companyName ? companyName.charAt(0).toUpperCase() : 'D'}
          </span>
        </div>
        <span className="font-headline text-white text-lg hidden sm:block">
          {companyName || 'DayFlow'}
        </span>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || 
            (tab.href !== '/dashboard' && pathname?.startsWith(tab.href));
          // Special case: "Employees" is active when on /dashboard exactly
          const isEmployeesActive = tab.href === '/dashboard' && 
            (pathname === '/dashboard' || pathname?.startsWith('/dashboard/employees') || pathname?.startsWith('/profile'));

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`nav-tab ${(isActive || isEmployeesActive) ? 'nav-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto mr-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[var(--uxsg-teal)] focus:bg-white/15 transition-colors"
          />
        </div>
      </div>

      {/* Profile Avatar */}
      <AvatarDropdown userName={userName} userAvatar={userAvatar} />
    </nav>
  );
}
