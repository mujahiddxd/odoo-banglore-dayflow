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
    <nav className="w-full bg-[var(--uxsg-paper)] px-4 py-4 flex items-center gap-6 sticky top-0 z-50 border-b-2 border-[var(--uxsg-ink)] shadow-[0_4px_0_rgba(0,0,0,0.05)]">
      {/* Company Logo / Name */}
      <div className="flex items-center gap-3 mr-2">
        <div className="w-10 h-10 rounded-full bg-[var(--uxsg-teal)] flex items-center justify-center sketchy-border overflow-hidden">
          <span className="font-headline text-lg font-bold text-[var(--uxsg-ink)]">
            {companyName ? companyName.charAt(0).toUpperCase() : 'O'}
          </span>
        </div>
        <span className="font-headline text-[var(--uxsg-ink)] text-2xl hidden sm:block font-bold">
          {companyName || 'Odoo'}
        </span>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-6">
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
              className={`font-body text-sm font-bold transition-all hover:-translate-y-0.5 ${(isActive || isEmployeesActive) ? 'text-[var(--uxsg-ink)] wavy-underline-yellow text-base' : 'text-gray-500 hover:text-[var(--uxsg-ink)]'}`}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border-2 border-[var(--uxsg-ink)] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-[var(--uxsg-ink)] placeholder-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_var(--uxsg-teal)] transition-all"
          />
        </div>
      </div>

      {/* Profile Avatar */}
      <AvatarDropdown userName={userName} userAvatar={userAvatar} />
    </nav>
  );
}
